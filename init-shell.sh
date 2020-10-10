# DB Environment Settings: init-shell.sh
#
# This init-shell.sh script is for manual startup of kadira APM applications.
# It contains common environment variable definitions for kadira APM use.
#
# Connect to the application subdirectory:
#    <kadira-engine>, <kadira-rma>, or <kadira-ui>
#
# Then execute the command line:
#    cat ../init-shell.sh run.sh | sh
#
# Starting kadira services via systemd: systemctl, we configure these environment
# variables in separate files used by the systemd service control units.
#
# The OSP MongoDB is a replicated set of two mongod nodes running on the localhost.
#
#   replicaSet = "set-REPLICA-SET-01"
#
#   Primary mongodb   = localhost:27017   -- service systemd: systemctl start mongod
#   Secondary mongodb = localhost:27020   -- service systemd: systemctl start mongod2
#
# The MongoDB 3.6 server is supported by the npm mongodb 2.2.x drivers.
# Our OSP MongoDB 3.6 server has the following APM databases:
#
#  tkadira-app  -- the database for user and application registration
#
#  tkadira-data -- the database for application metrics collection and aggregation
#
# The OPLOG is in the MongoDb changeset stream to keep replica data synchronized
#
#------------------------------------------------
# Environment Variables for Kadira Services
#
# APP_MONGO_URL         Mongodb 'tkadira-app' database for kadira APM users and apps
#
# APP_MONGO_OPLOG_URL   Mongodb operational log for replicaSet synchronization
#   Note: _OPLOG_ requires a replicaSet and 'local' database.
#
# DATA_MONGO_URL        Mongodb 'tkadira-data' database for kadira APM metrics
#
# ENGINE_PORT - is the default 11011 port for the Kadira APM engine
#
# UI_PORT - is the default 4000 port to which UI browsers connect.
#
# MAIL_URL
# LIBRATO_EMAIL
# LIBRATO_TOKEN

# The mongodb: URIs shown here use the address of the primary mongod node.
# You can use multiple host:port entries to find a useable replica node.
# We have a custom package that can locate the primary replicaset node.

# Kadira APM application-registration database access with user:password

export APP_MONGO_URL="mongodb://app:app-password@localhost:27017/tkadira-app"

# Kadira APM aggregation-data database access with user:password

export DATA_MONGO_URL="mongodb://app:app-password@localhost:27017/tkadira-data"

# Meteor OPLOG - operations log requires a replicaSet. The OPLOG is tailed
# to provide live/realtime metrics collection.

# Provide OPLOG URL access with database user:password authentication.

#export APP_MONGO_OPLOG_URL="mongodb://app:app-password@localhost:27017,localhost:27020/local?authSource=tkadira-app&replicaSet=set-REPLICA-SET-01"

# Provide OPLOG URL without authentication - MongoDb databases without security activated.

export APP_MONGO_OPLOG_URL="mongodb://localhost:27017,localhost:27020/local?replicaSet=set-REPLICA-SET-01"


export MAIL_URL
# ="smtp://postmaster%40kadira.io:9jx4fqhdfbg5@smtp.mailgun.org:587"

# Engine settings
export ENGINE_PORT=11011

# UI settings
export UI_PORT=4000
export UI_URL="http://localhost:$UI_PORT"

# Monitoring LIBRATRO eMail Setup

export LIBRATO_EMAIL
export LIBRATO_TOKEN

#----------------
# In case service accounts do not have access to /usr/local/bin
# as a means to start /usr/local/bin/meteor
#
echo $PATH | grep -q "/usr/local/bin"
if [ $? -eq 1 ] ; then
export PATH=$PATH:/usr/local/bin
fi

#---------------- 
# Additional environments if using Amazon AWS Cloud Hosting
#----------------
#
# AWS_DEFAULT_REGION="eu-central-1"
# # may require edit to kadira-ui settings.json
#
# AWS_ACCESS_KEY_ID
#
# AWS_SECRET_ACCESS_KEY
#
# AWS_BUCKET='qlp-kadira'
#
#----------------
# Items in kadira-ui/settings.json may need editing:
# See: kadira-lampe/ui-settings.json
#   from repository: github/kadira-io/frontend
#----------------
