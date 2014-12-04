#!/bin/sh
pushd .

echo "Running afontbladet morning script" >> /tmp/afontbladet.log

BP=`date +"%Y%m%d" -d "yesterday"`

mkdir -p aggregates/
/usr/bin/node aggregate.js $BP

# döne.
popd

