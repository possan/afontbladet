var fs = require('fs');
var zlib = require('zlib');

exports.loadGzippedJson = function(filename, callback) {
    var alldata = '';
    var s1 = fs.createReadStream(filename);
    var gunzip = zlib.createGunzip();
    var unzipped = s1.pipe(gunzip);
    unzipped.on('data', function(data) {
        alldata += data.toString();
    });
    unzipped.on('end', function() {
        var obj = null;
        try {
            obj = JSON.parse(alldata);
        } catch(e) {
        	obj = null;
        }
		callback(obj);
    });
}

exports.saveGzippedJson = function(filename, data, callback) {
	var str = JSON.stringify(data);

    var s2 = fs.createWriteStream(filename);
    var gzip = zlib.createGzip();
    var zipped = gzip.pipe(s2);

	gzip.write(str);
	gzip.end();

	s2.on('end', function() {
		callback(true);
	})
}

exports.saveJson = function(filename, data, callback) {
	var str = JSON.stringify(data, null, 2);
	fs.writeFileSync(filename, str, 'UTF-8');
	callback(true);
}