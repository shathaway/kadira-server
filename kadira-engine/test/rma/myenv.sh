#!/bin/bash
#ONLY_ONCE=1 MONGO_SHARD=one MONGO_URL=mongodb://localhost/%s PROFILE=%s PROVIDER=%s ./start.sh:

export ONLY_ONCE=1
export MONGO_SHARD=one
export MONGO_URL=mongodb://localhost/testapm
export PROFILE=1min
export PROVIDER=methods

echo Current Directory = `pwd`
echo Arguments: $*
echo ENV: ONLY_ONCE = $ONLY_ONCE
echo ENV: MONGO_SHARD = $MONGO_SHARD
echo ENV: MONGO_URL = $MONGO_URL
echo ENV: PROFILE = $PROFILE
echo ENV: PROVIDER = $PROVIDER

PATH=$PATH:./packages/pick-mongo-primary/bin
## USAGE: PROFILE=1min WAIT_TIME=60 start.sh

export WAIT_TIME=10
export MONGO_METRICS_URL=$MONGO_URL

ENV_FILE_NAME="env-$PROFILE-$PROVIDER.js"

  MONGO_APP_CONN=$(pick-mongo-primary $MONGO_URL)

echo Initial MONGO_APP_CONN = $MONGO_APP_CONN

  MONGO_APP_CONN=${MONGO_APP_CONN// /"~~~"}
  # HACK: exposting env vars to the mongo shell
  echo DIAGNOSTIC: MONGO_APP_CONN = $MONGO_APP_CONN
  export MONGO_APP_CONN
  ENV_DATA=$(env)
#  ENV_DATA=`env`
  echo "var ENV_DATA='"$ENV_DATA"';" 
#> $1
#  cat _envDataProcess.js >> $1

echo Starting start.sh
bash
echo End of execution: start.sh
