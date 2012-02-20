from sqlalchemy import Column, Integer, String, Sequence, ForeignKey
from db import db_session, Base
from datetime import datetime
import common
from musicLibrary import MusicLibrary
from flask import session

class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    name = Column(String(128))
    description = Column(String(1024))
    #need the use_alter here because otherwise we get a circular reference b/t this and playlist_items
    #use_alter defers the creation of this primary key
    currently_playing = Column(Integer, ForeignKey('playlist_items.id', use_alter=True, name="fk_locations_currently_playing_pli_id"))
    
    _playlist = None
    
    def __init__(self, name=None, id=None, currently_playing=None):
        self.id = id
        self.name = name
        self.currently_playing = currently_playing
        if id: session["location_id"] = self.id
        
    def save(self):
        db_session.add(self)
        db_session.commit() #this also refreshes self with the updated ID
    
    def playlist(self):
        if self._playlist == None:
            self._playlist = Playlist.from_location(self)
        return self._playlist
        
    def mark_playing(self, playlist_item_id):
        self.currently_playing = playlist_item_id
        self.save()
    
    @staticmethod
    def from_name(location_name):
        l = db_session.query(Location).filter_by(name=location_name).first()
        if l: session["location_id"] = l.id
        return l
    
    @staticmethod
    def from_id(location_id):
        l = db_session.query(Location).filter_by(id=location_id).first()
        if l: session["location_id"] = l.id
        return l
    
    @staticmethod
    def cur_location():
        return session["location_id"]
    
    def add_track(self, prov_id, user_id):
        
        #make sure it's in the DB
        t = MusicLibrary.get_track(provider_id=prov_id)
        
        if self._numTracksFromUser(user_id) > 2:
            return common.buildDialogResponse("You can only have 3 songs on the playlist at once :(", 409)

        if self.playlist().contains_track(t.id):
            return common.buildDialogResponse("Someone already added that one (but you can go vote it up).", 409)
        
        PlaylistItem(track_id=t.id, location_id=self.id, user_id=user_id, date_added=str(datetime.now())).save()
        return common.buildDialogResponse("Song added!", 200)
        
    def _numTracksFromUser(self, uid):
        return db_session.query(PlaylistItem).filter_by(user_id=uid).filter_by(done_playing=False).filter_by(location_id=self.id).count()
    
    def __repr__(self):
        return "<Location('%s','%s')>" % (self.name, str(self.id))
    
from playlistitem import PlaylistItem
from playlist import Playlist
        