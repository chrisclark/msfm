from track import Track
from playlist import Playlist
import urllib
import common
from flask import json

class MusicProvider:
    _soundCloudClientId = '84926ddd328617c81cbbcfc03942dcb4'
    _mnDigitalIntegrationAPIKey = 'H7KQUnTksrwQtsNKfWF2JBKgX'
    
    @staticmethod
    def search(query):
        ######SoundCloud######
        #reqUrl = 'http://api.soundcloud.com/tracks.json?client_id=%s&filter=streamable&limit=10&'\
        #          % (MusicProvider._soundCloudClientId) + urllib.urlencode({'q': query})
        #r = common.get_json(reqUrl)
        #res = Playlist()
        #for t in r:
        #    res.add_track(Track(provider_id=t["id"],
        #                      artist=t["user"]["username"],
        #                      title=t["title"],
        #                      length_seconds=t["duration"]/1000,
        #                      url=t["stream_url"] + '?client_id=' + MusicProvider._soundCloudClientId))
        
        
        ######MediaNet######
        reqUrl = 'http://ie-api.mndigital.com?method=Search.GetTracks&format=json&'\
                 + urllib.urlencode({'keyword': query})\
                 + '&page=1&pageSize=10&apiKey=%s' % MusicProvider._mnDigitalIntegrationAPIKey
        r = common.get_json(reqUrl)
        res = Playlist()
        for t in r["Tracks"]:
            res.add_track(Track(provider_id=t["MnetId"],
                              artist=t["Artist"]["Name"],
                              title=t["Title"],
                              length_seconds=0,
                              length_friendly=t["Duration"],
                              url="",
                              album=t["Album"]["Title"]))
            
        return res
    
    @staticmethod
    def get_track(provider_id):
        t = Track()
        try:
            ######soundcloud######
            #reqUrl = 'http://api.soundcloud.com/tracks/%s.json?client_id=%s'\
            #              % (provider_id, MusicProvider._soundCloudClientId)
            #soundcloud_track_json = common.get_json(reqUrl)
            #t.provider_id = provider_id
            #t.artist = soundcloud_track_json["user"]["username"]
            #t.title = soundcloud_track_json["title"]
            #t.length_seconds = soundcloud_track_json["duration"]/1000
            #t.url = soundcloud_track_json["stream_url"] + '?client_id=' + MusicProvider._soundCloudClientId
            
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