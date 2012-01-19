import requests
from flask import json, session

def get_json(url):
    r = requests.get(url)
    ctnt = r.content
    return json.loads(ctnt)

def get_user_id():
    try:
        user_id = session['user_id']
        return user_id
    except:
        return None