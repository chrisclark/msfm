from sqlalchemy import Column, Integer, String, Sequence
from db import db_session, Base

class Location(Base):
    __tablename__ = 'locations'
    
    id = Column(Integer, Sequence('location_id_seq'), primary_key=True)
    name = Column(String(128))
    description = Column(String(1024))
    
    def __init__(self, name=None, id=None):
        if id:
            self.id = id
            self.loadById()
        elif name:
            self.name = name
            self.loadByName()
    
    def loadByName(self):
        l = db_session.query(Location).filter_by(name=self.name).first()
        if not l:
            db_session.add(self)
            db_session.commit() #this also refreshes self with the updated ID
        else:
            self.copyFrom(l)
    
    def loadById(self):
        pass
    
    def copyFrom(self, src):
        #might have to change if we get more complex properties
        self.__dict__ = src.__dict__.copy()
    
    def __repr__(self):
        return "<Location('%s','%s')>" % (self.name, str(self.id))
        