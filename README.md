# LINFO2381 - Diabetes Portal app

## Launch the project 
First, start the CouchDB with the following command in the terminal : 

`docker run --rm -i -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb:3.3.3`

`docker run --rm -i -p 5984:5984 -v "$(pwd)/couchdb_data:/opt/couchdb/data" -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb:3.3.3`

Then, to launch the server with our website application, run the following command 

`python Server.py`

---
To access the CouchDB UI, visit this link : [CouchDB UI](http://localhost:5984/_utils/), and to access the application go to : [website](http://127.0.0.1:5000), or click on the link from the terminal once the application has been launched.

