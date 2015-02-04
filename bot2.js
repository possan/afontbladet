var fs = require('fs');

// load text info
var data = JSON.parse(fs.readFileSync('text.json', 'UTF-8'));
var checkmarks = data.checks;

// load current state
var state = JSON.parse(fs.readFileSync('state.json', 'UTF-8'));
state.last_fontsize = state.last_fontsize || 0;
state.last_text = state.last_text || '';
state.last_checkmarks = state.last_checkmarks || [];

var tweet_text = '';

// find a new checkmark
for(var i=0; i<checkmarks.length && tweet_text == ''; i++) {
	if (state.last_checkmarks.indexOf(checkmarks[i]) == -1) {
		// new checklist
		tweet_text = 'Ny kryssmarkering: ' + checkmarks[i];
		state.last_checkmarks.push(checkmarks[i]);
	}
}

if (tweet_text == '') {
	// TODO: kolla om vi ska ta bort någon markering
}

if (tweet_text != '') {
	//
	console.log('Send tweet: ' + tweet_text);

	var twitterconfig = JSON.parse(fs.readFileSync('twitterconfig.json', 'UTF-8'));
	var twitterAPI = require('node-twitter-api');
	// var state = JSON.parse(fs.readFileSync('state.json', 'UTF-8'));

	var twitter = new twitterAPI({
		consumerKey: twitterconfig.consumer_key,
		consumerSecret: twitterconfig.consumer_secret,
		callback: 'http://127.0.0.1:3000/callback'
	});

	twitter.statuses(
		"update",
		{
			status: tweet_text
		},
		state.access_token,
		state.access_token_secret,
		function(error, data, response) {
			if (error) {
				console.error(error);

				state.last_error = error.toString();
				state.last_error_time = Date().toString();
				state.last_update = Date().toString();

				fs.writeFileSync('state.json', JSON.stringify(state, null, 2), 'UTF-8');

				process.exit(1);

			} else {
				console.log(data);

				// save state
				state.last_error = '';

				state.last_tweet = tweet_text;
				state.last_tweet_time = Date().toString();

				state.last_update = Date().toString();

				fs.writeFileSync('state.json', JSON.stringify(state, null, 2), 'UTF-8');

				process.exit(0);

			}
		}
	);

} else {

	state.last_update = Date().toString();

	fs.writeFileSync('state.json', JSON.stringify(state, null, 2), 'UTF-8');

	process.exit(0);

}
