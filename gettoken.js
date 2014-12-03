var fs = require('fs');
var twitterAPI = require('node-twitter-api');

var twitterconfig = JSON.parse(fs.readFileSync('twitterconfig.json', 'UTF-8'));
var state = JSON.parse(fs.readFileSync('state.json', 'UTF-8'));

var twitter = new twitterAPI({
	consumerKey: twitterconfig.consumer_key,
	consumerSecret: twitterconfig.consumer_secret,
	callback: 'http://127.0.0.1:3000/callback'
});

twitter.getRequestToken(function(error, requestToken, requestTokenSecret, results) {
	if (error) {
		console.log("Error getting OAuth request token: " + error);
	} else {
		//store token and tokenSecret somewhere, you'll need them later; redirect user

		console.log('log in on url:');
		console.log('  ' + twitter.getAuthUrl(requestToken));

		console.log('');
		console.log('then get the access token using the redirected url:');
		console.log('  node gettoken2.js "URL" ');

		// update state.
		state.request_token = requestToken;
		state.request_token_secret = requestTokenSecret;
		fs.writeFileSync('state.json', JSON.stringify(state, null, 2), 'UTF-8');
	}
});
