from flask import json
from sqlalchemy import Column, Integer, String, Sequence
from db import db_session, Base
import common

class Track(Base):
    "a single track of music"
    
    __tablename__ = "tracks"
    
    id = Column(Integer, Sequence('track_id_seq'), primary_key=True)
    provider_id = Column(String(256))
    artist = Column(String(256))
    title = Column(String(256))
    length_seconds = Column(Integer)
    length_friendly = Column(String(16))
    url = Column(String(1024))
    album = Column(String(1024))
    
    def __init__(self, id=None, provider_id=None, artist=None, title=None, length_seconds=None, length_friendly=None, url=None, album=None):
        self.id = id
        self.provider_id = provider_id
        self.artist = artist
        self.title = title
        self.length_seconds = length_seconds
        self.length_friendly = length_friendly
        self.url = url
        self.album = album

    def to_json(self):
        return json.dumps(common.strip_private(self.__dict__))
    
    def __repr__(self):
        return "<track(id: '%s',title: '%s')>" % (str(self.id), str(self.title))