from sqlalchemy import Column, Integer, Sequence, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship, backref
from db import db_session, Base
from location import Location

class PlaylistItem(Base):
    
    __tablename__ = 'playlist_items'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    location_id = Column(Integer, ForeignKey('locations.id'))
    track_id = Column(Integer, ForeignKey('tracks.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    done_playing = Column(Boolean)
    date_added = Column(DateTime)
    bumped = Column(Boolean)
    date_played = Column(DateTime)
    special = Column(Boolean)
    
    location = relationship("Location", primaryjoin=(location_id==Location.id), backref=backref('playlist_items', order_by=id))
    votes = relationship("Vote")
    
    def __init__(self, id=None, location_id=None, track_id=None, user_id=None, date_added=None, date_played=None, special=False):
        self.id = id
        self.location_id = location_id
        self.track_id = track_id
        self.user_id = user_id
        self.date_added = date_added
        self.done_playing = False
        self.bumped = False
        self.date_played = date_played
        self.special = special
    
    def save(self):
        db_session.add(self)
        db_session.commit()
    
    def __repr__(self):
        return "<playlist_item(id: '%s',location_id: '%s')>" % (str(self.id), str(self.location_id))
        