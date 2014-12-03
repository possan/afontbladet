var page = require('webpage').create();
var fs = require('fs');

console.log('Loading page...');
page.open('http://www.aftonbladet.se', function() {
	console.log('Page loaded.');
	page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
		console.log('jQuery loaded.');
		var foo = page.evaluate(function() {
			var l = [];
			jQuery('*').each(function(i,e) { var t = jQuery(e).text().replace(/[\n\t\r]+/g, ' ').trim().substring(0,100); if (t != '') l.push({ size: parseInt(jQuery(e).css('font-size'), 10), text: t }); });
			l.sort(function(a,b) { return b.size - a.size; });
			console.log(l);
			return l;
		});
		console.log('foo', JSON.stringify(foo));
		console.log('Writing ' + foo.length + ' items...')
		fs.write('text.json', JSON.stringify(foo, null, 2), 'w');
		phantom.exit();
	});
});
