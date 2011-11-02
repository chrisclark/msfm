from sqlalchemy import Column, Integer, String, Sequence, Boolean, DateTime
from db import db_session, Base

class User(Base):
    __tablename__ = 'users'
    
    uid = Column(Integer, Sequence('user_id_seq'), primary_key=True)
    username = Column(String(60))
    pwdhash = Column(String())
    email = Column(String(60))
    facebookid = Column(String(60))
    activate = Column(Boolean)
    created = Column(DateTime)