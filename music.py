from flask import Flask, render_template, request
from db import db_session, init_db
import sys

from location import Location
from track import Track
from musicLibrary import MusicLibrary
import config

app = Flask(__name__)
app.debug = config.debugMode

##########  API Routes ##########

@app.route('/venue/<location_name>')
def venue(location_name):
    l = Location(name=location_name)
    return render_template(
                           'venueHome.html',
                           location_name=l.name,
                           location_id=l.id)

@app.route('/<location_name>')
def index(location_name):
    l = Location(name=location_name)
    return render_template(
                           'client.html',
                           location_name=l.name,
                           location_id=l.id)

@app.route('/playlist/<int:location_id>')
def getPlaylist(location_id):
    l = Location(id=location_id)
    return l.playlist.to_json()

@app.route('/search/<query>')
def getSearch(query):
    return MusicLibrary.search(query).to_json()

@app.route('/track_by_provider_id/<track_provider_id>')
def getTrack(track_provider_id):
    t = Track(provider_id=track_provider_id)
    t.load_by_provider_id()
    ret = t.to_json()
    return ret

@app.route('/add_track', methods=['POST'])
def addTrack():
    track_provider_id = request.form["track_provider_id"]
    location_id = request.form["location_id"]
    l = Location(name='', id=location_id)
    t = Track(provider_id=track_provider_id)
    t.load_by_provider_id()
    l.add_track(t)

##########  Static and Special Cases ##########

@app.route('/')
def home():
    return "Homepage"

@app.route('/favicon.ico')
def favicon():
    return ''

@app.route('/initdb/<pwd>')
def initdb(pwd):
    if pwd == config.adminpass:
        try:
            init_db()
            return "success!"
        except:
            return sys.exc_info()[0]
    else:
        return "bad bassword"

##########  SpecialHandlers ##########  

@app.errorhandler(500)
def error500(e):
    return str(e)

@app.teardown_request
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == '__main__':
    app.run(host=config.host, port=config.port)
