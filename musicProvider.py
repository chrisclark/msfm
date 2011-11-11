from track import Track
from playlist import Playlist
import urllib
import common
from flask import json

class MusicProvider:
    _soundCloudClientId = '84926ddd328617c81cbbcfc03942dcb4'
    
    @staticmethod
    def search(query):
        reqUrl = 'http://api.soundcloud.com/tracks.json?client_id=%s&filter=streamable&limit=10&'\
                  % (MusicProvider._soundCloudClientId) + urllib.urlencode({'q': query})
                  
        r = common.get_json(reqUrl)

        res = Playlist()
        for t in r:
            res.add_track(Track(provider_id=t["id"],
                              artist=t["user"]["username"],
                              title=t["title"],
                              length_seconds=t["duration"]/1000,
                              url=t["stream_url"] + '?client_id=' + MusicProvider._soundCloudClientId))
            
        return res
    
    @staticmethod
    def get_track(provider_id):
        t = Track()
        try:
            reqUrl = 'http://api.soundcloud.com/tracks/%s.json?client_id=%s'\
                          % (provider_id, MusicProvider._soundCloudClientId)
                          
            soundcloud_track_json = common.get_json(reqUrl)
            
            t.provider_id = provider_id
            t.artist = soundcloud_track_json["user"]["username"]
            t.title = soundcloud_track_json["title"]
            t.length_seconds = soundcloud_track_json["duration"]/1000
            t.url = soundcloud_track_json["stream_url"] + '?client_id=' + MusicProvider._soundCloudClientId
        except Exception:
            pass
        
        return t