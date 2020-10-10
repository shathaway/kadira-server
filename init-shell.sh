# DB Environment Settings
#
# The OSP MongoDB is now a replicated set of two mongod nodes.
#
#   replicaSet = "set-OSP-KADIRA-APM-01"
#
#   Primary mongodb   = localhost:27017
#   Secondary mongodb = localhost:27020
#
# Our OSP MongoDB 4.2 server has the following APM databases:
#
#  tkadira-app
#    user = app:password
#    roles = readWrite, dbAdmin
#
#  tkadira-data
#    user = app:password
#    roles = readWrite, dbAdmin
# 
# Note: other databases (i.e. local) are not user/password protected at this time.
#
# The OPLOG is in the local database
#
#------------------------------------------------
# Environment Variables for Kadira Services
#
# APP_MONGO_URL         Mongodb 'tkadira-app' database for kadira-ui
#
# APP_MONGO_OPLOG_URL   Mongodb operational log 'local' database for 
#   Note: _OPLOG_ support normally requires a replicaSet.
#
# DATA_MONGO_URL        Mongodb 'tkadira-data' database for kadira services
#
# ENGINE_PORT - is the default 11011 port for the Kadira APM engine
#
# UI_PORT - is the default 4000 port to which UI browsers connect.
#
# MAIL_URL
# LIBRATO_EMAIL
# LIBRATO_TOKEN


# Meteor App (for) kadira-ui

# Kadira APM application-registration database access with user:password
# Used by kadira-ui, kadira-rma

export APP_MONGO_URL="mongodb://app:app-password@localhost:27017/tkadira-app"

# Kadira APM aggregation-data database access with user:password
# Used by kadira-ui, kadira-rma

export DATA_MONGO_URL="mongodb://app:app-password@localhost:27017/tkadira-data"

# Meteor OPLOG - operations log usually requires a replicaSet / replicated MongoDB
# Used by kadira-ui
#

# Using OPLOG_URL on system with administrative DB user/password protections

#export APP_MONGO_OPLOG_URL="mongodb://app:app-password@localhost:27017,localhost:27020/local?authSource=tkadira-app&replicaSet=set-OSP-KADIRA-APM-01"

# Using OPLOG_URL on (open) system witout DB administrative user/password protections
export APP_MONGO_OPLOG_URL="mongodb://localhost:27017,localhost:27020/local?replicaSet=set-SORM-RH7-PC-01"


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
