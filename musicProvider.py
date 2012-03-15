from track import Track
import urllib
import common
from flask import json

class MusicProvider:
    _mnDigitalIntegrationAPIKey = 'H7KQUnTksrwQtsNKfWF2JBKgX'
    
    @staticmethod
    def search(**kwargs):
        ######MediaNet######
        qs_append=""
        for key in kwargs:
            qs_append = qs_append + "&" + urllib.urlencode({key: kwargs[key]})
        reqUrl = 'http://ie-api.mndigital.com?method=Search.GetTracks&format=json'\
                 + qs_append + '&page=1&pageSize=10&apiKey=%s' % MusicProvider._mnDigitalIntegrationAPIKey

        r = common.get_json(reqUrl)

        serialize_me = []
        
        for t in r["Tracks"]:
            try:
                dic = dict()
                dic["provider_id"] = t["MnetId"]
                dic["artist"] = t["Artist"]["Name"]
                dic["title"] = t["Title"]
                dic["length_seconds"] = 0
                dic["length_friendly"] = t["Duration"]
                dic["url"] = ""
                dic["album"] = t["Album"]["Title"]
                dic["art_url"] = t["Album"]["Images"]["Album150x150"]
                serialize_me.append(dic)
            except:
                pass
        return serialize_me
    
    @staticmethod
    def get_track(provider_id):
        t = Track()
        try:
            ######MediaNet######
            reqUrl = 'http://ie-api.mndigital.com?method=track.get&format=json&'\
                 + urllib.urlencode({'mnetid': provider_id})\
                 + '&ApiKey=%s' % MusicProvider._mnDigitalIntegrationAPIKey
                          
            track_json = common.get_json(reqUrl)["Track"]
            
            t.provider_id = provider_id
            t.artist = track_json["Artist"]["Name"]
            t.title = track_json["Title"]
            t.length_seconds = 0
            t.length_friendly = track_json["Duration"]
            t.url = ""
            t.album = track_json["Album"]["Title"]
            t.art_url = track_json["Album"]["Images"]["Album150x150"]
            
        except Exception:
            pass
        return t