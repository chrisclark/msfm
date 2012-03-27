from sqlalchemy import Column, Integer, String, Sequence, ForeignKey
from db import db_session, Base, jug
from datetime import datetime
import common
from musicLibrary import MusicLibrary
from user import User
from vote import Vote
from flask import session
import decimal

class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    name = Column(String(128))
    description = Column(String(1024))
    marketing_message = Column(String(1024))
    #need the use_alter here because otherwise we get a circular reference b/t this and playlist_items
    #use_alter defers the creation of this primary key
    currently_playing = Column(Integer, ForeignKey('playlist_items.id', use_alter=True, name="fk_locations_currently_playing_pli_id"))
    
    _playlist = None
    
    def __init__(self, name=None, id=None, currently_playing=None):
        self.id = id
        self.name = name
        self.currently_playing = currently_playing
        
    def save(self):
        db_session.add(self)
        db_session.commit() #this also refreshes self with the updated ID
    
    def playlist(self):
        pl = Playlist(loc_id=self.id, cur_pli_id=self.currently_playing)
        for pli, t, u in db_session.query(PlaylistItem, Track, User).\
                                filter(PlaylistItem.location_id == self.id).\
                                filter(Track.id == PlaylistItem.track_id).\
                                filter(PlaylistItem.user_id == User.id).\
                                filter(PlaylistItem.done_playing == False).\
                                filter(PlaylistItem.bumped == False):             
            pl.queue.append((t, pli, u))
        return pl
        
    def mark_playing(self, playlist_item_id):
        self.currently_playing = playlist_item_id
        self.save()
        self.update_subscribers()
    
    def bump(self, playlist_item_id):
        pli = db_session.query(PlaylistItem).filter(PlaylistItem.id == playlist_item_id).first()
        pli.bumped = True
        pli.save()
        self.update_subscribers()
    
    def mark_played(self, playlist_item_id):
        pli = db_session.query(PlaylistItem).filter(PlaylistItem.id == playlist_item_id).first()
        pli.done_playing = True
        pli.date_played = str(datetime.now())
        pli.save()
        self.update_subscribers()
        
    def flash(self, msg):
        self.marketing_message = msg
        self.save()
        jug.publish('msfm:marketing:%s' % self.id, msg)
        
    def vote(self, pli_id, direc):
        if not "voted_arr" in session: session["voted_arr"] = []
        voted = session["voted_arr"]
        if User.is_admin() or not pli_id in voted:
            v = Vote(playlist_item_id=pli_id, user_id=User.current_id(), direction=direc)
            v.save()
            voted.append(pli_id)
            session["voted_arr"] = voted  
            self.update_subscribers()
            return common.buildDialogResponse("Thanks for the input!", 200)
        else:
            return common.buildDialogResponse("Nice try sucka! You already voted", 409)
    
    def leaderboard(self, hrs=0):
        conn = db_session.connection()
        #TODO: Better sql here. This is pretty weak sauce
        #this is a special case to handle the "all time" leaderboard (hrs=0)
        if hrs == 0: query = "select u.id as user_id, u.first_name, u.last_name, u.photo_url, u.facebook_id, sum(direction) as score from votes v inner join playlist_items pi on v.playlist_item_id = pi.id inner join users u on pi.user_id = u.id where pi.location_id = %s group by pi.user_id order by score desc limit 10;" % (self.id)
        else: query = "select u.id as user_id, u.first_name, u.last_name, u.photo_url, u.facebook_id, sum(direction) as score from votes v inner join playlist_items pi on v.playlist_item_id = pi.id inner join users u on pi.user_id = u.id where pi.location_id = %s and v.timestamp > DATE_SUB(NOW(), INTERVAL %s HOUR) group by pi.user_id order by score desc limit 10;" % (self.id, str(hrs))  
        leaders = conn.execute(query)
        ret = []
        for row in leaders:
            newrow = dict() #necessary because the SQLALCHEMY row doesn't support value updates
            for k in row.keys():
                if isinstance(row[k], decimal.Decimal): newrow[k] = int(row[k])
                elif k == "last_name" and not User.is_admin(): newrow[k] = row[k][0] #only get first letter of last name if its not an admin 
                else: newrow[k] = row[k]
            ret.append(newrow)
        return ret

    @staticmethod
    def from_name(location_name):
        l = db_session.query(Location).filter_by(name=location_name).first()
        return l
    
    @staticmethod
    def from_id(location_id):
        l = db_session.query(Location).filter_by(id=location_id).first()
        return l
    
    def update_subscribers(self):
        jug.publish('msfm:playlist:%s' % self.id, self.playlist().to_json())
    
    def add_track(self, prov_id, user_id, special):
        
        #make sure it's in the DB
        t = MusicLibrary.get_track(provider_id=prov_id)
        
        if not User.is_admin() and self._numTracksFromUser(user_id) > 2:
            return common.buildDialogResponse("You can only have 3 songs on the playlist at once :(", 409)

        if self.playlist().contains_track(t.id):
            return common.buildDialogResponse("Someone already added that one (but you can go vote it up).", 409)
        
        PlaylistItem(track_id=t.id, location_id=self.id, user_id=user_id, date_added=str(datetime.now()), special=special).save()
        self.update_subscribers()
        return common.buildDialogResponse("Song added!", 200)
        
    def _numTracksFromUser(self, uid):
        return db_session.query(PlaylistItem).\
            filter_by(user_id=uid).\
            filter_by(done_playing=False).\
            filter_by(bumped=False).\
            filter_by(location_id=self.id).count()
    
    def __repr__(self):
        return "<Location('%s','%s')>" % (self.name, str(self.id))
    
from playlistitem import PlaylistItem
from playlist import Playlist
from track import Track
        