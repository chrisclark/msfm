from flask import session, json
from sqlalchemy import Column, Integer, String, Sequence, DateTime, Boolean
from db import db_session, Base
from sqlalchemy.orm import relationship
from datetime import datetime
import common

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
    admin = Column(Boolean)
    
    votes = relationship("Vote")
    playlist_items = relationship("PlaylistItem")
    
    def __init__(self, id=None,\
                 username=None,\
                 email=None,\
                 facebook_id=None,\
                 facebook_access_token=None,\
                 first_name=None,\
                 last_name=None,\
                 photo_url=None,\
                 admin=None):
        self.id = id
        self.username = username
        self.email = email
        self.facebook_id = facebook_id
        self.facebook_access_token = facebook_access_token
        self.first_name = first_name
        self.last_name = last_name
        self.photo_url = photo_url
        self.admin = admin
    
    @staticmethod
    def from_fbid(fbid):
        l = db_session.query(User).filter_by(facebook_id=fbid).first()
        return l
    
    @staticmethod
    def from_id(user_id):
        l = db_session.query(User).filter_by(id=user_id).first()
        return l
    
    @staticmethod
    def current_id():
        try:
            return session["user_id"]
        except:
            return None
    
    @staticmethod
    def is_admin():
        try:
            return User.from_id(User.current_id()).admin
        except:
            return False
    
    def save(self):
        if not self.id:
            self.created = str(datetime.now())
        db_session.add(self)
        db_session.commit()
    
    def login(self):
        self.last_login = str(datetime.now()) 
        db_session.add(self)
        self.save()
        session["user_id"] = self.id
        
    def logout(self):
        session.pop('user_id', None)
    
    def to_json(self):
        dic = dict()
        dic["user_id"] = self.id
        dic["admin"] = self.admin
        return json.dumps(dic)
    
    @staticmethod
    def facebook_login(fbid, fbat):
        u = User.from_fbid(fbid) #has this person logged in before?
        
        if not u: #if not create a new user
            u = User(facebook_id=fbid,\
                     photo_url="http://graph.facebook.com/"+fbid+"/picture?type=normal",\
                     admin=False)
        
        if User.current_id() != u.id: #don't bother with all this if they are already logged in
            #update their data. Also validates their auth token
            profile_info = common.get_json('https://graph.facebook.com/me?fields=email,first_name,last_name&access_token=' + fbat)
            if not "error" in profile_info:
                u.facebook_access_token = fbat
                u.first_name = profile_info["first_name"]
                u.last_name = profile_info["last_name"]
                u.email = profile_info["email"]
            else:
                return None
            
            u.login() #also does a save
        return u
        
    def __repr__(self):
        return "<User('%s','%s', '%s')>" % (str(self.id), self.username, self.facebook_id)