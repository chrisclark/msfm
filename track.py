from flask import json
import config
import common

class Track:
    "a single track of music"
    def __init__(self, id, artist='', title='', length='', url='', load=False):
        self.id = id
        if not load:
            self.artist = artist
            self.title = title
            self.length = length
            self.url = url
        else:
            reqUrl = 'http://api.soundcloud.com/tracks/%s.json?client_id=%s'\
                      % (id, config.soundCloudClientId)
                      
            t = common.getJson(reqUrl)
            
            self.artist = t["user"]["username"]
            self.title = t["title"]
            self.length = t["duration"]/1000
            self.url = t["stream_url"]
    def toJson(self):
        return json.dumps(self, default=common.serializeTrack)
    
class Tracklist:
    "a list of tracks"
    def __init__(self):
        self.queue = []
    def addTrack(self, t):
        self.queue.append(t)
    def toJson(self):
        return json.dumps(self.queue, default=common.serializeTrack)