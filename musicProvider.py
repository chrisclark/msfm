from track import Track
import urllib
import common

class MusicProvider:
    _mnDigitalIntegrationAPIKey = 'NH4lCiCOJ6ZQCHl7MAgIcK4vr'
    
    @staticmethod
    def search(**kwargs):
        ######MediaNet######
        qs_append=""
        for key in kwargs:
            qs_append = qs_append + "&" + urllib.urlencode({key: kwargs[key]})
        #reqUrl = 'http://ie-api.mndigital.com?method=Search.GetTracks&format=json'\
        #         + qs_append + '&page=1&pageSize=10&apiKey=%s' % MusicProvider._mnDigitalIntegrationAPIKey
        reqUrl = 'http://itunes.apple.com/search?media=music&limit=10&entity=musicTrack%s' % qs_append

        r = common.get_json(reqUrl)

        serialize_me = []
        
        for t in r["results"]: #r["Tracks"]:
            try:
                dic = dict()
                #MNDIGITAL
                #dic["provider_id"] = t["MnetId"]
                #dic["artist"] = t["Artist"]["Name"]
                #dic["title"] = t["Title"]
                #dic["album"] = t["Album"]["Title"]
                #dic["art_url"] = t["Album"]["Images"]["Album150x150"]
                #dic["length_friendly"] = t["Duration"]
                dic["length_seconds"] = 0
                dic["url"] = ""
                
                #itunes
                dic["provider_id"] = t["trackId"]
                dic["artist"] = t["artistName"]
                dic["title"] = t["trackName"]
                dic["album"] = t["collectionName"]
                dic["art_url"] = t["artworkUrl100"]
                dic["length_friendly"] = 0
                
                
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