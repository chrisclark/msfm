from flask import Flask, render_template, request
from db import db_session, init_db
import sys

from location import Location
from track import Track
from musicLibrary import MusicLibrary
import config

app = Flask(__name__)
app.debug = config.debugMode

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

##########  API Routes ##########

@app.route('/<location_name>')
def index(location_name):
    l = Location(name=location_name)
    return render_template(
                           'locationHome.html',
                           location_name=l.name,
                           location_id=l.id)

@app.route('/playlist/<int:location_id>')
def getPlaylist(location_id):
    return MusicLibrary.search("test").toJson()

@app.route('/search/<query>')
def getSearch(query):
    return MusicLibrary.search(query).toJson()

@app.route('/track/<track_id>')
def getTrack(track_id):
    return Track(track_id, load=True).toJson()

@app.route('/addTrack', methods=['POST'])
def addTrack():
    tid = request.form["track_id"]
    pass


##########  SpecialHandlers ##########  
@app.errorhandler(500)
def error500(e):
    return str(e)

@app.teardown_request
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == '__main__':
    app.run(host=config.host, port=config.port)
