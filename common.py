import requests
from flask import json, make_response

def get_json(url):
    r = requests.get(url)
    ctnt = r.content
    return json.loads(ctnt)

def strip_private(dic):
    for k in dic.keys():
        if k.startswith("_"):
            dic.pop(k)
    return dic

def copyObj(src, dest):
    if type(src)==type(dest):
        dest.__dict__ = src.__dict__.copy()
            
def buildDialogResponse(msg, code):
    resp = make_response(json.dumps(msg), code)
    return resp