#!/bin/sh

# reset data
rm -f text.json

# get text
phantomjs rip.js

# did we fail? then exit
if [ -e "text.json" ]; then
	# back up ripped data for archiving.
	mkdir -p history
	BN=history/text-`date +"%Y%m%d-%H%M"`.json
	cp text.json $BN

	# run bot script and tweet if change
	node bot.js
fi

# döne.
