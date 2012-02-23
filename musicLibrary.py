from track import Track
from db import db_session
from musicProvider import MusicProvider

class MusicLibrary:
    
    @staticmethod
    def get_track(id=None, provider_id=None):
        ret = None
        if id:
            ret = db_session.query(Track).filter_by(id=id).first()
        elif provider_id:
            #might already be in there
            ret = db_session.query(Track).filter_by(provider_id=provider_id).first()
            if ret == None:
                ret = MusicProvider.get_track(provider_id)
                db_session.add(ret)
                db_session.commit()
        return ret
    
    @staticmethod
    def search(**kwargs):
        return MusicProvider.search(**kwargs)
        