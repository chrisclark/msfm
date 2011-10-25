import requests
import urllib
from flask import json

import config
import musicObjects as mo

def search(query):
    reqUrl = 'http://api.soundcloud.com/tracks.json?client_id=%s&filter=streamable&limit=10&' % (config.soundCloudClientId) + urllib.urlencode({'q': query})
    r = requests.get(reqUrl)
    ctnt = r.content
    r = json.loads(ctnt)
    pl = mo.playlist()
    for t in r:
        pl.addTrack(mo.track(t["id"], t["user"]["username"], t["title"], t["duration"]/1000, t["stream_url"] + '?client_id=' + config.soundCloudClientId))
    return pl