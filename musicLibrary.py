from track import Track
from db import db_session
from musicProvider import MusicProvider
from playlist import Playlist

class MusicLibrary:
    
    @staticmethod
    def get_track(id=None, provider_id=None):
        ret = None
        if id:
            ret = db_session.query(Track).filter_by(id=id).first()
        elif provider_id:
            t = db_session.query(Track).filter_by(provider_id=provider_id).first()
            if t:
                ret = t
            else:
                ret = MusicProvider.get_track(provider_id)
                db_session.add(ret)
                db_session.commit()
        return ret
    
    @staticmethod
    def search(query):
        results_from_provider = MusicProvider.search(query)
        search_results = Playlist()
        for r in results_from_provider.queue:
            #ensures each track gets saved to the database
            t = MusicLibrary.get_track(provider_id = r[0].provider_id)
            search_results.add_track(t)
        return search_results