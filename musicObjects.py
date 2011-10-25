from flask import json

class track:
    "a single track of music"
    def __init__(self, id, artist, title, length, url):
        self.id = id
        self.artist = artist
        self.title = title
        self.length = length
        self.url = url

class playlist:
    "a playlist, corresponding to a location"
    def __init__(self, id=None):
        self.queue = []
    def addTrack(self, t):
        self.queue.append(t)
    def _encode(self, obj):
        return {'artist': obj.artist, 'title': obj.title, 'length': obj.length, 'id': obj.id, 'url': obj.url}
    def toJson(self):
        return json.dumps(self.queue, default=self._encode)
    