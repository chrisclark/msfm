import requests
import sys, traceback
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
    d = {"msg": msg}
    resp = make_response(json.dumps(d), code)
    return resp

def fail():
    etype, value, tb = sys.exc_info()
    msg = ''.join(traceback.format_exception(etype, value, tb))
    resp = make_response(msg, 500)
    return resp
