from flask import json
from sqlalchemy import Column, Integer, String, Sequence
from db import db_session, Base

class Track(Base):
    "a single track of music"
    
    __tablename__ = "tracks"
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    provider_id = Column(String(256))
    artist = Column(String(256))
    title = Column(String(256))
    length_seconds = Column(Integer)
    url = Column(String(1024))
    
    def __init__(self, id=None, provider_id=None, artist=None, title=None, length_seconds=None, url=None):
        self.id = id
        self.provider_id = provider_id
        self.artist = artist
        self.title = title
        self.length_seconds = length_seconds
        self.url = url
        
    def load_by_provider_id(self):
        if self.provider_id:
            t = db_session.query(Track).filter_by(provider_id=self.provider_id).first()
            if t:
                self.copyFrom(t)
            else:
                self.copyFrom(MusicLibrary.get_track(self.provider_id))
                
            db_session.add(self)
            db_session.commit()
        
    def load_by_id(self):
        t = db_session.query(Track).filter_by(id=self.name).first()
        if t:
            self.copyFrom(t)

    def to_json(self):
        return json.dumps(self, default=Track._serialize)
    
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    @staticmethod
    def _serialize(track):
        return {'artist': track.artist,
                'title': track.title,
                'length_seconds': track.length_seconds,
                'id': track.id,
                'url': track.url,
                'provider_id': track.provider_id}
    
class Tracklist:
    "a list of tracks"
    def __init__(self):
        self.queue = []
    def add_track(self, t):
        self.queue.append(t)
    def to_json(self):
        return json.dumps(self.queue, default=Track._serialize)

from musicLibrary import MusicLibrary