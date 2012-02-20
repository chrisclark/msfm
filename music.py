from flask import Flask, render_template, request, redirect, url_for
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
from juggernaut import Juggernaut

from functools import wraps

app = Flask(__name__)
app.debug = config.debugMode
jug = Juggernaut()

import logging
from logging import FileHandler
file_handler = FileHandler('log.txt', mode='a', encoding=None, delay=False)
file_handler.setLevel(logging.WARNING)
app.logger.addHandler(file_handler)

app.secret_key = config.secret_key

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if User.current() is None:
            return common.buildDialogResponse("Please log in.", 401)
        return f(*args, **kwargs)
    return decorated_function

##########  API Routes ##########

@app.route('/<location_id>')
def index(location_id):
    l = Location.from_id(location_id)
    if not l:
        l = Location(name="whatever")
        l.save()
    
    return render_template('client.html')

@app.route('/venue/<location_id>')
def venue(location_id):
    return render_template('venue.html')

@app.route('/vote', methods=['POST'])
def vote():
    v = Vote(playlist_item_id=request.form["playlist_item_id"],\
             user_id=User.current_id(),\
             direction=Vote.parseVote(request.form["direction"]))    
    v.save()
    jug.publish(config.jug_channel_name + ':' + str(Location.cur_location()) ,v.to_json())
    return ""

@app.route('/playlist/<int:location_id>')
def getPlaylist(location_id):
    l = Location.from_id(location_id)
    return l.playlist().to_json()

@app.route('/search/<query>')
def getSearch(query):
    return json.dumps(MusicLibrary.search(query))

@app.route('/track/<track_id>')
def getTrack(track_id):
    return MusicLibrary.get_track(id=track_id).to_json()

@app.route('/add_track', methods=['POST'])
@login_required
def addTrack():
    provider_id = request.form["provider_id"]
    location_id = request.form["location_id"]
    l = Location.from_id(location_id)
    return l.add_track(provider_id, User.current_id())

@app.route('/mark_played', methods=['POST'])
def markPlayed():
    pli = db_session.query(PlaylistItem).filter(PlaylistItem.id == request.form["id"]).first()
    pli.done_playing = True
    pli.save()
    return ""

#this seems weird because the client is driving which track is getting played next, but that is in fact
#how it has to work for now. Even though the server has the most up to date info, the client is what
#is actually playing the music so i think this makes sense for now. Definitely subject to change.
@app.route('/mark_playing', methods=['POST'])
def markPlaying():
    l = Location.from_id(request.form["location_id"])
    l.currently_playing = request.form["playlist_item_id"]
    l.save()
    return ""
    
@app.route('/login', methods=['POST'])
def login():
    if not User.is_logged_in():
        fbid = request.form["fbid"]
        fbat = request.form["fbat"]
        u = User.from_fbid(fbid)
        if not u:
            profile_info = common.get_json('http://graph.facebook.com/' + fbid)
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
    return redirect(url_for("index", location_id="1"))

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
