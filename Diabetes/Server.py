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

@app.route('/styles.css', methods=['GET'])
def get_css():
    with open('styles.css', 'r') as f:
        return Response(f.read(), mimetype='text/css')

##
## REST API
##

client.installView('ehr', 'patients', 'by_patient_name', '''
function(doc) {
  if (doc.type == 'patient') {
    emit(doc.name, doc);
  }
}
''')

@app.route('/create-patient', methods = [ 'POST' ])
def create_patient():
    # "request.get_json()" necessitates the client to have set "Content-Type" to "application/json"
    body = json.loads(request.get_data())

    patientId = None

    # TODO
    client.addDocument('ehr', {'type': 'patient', 'name': body['name']})

    return Response(json.dumps({
        'id' : patientId
    }), mimetype = 'application/json')


@app.route('/patients', methods = [ 'GET' ])
def list_patients():
    result = []

    # TODO
    patients = client.executeView('ehr', 'patients', 'by_patient_name')

    for p in patients:
        result.append({'id': p['value']['_id'], 'name': p['value']['name']})

    return Response(json.dumps(result), mimetype = 'application/json')


@app.route('/record', methods = [ 'POST' ])
def record_data():
    # "request.get_json()" necessitates the client to have set "Content-Type" to "application/json"
    body = json.loads(request.get_data())

    now = datetime.datetime.now().isoformat()  # Get current time

    # TODO
    client.addDocument('ehr', {'type': 'data',
                               'patient_id': body['id'],
                               'time': now,
                               'glucose_level': body['glucose'],
                               'weight': body['weight'],
                               'blood_pressure': body['blood'],
                               'insuline_dosage': body['insuline'],
                               'cholesterol_level': body['cholesterol'],
                               'sport_hours': body['sport'],
                               'stress_level': body['stress']})

    return Response('', 204)

if __name__ == '__main__':
    app.run()
