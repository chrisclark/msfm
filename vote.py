from sqlalchemy import Column, Integer, Sequence, ForeignKey, SmallInteger
from db import db_session, Base
from flask import json

class Vote(Base):

    __tablename__ = "votes"
    
    id = Column(Integer, Sequence('vote_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    playlist_item_id = Column(Integer, ForeignKey('playlist_items.id'))
    
    #1 = upvote
    #0 = downvote
    direction = Column(SmallInteger)
    
    def __init__(self, id=None, user_id=None, playlist_item_id=None, direction=None):
        self.id = id
        self.user_id = user_id
        self.playlist_item_id = playlist_item_id
        self.direction = direction
        
    def save(self):
        db_session.add(self)
        db_session.commit()
        
    def to_json(self):
        d = dict()
        d["user_id"] = self.user_id
        d["playlist_item_id"] = self.playlist_item_id
        d["direction"] = self.direction
        return json.dumps(d)
                
    @staticmethod
    def parseVote(val):
        try:
            parsed = int(val)
            ret = -1
            if parsed > 0:
                ret = 1
            return ret
        except:
            return 0