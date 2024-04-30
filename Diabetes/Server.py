#!/usr/bin/env python3

import datetime
import json


##
## Initialization of the CouchDB server (creation of 1 collection of
## documents named "ehr", if it is not already existing)
##

import CouchDBClient

client = CouchDBClient.CouchDBClient()

#client.reset()   # If you want to clear the entire content of CouchDB

if not 'ehr' in client.listDatabases():
    client.createDatabase('ehr')


##
## Serving static HTML/JavaScript resources using Flask
##

from flask import Flask, Response, request, redirect, url_for
app = Flask(__name__)

@app.route('/')
def hello():
    return redirect(url_for('get_index'))

@app.route('/index.html', methods = [ 'GET' ])
def get_index():
    with open('index.html', 'r') as f:
        return Response(f.read(), mimetype = 'text/html')

@app.route('/app.js', methods = [ 'GET' ])
def get_javascript():
    with open('app.js', 'r') as f:
        return Response(f.read(), mimetype = 'text/javascript')


##
## REST API
##




if __name__ == '__main__':
    app.run()
