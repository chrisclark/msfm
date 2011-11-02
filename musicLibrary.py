from track import Track, Tracklist
import config
import urllib
import common

class MusicLibrary:
    @staticmethod
    def search(query):
        reqUrl = 'http://api.soundcloud.com/tracks.json?client_id=%s&filter=streamable&limit=10&'\
                  % (config.soundCloudClientId) + urllib.urlencode({'q': query})
                  
        r = common.getJson(reqUrl)
        pl = Tracklist()
        for t in r:
            pl.addTrack(Track(t["id"],
                              t["user"]["username"],
                              t["title"],
                              t["duration"]/1000,
                              t["stream_url"] + '?client_id=' + config.soundCloudClientId))
        return pl