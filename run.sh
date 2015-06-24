#!/bin/sh

# setup mysql options
export MYSQL_HOST="127.0.0.1"
export MYSQL_USER="archery_user"
export MYSQL_PASS="archery_password"
export MYSQL_DB="archery"

# setup couchdb options
export COUCHDB_NAME="archery-server-sessions"
export COUCHDB_HOST="127.0.0.1"

# setup session secret
export SESSION_SECRET="sessionSecret"
export COOKIE_SECRET="cookieSecret"

npm start
