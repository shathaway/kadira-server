#!/bin/bash
#ONLY_ONCE=1 MONGO_SHARD=one MONGO_URL=mongodb://localhost/%s PROFILE=%s PROVIDER=%s ./start.sh:

export ONLY_ONCE=1
export MONGO_SHARD=one
export MONGO_URL=mongodb://localhost/testapm
export PROFILE=1min
export PROVIDER=methods
export WAIT_TIME=10

echo Current Directory = `pwd`
echo Arguments: $*
echo ENV: ONLY_ONCE = $ONLY_ONCE
echo ENV: MONGO_SHARD = $MONGO_SHARD
echo ENV: MONGO_URL = $MONGO_URL
echo ENV: PROFILE = $PROFILE
echo ENV: PROVIDER = $PROVIDER

echo Starting start.sh
bash -v start.sh
echo End of execution: start.sh

export PROFILE=1min
export PROVIDER=system
bash start.sh

export PROFILE=3hour
export PROVIDER=methods
bash start.sh

export PROFILE=3hour
export PROVIDER=system
bash start.sh

export PROFILE=30min
export PROVIDER=methods
bash start.sh

export PROFILE=30min
export PROVIDER=system
bash start.sh

