import requests
from flask import json
import md5

def getJson(url):
    r = requests.get(url)
    ctnt = r.content
    return json.loads(ctnt)

def serializeTrack(track):
    return {'artist': track.artist, 'title': track.title, 'length': track.length, 'id': track.id, 'url': track.url}

def hashPassword(pwd):
    return md5.new(pwd).digest()