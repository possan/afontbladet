var page = require('webpage').create();
var fs = require('fs');

console.log('Loading page...');
page.open('http://www.aftonbladet.se', function() {
	console.log('Page loaded.');
	page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
		console.log('jQuery loaded.');
		var foo = page.evaluate(function() {
			var l = [];
			var c = [];

			jQuery('img').each(function(i,e) {
				jQuery(e).remove();
			});

			jQuery('script').each(function(i,e) {
				jQuery(e).remove();
			});

			jQuery('noscript').each(function(i,e) {
				jQuery(e).remove();
			});

			for(var r=0; r<10; r++) {
				jQuery('span.abInteract').each(function(i,e) {
					if (e.parentNode) {
						e.parentNode.textContent = e.parentNode.textContent;
					}
				});
			}

			jQuery('*:contains("")').each(function(i,e) {
				var el = jQuery(e);
				var t = el[0].textContent.replace(/[\n\t\r ]+/g, ' ').trim();
				if (el.children().length == 0) {
					if (t != '') {
						l.push({
							// node: el[0].nodeName,
							size: parseInt(el.css('font-size'), 10),
							text: t
						});
					}
				}
			});

			// find checkmarks
			jQuery('* > .abSymbBo').each(function(i, e) {
				var t = e.nextSibling.nodeValue.trim();
				// console.log('Check', e.nextSibling.nodeValue );
				if (t != '') {
					c.push(t);
				}
			});

			l.sort(function(a,b) { return b.size - a.size; });
			console.log(l);
			return { headlines: l, checks: c };
		});
		console.log('foo', JSON.stringify(foo));
		console.log('Writing ' + foo.length + ' items...')
		fs.write('text.json', JSON.stringify(foo, null, 2), 'w');
		phantom.exit();
	});
});
