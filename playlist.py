from playlistitem import PlaylistItem
from db import db_session
from track import Track
from flask import json

class Playlist:
    
    def __init__(self, loc_id):
        self.location_id = loc_id
        self.queue = []
        for pli, t in db_session.query(PlaylistItem, Track).\
                            filter(PlaylistItem.location_id == loc_id).\
                            filter(Track.id == PlaylistItem.track_id):
            self.queue.append(dict({'artist': t.artist,
                                    'score': pli.score,
                                    'title': t.title,
                                    'length': t.length_seconds,
                                    'url': t.url,
                                    'track_id': t.id,
                                    'track_provider_id': t.provider_id
                                    }))

    def to_json(self):
        return json.dumps(self.queue)