from flask import Flask, render_template, request, redirect, url_for
from db import db_session, init_db
from flask import json
import common
import sys, traceback
import logging
from logging import FileHandler
from functools import wraps

from location import Location
from musicLibrary import MusicLibrary
from user import User
import config

app = Flask(__name__)
app.debug = config.debugMode

fmt = logging.Formatter(fmt='%(asctime)s%(levelname)s: %(message)s',datefmt='%Y-%m-%d %H:%M:%S')
file_handler = FileHandler('log.txt', mode='a', encoding=None, delay=False)
file_handler.setLevel(logging.WARNING)
file_handler.setFormatter(fmt)
app.logger.addHandler(file_handler)

app.secret_key = config.secret_key

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if User.current_id() is None:
            return common.buildDialogResponse("Please log in.", 401)
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not User.is_admin():
            return common.buildDialogResponse("Admins only", 401)
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

@app.route('/venue_flash', methods=["POST"])
@admin_required
def venue_flash():
    l = Location.from_id(request.form["location_id"])
    l.flash(request.form["message"])
    return ""

@app.route('/vote', methods=['POST'])
def vote():
    l = Location.from_id(request.form["location_id"])
    return l.vote(request.form["playlist_item_id"], request.form["direction"])

@app.route('/playlist/<int:location_id>')
def getPlaylist(location_id):
    l = Location.from_id(location_id)
    try:
        return l.playlist().to_json()
    except:
        etype, value, tb = sys.exc_info()
        return ''.join(traceback.format_exception(etype, value, tb))

@app.route('/flash/<int:location_id>')
def getFlash(location_id):
    l = Location.from_id(location_id)
    return json.dumps(l.marketing_message)

@app.route('/search/<query>')
def getSearch(query):
    return json.dumps(MusicLibrary.search(**{"keyword":query,"includeExplicit":"true"}))

@app.route('/track/<int:track_id>')
def getTrack(track_id):
    return MusicLibrary.get_track(id=track_id).to_json()

@app.route('/leaderboard/<int:location_id>')
def leaderboard(location_id):
    hrs = request.args.get('hours', 12, type=int)
    l = Location.from_id(location_id)
    return json.dumps(l.leaderboard(hrs))

@app.route('/add_track', methods=['POST'])
@login_required
def addTrack():
    l = Location.from_id(request.form["location_id"])
    ret = l.add_track(request.form["provider_id"], User.current_id())
    return ret

@app.route('/mark_played', methods=['POST'])
@admin_required
def markPlayed():
    l = Location.from_id(request.form["location_id"])
    l.mark_played(request.form["playlist_item_id"])
    return ""

@app.route('/bump', methods=['POST'])
@admin_required
def bump():
    l = Location.from_id(request.form["location_id"])
    l.bump(request.form["playlist_item_id"])
    return ""

#this seems weird because the client is driving which track is getting played next, but that is in fact
#how it has to work for now. Even though the server has the most up to date info, the client is what
#is actually playing the music so i think this makes sense for now. Definitely subject to change.
@app.route('/mark_playing', methods=['POST'])
@admin_required
def markPlaying():
    l = Location.from_id(request.form["location_id"])
    l.mark_playing(request.form["playlist_item_id"])
    return ""
    
@app.route('/login', methods=['POST'])
def login():
    if request.form["method"] == "facebook":
        usr = User.facebook_login(request.form["fbid"], request.form["fbat"])
        if usr:
            return usr.to_json()
        else:
            return common.buildDialogResponse("Invalid login", 401)

@app.route('/logout')
def logout():
    User.logout()

##########  Static and Special Cases ##########

@app.route('/')
def home():
    return redirect(url_for("index", location_id="1"))

@app.route('/favicon.ico')
def favicon():
    return ''

@app.route('/initdb')
def initdb():
    try:
        init_db()
        return "success!"
    except:
        return sys.exc_info()[0]

##########  SpecialHandlers ##########  

@app.errorhandler(500)
def error500(e):
    return str(e)

@app.teardown_request
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == '__main__':
    app.run(host=config.host, port=config.port)
