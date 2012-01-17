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

    def to_json(self):
        return json.dumps(self, default=self._serialize)
    
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def _serialize(self, track):
        return {'artist': track.artist,
                'title': track.title,
                'length_seconds': track.length_seconds,
                'id': track.id,
                'url': track.url,
                'provider_id': track.provider_id}
        
    def __repr__(self):
        return "<track(id: '%s',title: '%s')>" % (str(self.id), str(self.title))