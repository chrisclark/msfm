from track import Track
import urllib
import common
from flask import json

class MusicProvider:
    _soundCloudClientId = '84926ddd328617c81cbbcfc03942dcb4'
    _mnDigitalIntegrationAPIKey = 'H7KQUnTksrwQtsNKfWF2JBKgX'
    
    @staticmethod
    def search(query):
        ######MediaNet######
        reqUrl = 'http://ie-api.mndigital.com?method=Search.GetTracks&format=json&'\
                 + urllib.urlencode({'keyword': query})\
                 + '&page=1&pageSize=10&apiKey=%s' % MusicProvider._mnDigitalIntegrationAPIKey

        r = common.get_json(reqUrl)

        serialize_me = []
        
        for t in r["Tracks"]:
            dic = dict()
            dic["provider_id"] = t["MnetId"]
            dic["artist"] = t["Artist"]["Name"]
            dic["title"] = t["Title"]
            dic["length_seconds"] = 0
            dic["length_friendly"] = t["Duration"]
            dic["url"] = ""
            dic["album"] = t["Album"]["Title"]
            serialize_me.append(dic)
            
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
            
        except Exception:
            pass
        return t