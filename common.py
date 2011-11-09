import requests
from flask import json

def get_json(url):
    r = requests.get(url)
    ctnt = r.content
    return json.loads(ctnt)