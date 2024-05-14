# Diabetes-app

run CouchDB: docker run --rm -i -p 5984:5984 -v "$(pwd)/couchdb_data:/opt/couchdb/data" -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb:3.3.3

run app: python3 Server.py
