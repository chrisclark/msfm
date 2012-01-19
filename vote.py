from sqlalchemy import Column, Integer, Sequence, ForeignKey, Boolean
from sqlalchemy.orm import relationship, backref
from db import db_session, Base

class Vote(Base):

    __tablename__ = "votes"
    
    id = Column(Integer, Sequence('vote_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    playlist_item_id = Column(Integer, ForeignKey('playlist_items.id'))
    
    #1 = upvote
    #0 = downvote
    direction = Column(Boolean)
    
    def __init__(self, id=None, user_id=None, playlist_item_id=None, direction=None):
        self.id = id
        self.user_id = user_id
        self.playlist_item_id = playlist_item_id
        self.direction = direction
        
    def save(self):
        db_session.add(self)
        db_session.commit()