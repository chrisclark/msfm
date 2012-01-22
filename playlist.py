from playlistitem import PlaylistItem
from user import User
from db import db_session
from track import Track
from flask import json

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
        score = 0
        for i in self.queue:
            t = i[0]
            pli = i[1]
            u = i[2]
            
            #kind of janky, but a playlist can consist of just
            #tracks (search results) and have no plis or users
            score = -1
            playlist_item_id = -1
            if pli:
                score = pli.score()
                playlist_item_id = pli.id
            last_name = ""
            first_name = ""
            photo_url = ""
            user_id = -1
            if u:
                last_name = u.last_name
                first_name = u.first_name
                photo_url = u.photo_url 
                user_id = u.id
            
            serialize_me.append(dict({'artist': t.artist,
                                        'title': t.title,
                                        'album': t.album,
                                        'length_friendly': t.length_friendly,
                                        'url': t.url,
                                        'track_id': t.id,
                                        'provider_id': t.provider_id,
                                        'playlist_item_id': playlist_item_id,
                                        'score': score,
                                        'last_name': last_name,
                                        'first_name': first_name,
                                        'photo_url': photo_url,
                                        'user_id': user_id
                                        }))
        return json.dumps(serialize_me)