from sqlalchemy import Column, Integer, String, Sequence, ForeignKey
from sqlalchemy.orm import relationship, backref
from db import db_session, Base

class Playlist(Base):
    __tablename__ = 'playlists'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    location_id = Column(Integer, ForeignKey('locations.id'))
    
    def __init__(self, id=None):
        if id:
            self.id = id
            self.loadById()
            
    def loadById(self):
        pass
    
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<Playlist(id: '%s',location_id: '%s')>" % (str(self.id), str(self.location_id))
        