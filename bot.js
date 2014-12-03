var fs = require('fs');

// load text info
var data = JSON.parse(fs.readFileSync('text.json', 'UTF-8'));

// calc distribution and peak
var biggest_fontsize = data[0].size || 0;
var biggest_text = data[0].text || '';
console.log('biggest_fontsize', biggest_fontsize);
console.log('biggest_text', 'biggest_text');

var histogram = {};
data.forEach(function(d) {
	if (typeof(histogram[d.size]) == 'undefined')
		histogram[d.size] = 0;
	histogram[d.size] ++;
});
console.log(histogram);

// load current state
var state = JSON.parse(fs.readFileSync('state.json', 'UTF-8'));
state.last_fontsize = state.last_fontsize || 0;
state.last_text = state.last_text || '';

var tweet_text = '';

// did we change state
if (biggest_fontsize != state.last_fontsize || biggest_text != state.last_text) {
	console.log('Biggest headline changed text or font size');

	if (biggest_fontsize >= (state.last_fontsize + 10)) {
		tweet_text = 'Fontchock, hela '+biggest_fontsize+'px! ' + biggest_text;
	} else if (biggest_fontsize > state.last_fontsize) {
		tweet_text = 'Ökning till '+biggest_fontsize+'px: ' + biggest_text;
	} else if (biggest_fontsize < state.last_fontsize) {
		tweet_text = 'Tillbaka på '+biggest_fontsize+'px: ' + biggest_text;
	} else if (biggest_text != state.last_text) {
		tweet_text = 'Rubrik på '+biggest_fontsize+'px ändrad: ' + biggest_text;
	}
}

if (tweet_text != '') {
	//
	console.log('Send tweet: ' + tweet_text);

	var twitterconfig = JSON.parse(fs.readFileSync('twitterconfig.json', 'UTF-8'));
    var Twitter = require('node-twitter');

	var twitter = new Twitter.RestClient(
		twitterconfig.consumer_key,
		twitterconfig.consumer_secret,
		twitterconfig.access_token,
		twitterconfig.access_token_secret
	);

	twitter.statusesUpdate({
		status: tweet_text
	}, function (err, data) {
		if (err) {
			console.error(err);

			state.last_error = err.toString();
			state.last_error_time = Date().toString();

			state.last_update = Date().toString();

			fs.writeFileSync('state.json', JSON.stringify(state, 2, null), 'UTF-8');

		} else {
			console.log(data);

			// save state
			state.last_fontsize = biggest_fontsize;
			state.last_text = biggest_text;

			state.last_tweet = tweet_text;
			state.last_tweet_time = Date().toString();

			state.last_update = Date().toString();

			fs.writeFileSync('state.json', JSON.stringify(state, 2, null), 'UTF-8');

		}
	});
}
