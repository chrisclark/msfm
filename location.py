from sqlalchemy import Column, Integer, String, Sequence
from db import db_session, Base

class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    name = Column(String(128))
    description = Column(String(1024))
    playlist = None
    
    def __init__(self, name=None, id=None):
        self.id = id
        self.name = name
        if self.id:
            self.load_playlist()
        
    def save(self):
        db_session.add(self)
        db_session.commit() #this also refreshes self with the updated ID
    
    def load_playlist(self):
        self.playlist = Playlist.from_location_id(self.id)
    
    @staticmethod
    def from_name(location_name):
        l = db_session.query(Location).filter_by(name=location_name).first()
        return l
    
    @staticmethod
    def from_id(location_id):
        l = db_session.query(Location).filter_by(id=location_id).first()
        return l
    
    def add_track(self, track_id):
        PlaylistItem(track_id=track_id, location_id=self.id).save()
    
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<Location('%s','%s')>" % (self.name, str(self.id))
    
from playlistitem import PlaylistItem
from playlist import Playlist
        