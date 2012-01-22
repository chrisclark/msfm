from flask import Flask, render_template, request
from db import db_session, init_db
from flask import json
import common
import sys

from location import Location
from musicLibrary import MusicLibrary
from playlistitem import PlaylistItem
from user import User
from vote import Vote
import config

app = Flask(__name__)
app.debug = config.debugMode

import logging
from logging import FileHandler
file_handler = FileHandler('log.txt', mode='a', encoding=None, delay=False)
file_handler.setLevel(logging.WARNING)
app.logger.addHandler(file_handler)
app.secret_key = config.secret_key

##########  API Routes ##########

@app.route('/<location_name>')
def index(location_name):
    return render_template('client.html')

@app.route('/venue/<location_name>')
def venue(location_name):
    return render_template('venue.html')

@app.route('/vote', methods=['POST'])
def voteup():
    v = Vote(playlist_item_id=request.form["playlist_item_id"],\
             user_id=User.current().id,\
             direction=request.form["direction"])
    v.save()
    return ""

@app.route('/location_by_name/<location_name>')
def get_location(location_name):
    l = Location.from_name(location_name)
    if not l:
        l = Location(name=location_name)
        l.save()
    return str(l.id)

@app.route('/playlist/<int:location_id>')
def getPlaylist(location_id):
    l = Location.from_id(location_id)
    if not l:
        l = Location(name='whatever')
        l.save()
    l.load_playlist()
    return l.playlist.to_json()

@app.route('/search/<query>')
def getSearch(query):
    return MusicLibrary.search(query).to_json()

@app.route('/track/<track_id>')
def getTrack(track_id):
    return MusicLibrary.get_track(id=track_id).to_json()

@app.route('/add_track', methods=['POST'])
def addTrack():
    track_id = request.form["track_id"]
    location_id = request.form["location_id"]
    l = Location.from_id(location_id)
    l.add_track(track_id, User.current().id)
    return ""

@app.route('/mark_played', methods=['POST'])
def markPlayed():
    pli = db_session.query(PlaylistItem).filter(PlaylistItem.id == request.form["id"]).first()
    pli.done_playing = True
    pli.save()
    
@app.route('/login', methods=['POST'])
def login():
    fbid = request.form["fbid"]
    fbat = request.form["fbat"]
    profile_info = common.get_json('http://graph.facebook.com/' + fbid)
    u = User.from_fbid(request.form["fbid"])
    if not u:
        u = User(facebook_id=fbid,\
                 facebook_access_token=fbat,\
                 first_name=profile_info["first_name"],\
                 last_name=profile_info["last_name"],\
                 photo_url="http://graph.facebook.com/"+fbid+"/picture")
    u.login()
    return json.dumps(True)

##########  Static and Special Cases ##########

@app.route('/')
def home():
    return "Homepage"

@app.route('/favicon.ico')
def favicon():
    return ''

@app.route('/initdbwithdrop/<pwd>')
def initdbwithdrop(pwd):
    if pwd == config.adminpass:
        try:
            init_db(1)
            return "success!"
        except:
            return sys.exc_info()[0]
    else:
        return "bad bassword"

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
