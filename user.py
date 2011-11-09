from sqlalchemy import Column, Integer, String, Sequence, DateTime
from db import db_session, Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    username = Column(String(60))
    email = Column(String(60))
    facebook_id = Column(String(60))
    created = Column(DateTime)
    real_name = Column(String(128))
    
    def __init__(self, id=None, username=None, email=None, facebook_id=None):
        self.id = id
        self.username = username
        self.pwdhash = pwdhash
        self.email = email
        self.facebook_id = facebook_id
        
    def register(self):
        if self.id:
            pass
        
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<User('%s','%s', '%s')>" % (str(self.id), self.username, self.facebook_id)