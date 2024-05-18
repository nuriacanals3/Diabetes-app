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


"""
    Function to populate the db at the start 
"""
def add_patient(name, records):
    patient_id = client._generateUuid()
    patient_doc = {
        '_id': patient_id,
        'type': 'patient',
        'name': name,
        'records': records
    }
    client.addDocument('ehr', patient_doc)


def populate_db():
    init_users = ["Patient_A", "Patient_B", "Patient_C"]

    records =  [{
                    "time": "2024-05-01T12:00:00",
                    "glucose_level": 100,
                    "weight": 70,
                    "blood_pressure": 120,
                    "insulin_dosage": 10,
                    "cholesterol_level": 90,
                    "sport_hours": 2,
                    "stress_level": 40,
                    "comments": "Normal readings"
                },
                {
                    "time": "2024-05-02T12:10:00",
                    "glucose_level": 110,
                    "weight": 80,
                    "blood_pressure": 118,
                    "insulin_dosage": 20,
                    "cholesterol_level": 155,
                    "sport_hours": 6,
                    "stress_level": 45,
                    "comments": "Slight increase in glucose level"
                },
                {
                    "time": "2024-05-02T12:50:00",
                    "glucose_level": 80,
                    "weight": 90,
                    "blood_pressure": 140,
                    "insulin_dosage": 12,
                    "cholesterol_level": 155,
                    "sport_hours": 1.5,
                    "stress_level": 80,
                    "comments": "Slight increase in glucose level"
                }]
    for user in init_users:
        add_patient(user, records)

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

"""
    Get the patients
"""
@app.route('/patients', methods = [ 'GET' ])
def list_patients():
    result = []

    patients = client.executeView('ehr', 'patients', 'by_patient_name')
    for p in patients:
        result.append({'id': p['value']['_id'], 'name': p['value']['name']})

    return Response(json.dumps(result), mimetype = 'application/json')


"""
    Create the patient and select if it exist
"""
@app.route('/create-select-patient', methods=['POST'])
def create_select_patient():
    body = request.json
    patient_name = body.get("name")

    patient = client.executeView('ehr', 
                                  'patients', 
                                  'by_patient_name',
                                  key=patient_name)
    
    if patient:
        patient_id = patient[0]['id']
    else:
        patient_id = client.addDocument('ehr', {'type': 'patient', 'name': patient_name})
        print(patient_id)

    return Response(json.dumps({'id': patient_id}), mimetype='application/json')


"""
    Save the records (data of the patient)
"""
@app.route('/record', methods = [ 'POST' ])
def record_data():
    # "request.get_json()" necessitates the client to have set "Content-Type" to "application/json"
    body = json.loads(request.get_data())

    now = datetime.datetime.now().isoformat()  # Get current time

    patient_name = body.get("patient")
    patient_id = patient_name.split("-")[1]
    patient = client.getDocument('ehr', patient_id)

    if not patient:
        return Response(json.dumps({"error": "Patient not found"}), status=404, mimetype="application/json")

    if 'records' not in patient:
        patient['records'] = []

    patient['records'].append({
        'time': now,
        'glucose_level': body['glucose'],
        'weight': body['weight'],
        'blood_pressure': body['blood'],
        'insulin_dosage': body['insulin'],
        'cholesterol_level': body['cholesterol'],
        'sport_hours': body['sport'],
        'stress_level': body['stress'],
        'comments': body['comments']
    })

    client.replaceDocument('ehr', patient_id, patient)

    return Response('', 204)


"""
    Get the patient data for the visualisation 
"""
@app.route('/patient-records/<patient_id>', methods=['GET'])
def get_patient_records(patient_id):
    patient = client.getDocument('ehr', patient_id)

    if not patient or 'records' not in patient:
        return Response(json.dumps({"error": "Patient or records not found"}), status=404, mimetype="application/json")

    return Response(json.dumps(patient.get('records', [])), mimetype='application/json')

if __name__ == '__main__':
    populate_db()
    app.run(debug=False)
