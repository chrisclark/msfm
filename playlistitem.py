from sqlalchemy import Column, Integer, Sequence, ForeignKey, Boolean
from sqlalchemy.orm import relationship, backref
from db import db_session, Base
from location import Location

class PlaylistItem(Base):
    "the playlist stores the ranking information for a given location"
    
    __tablename__ = 'playlist_items'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    location_id = Column(Integer, ForeignKey('locations.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
    added_by_user_id = Column(Integer, ForeignKey('users.id'))
    score = Column(Integer)
    done_playing = Boolean()
    
    location = relationship("Location", primaryjoin=(location_id==Location.id), backref=backref('playlist_items', order_by=id))
    track = relationship("Track")
    
    def __init__(self, id=None, location_id=None, track_id=None, added_by_user_id=None, score=0):
        self.id = id
        self.location_id = location_id
        self.track_id = track_id
        self.added_by_user_id = added_by_user_id
        self.score = score
        self.done_playing = False
        
    def save(self):
        db_session.add(self)
        db_session.commit()
        
    def copy_from(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<playlist_item(id: '%s',location_id: '%s')>" % (str(self.id), str(self.location_id))
        