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
	if [ $? -ne 0 ]; then
	    echo "bot failed"

		echo "Subject: Afontbladet rip failure" > mail.txt
		echo "" >> mail.txt
		cat state.json >>mail.txt
		cat mail.txt | sendmail possan+afontbladet@possan.se
	fi
fi

# döne.
