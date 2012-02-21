from sqlalchemy import func
from playlistitem import PlaylistItem
from location import Location
from user import User
from db import db_session
from track import Track
from flask import json
from operator import itemgetter
from vote import Vote
import time
import common

class Playlist:
    
    def __init__(self, loc_id=None, cur_pli_id=None):
        self.queue = []
        self.loc_id = loc_id
        self.currently_playing_pli_id = cur_pli_id
            
    @staticmethod
    def from_location(l):
        pl = Playlist(loc_id=l.id, cur_pli_id=l.currently_playing)
        for pli, t, u in db_session.query(PlaylistItem, Track, User).\
                                filter(PlaylistItem.location_id == l.id).\
                                filter(Track.id == PlaylistItem.track_id).\
                                filter(PlaylistItem.user_id == User.id).\
                                filter(PlaylistItem.done_playing == False):             
            pl.queue.append((t, pli, u))
        return pl
            
    def contains_track(self, track_id):
        return str(track_id) in [str(x[0].id) for x in self.queue]
    
    def _get_scores(self):
        conn = db_session.connection()
        votes = conn.execute("select pi.id AS pli_id, sum(v.direction) AS score from Votes v join Playlist_items pi on v.playlist_item_id = pi.id join locations l on pi.location_id = l.id where pi.done_playing=False and l.id=" + str(self.loc_id) + " group by pi.id")
        dic = dict()
        for row in votes:
            dic[row["pli_id"]] = int(row["score"])
        return dic
        
    def to_json(self):
        serialize_me = []
        
        cur_playing_pli = None
        
        scores = self._get_scores()
        
        for i in self.queue:
            t = i[0]
            pli = i[1]
            u = i[2]
            
            if pli.id not in scores: scores[pli.id] = 0
            
            dic = common.strip_private(t.__dict__)
        
            dic["currently_playing"] = (pli.id == self.currently_playing_pli_id)
            dic["score"] = scores[pli.id]
            dic["playlist_item_id"] = pli.id
            dic["time_sort"] = time.mktime(pli.date_added.timetuple())
            
            dic["last_name"] = u.last_name
            dic["first_name"] = u.first_name
            dic["photo_url"] = u.photo_url 
            dic["user_id"] = u.id
            
            #this let's us skip an entire sort later on
            if dic["currently_playing"]:
                cur_playing_pli = dic
            else:            
                serialize_me.append(dic)
        
        serialize_me.sort(key=itemgetter("time_sort"))
        serialize_me.sort(key=itemgetter("score"), reverse=True)
        
        if cur_playing_pli:
            serialize_me.insert(0, cur_playing_pli)

        return json.dumps(serialize_me)
    
from musicLibrary import MusicLibrary