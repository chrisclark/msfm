from playlistitem import PlaylistItem
from db import db_session
from track import Track
from flask import json

class Playlist:
    
    #this should really be rewritten to use a JOINed sql alchemy mapper
    
    def __init__(self, loc_id=None):
        self.queue = []
        if loc_id:
            self.location_id = loc_id
            for pli, t in db_session.query(PlaylistItem, Track).\
                                filter(PlaylistItem.location_id == loc_id).\
                                filter(Track.id == PlaylistItem.track_id):
                self.add_track(t, pli)
                
    def add_track(self, t, pli=None):
        self.queue.append((t, pli))

    def to_json(self):
        serialize_me = []
        score = 0
        for i in self.queue:
            t = i[0]
            pli = i[1]
            if pli:
                score = pli.score #works for now since this is the only property from pli that we use
            serialize_me.append(dict({'artist': t.artist,
                                        'score': score,
                                        'title': t.title,
                                        'length': t.length_seconds,
                                        'url': t.url,
                                        'track_id': t.id,
                                        'provider_id': t.provider_id
                                        }))
        return json.dumps(serialize_me)