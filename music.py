from flask import Flask, render_template
from db import db_session, init_db
import sys
import config
import musicLibrary as ml
from location import Location

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

@app.route('/<locationName>')
def index(locationName):
    l = Location(name=locationName)
    return render_template(
                           'locationHome.html',
                           locationName=l.name,
                           locationId=l.id)

@app.route('/playlist/<int:locationId>')
def getPlaylist(locationId):
    return ml.search("test").toJson()

@app.route('/search/<query>')
def getSearch(query):
    return ml.search(query).toJson()

@app.route('/addSong', methods=['POST'])
def pickSong():
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
