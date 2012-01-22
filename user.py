from flask import session
from sqlalchemy import Column, Integer, String, Sequence, DateTime
from db import db_session, Base
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    username = Column(String(60))
    email = Column(String(60))
    facebook_id = Column(String(60))
    created = Column(DateTime)
    facebook_access_token = Column(String(128))
    last_login = Column(DateTime)
    first_name = Column(String(128))
    last_name = Column(String(128))
    photo_url = Column(String(128))
    
    votes = relationship("Vote")
    playlist_items = relationship("PlaylistItem")
    
    def __init__(self, id=None,\
                 username=None,\
                 email=None,\
                 facebook_id=None,\
                 facebook_access_token=None,\
                 first_name=None,\
                 last_name=None,\
                 photo_url=None):
        self.id = id
        self.username = username
        self.email = email
        self.facebook_id = facebook_id
        self.facebook_access_token = facebook_access_token
        self.first_name = first_name
        self.last_name = last_name
        self.photo_url = photo_url
    
    @staticmethod
    def from_fbid(fbid):
        l = db_session.query(User).filter_by(facebook_id=fbid).first()
        return l
    
    @staticmethod
    def from_id(user_id):
        l = db_session.query(User).filter_by(id=user_id).first()
        return l
    
    @staticmethod
    def current():
        try:
            return User.from_id(session['user_id'])
        except:
            return None
    
    def save(self):
        db_session.add(self)
        db_session.commit()
    
    def login(self):
        self.last_login = str(datetime.now()) 
        db_session.add(self)
        self.save()
        session["user_id"] = self.id
        
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<User('%s','%s', '%s')>" % (str(self.id), self.username, self.facebook_id)