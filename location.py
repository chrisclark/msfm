from sqlalchemy import Column, Integer, String, Sequence
from db import db_session, Base

class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    name = Column(String(128))
    description = Column(String(1024))
    playlist = None
    
    def __init__(self, name=None, id=None):
        if id:
            self.id = id
            self.load_by_id()
        elif name:
            self.name = name
            self.load_by_name()
        self.playlist = Playlist(self.id)
    
    def load_by_name(self):
        l = db_session.query(Location).filter_by(name=self.name).first()
        if not l:
            db_session.add(self)
            db_session.commit() #this also refreshes self with the updated ID
        else:
            self.copyFrom(l)
    
    def load_by_id(self):
        l = db_session.query(Location).filter_by(id=self.id).first()
        if not l:
            db_session.add(self)
            db_session.commit()
        else:
            self.copyFrom(l)
    
    def add_track(self, t):
        pli = PlaylistItem(track_id=t.id, location_id=self.id)
        pli.save()
        pass
    
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<Location('%s','%s')>" % (self.name, str(self.id))
    
from playlistitem import PlaylistItem
from playlist import Playlist
        