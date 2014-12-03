var fs = require('fs');
var twitterAPI = require('node-twitter-api');
var url = require('url');
var querystring = require('querystring');

var twitterconfig = JSON.parse(fs.readFileSync('twitterconfig.json', 'UTF-8'));
var state = JSON.parse(fs.readFileSync('state.json', 'UTF-8'));

var twitter = new twitterAPI({
	consumerKey: twitterconfig.consumer_key,
	consumerSecret: twitterconfig.consumer_secret,
	callback: 'http://127.0.0.1:3000/callback'
});

var redir = url.parse(process.argv[2]);
console.log('logging in with redirect url', redir);

var data = querystring.parse(redir.query);
console.log('redirect url querystring data', data);

twitter.getAccessToken(state.request_token, state.request_token_secret, data.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
	if (error) {
		console.log('Failed to get access token', error);
	} else {
		console.log('Got access token!');
		state.access_token = accessToken;
		state.access_token_secret = accessTokenSecret;
		state.request_token = '';
		state.request_token_secret = '';
		fs.writeFileSync('state.json', JSON.stringify(state, null, 2), 'UTF-8');
	}
});
