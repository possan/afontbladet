#!/bin/sh
pushd .

echo "Running afontbladet morning script" >> /tmp/afontbladet.log

BP=`date -v-1d +"%Y%m%d"`

mkdir -p aggregates/
/usr/bin/node aggregate.js $BP

# döne.
popd

