#!/bin/sh
pushd .

echo "Running afontbladet cron script" >> /tmp/afontbladet.log

# reset data
rm -f text.json

# get text
/usr/local/bin/phantomjs rip.js >> /tmp/afontbladet.log
 
# did we fail? then exit
if [ -e "text.json" ]; then
	# back up ripped data for archiving.
	mkdir -p history
	BN=history/text-`date +"%Y%m%d-%H%M"`.json
	cp text.json $BN
	gzip -9 $BN

	# run bot script and tweet if change
	/usr/bin/node bot.js >> /tmp/afontbladet.log
	if [ $? -ne 0 ]; then
	    echo "bot failed"

		echo "Subject: Afontbladet rip failure" > mail.txt
		echo "" >> mail.txt
		cat state.json >>mail.txt
		cat mail.txt | sendmail possan+afontbladet@possan.se
	fi
fi

# döne.
popd

