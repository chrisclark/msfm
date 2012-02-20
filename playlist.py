from playlistitem import PlaylistItem
from location import Location
from user import User
from db import db_session
from track import Track
from flask import json
from operator import itemgetter
import time
import common

class Playlist:
    
    def __init__(self, loc_id=None):
        self.queue = []
        self.loc_id = loc_id
            
    @staticmethod
    def from_location_id(location_id):
        pl = Playlist(location_id)
        for pli, t, u in db_session.query(PlaylistItem, Track, User).\
                                filter(PlaylistItem.location_id == location_id).\
                                filter(Track.id == PlaylistItem.track_id).\
                                filter(PlaylistItem.user_id == User.id).\
                                filter(PlaylistItem.done_playing == False):             
            pl.add_track(t, pli, u)
        pl.loc_id = location_id
        return pl
                
    def add_track(self, t, pli=None, u=None):
        self.queue.append((t, pli, u))
            
    def contains_track(self, track_id):
        return str(track_id) in [str(x[0].id) for x in self.queue]
        
    def to_json(self):
        serialize_me = []
        
        cur_playing_pli_id = Location.from_id(self.loc_id).currently_playing    
        
        cur_playing_pli = None
        
        for i in self.queue:
            t = i[0]
            pli = i[1]
            u = i[2]
            
            dic = common.strip_private(t.__dict__)
        
            dic["currently_playing"] = (pli.id == cur_playing_pli_id)
            dic["score"] = pli.score()
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