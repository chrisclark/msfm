from playlistitem import PlaylistItem
from user import User
from db import db_session
from track import Track
from flask import json
import common

class Playlist:
    
    #this should really be rewritten to use a JOINed sql alchemy mapper
    
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
        return pl
                
    def add_track(self, t, pli=None, u=None):
        self.queue.append((t, pli, u))

    def to_json(self):
        serialize_me = []
        
        for i in self.queue:
            t = i[0]
            pli = i[1]
            u = i[2]
            
            dic = common.strip_private(t.__dict__)
            
            #kind of janky, but a playlist can consist of just
            #tracks (search results) and have no plis or users
            if pli:
                dic["score"] = pli.score()
                dic["playlist_item_id"] = pli.id
            if u:
                dic["last_name"] = u.last_name
                dic["first_name"] = u.first_name
                dic["photo_url"] = u.photo_url 
                dic["user_id"] = u.id
            
            serialize_me.append(dic)
        return json.dumps(serialize_me)