// aggregate all history/[date]/[time].json.gz -> aggregates/[date].json.gz

if (process.argv < 3) {
    console.log('Syntax: aggregate.js [yyyymmdd]')
    process.exit(1);
}

var fs = require('fs');
var zlib = require('zlib');
var utils = require('./utils');

var ymd = process.argv[2];
console.log('calculating aggregate of ' + ymd);

var agg = {};

var num_samples = 0;
var all_times = {};

var loading = 0;

function aggregate_hour(hour) {
    var houragg = {};

    // houragg.num_samples = 0;

    var all_words = {};
    var all_sizes = {};
    var hour_samples = 0;

    for(var k in all_times) {
        var hourinfo = all_times[k];
        if (hourinfo.hour == hour) {
            for(var w in hourinfo.words) {
                all_words[w] = (all_words[w] || 0) + hourinfo.words[w];
            }
            for(var s in hourinfo.sizes) {
                all_sizes[s] = (all_sizes[s] || 0) + hourinfo.sizes[s];
            }
            hour_samples ++;
        }
    }

    houragg.sizes = {};
    houragg.words = {};
    for(var w in all_words) {
        var c = Math.round(100.0 * all_words[w] / hour_samples) / 100.0;
        if (c > 1.0)
            houragg.words[w] = c;
    }
    for(var s in all_sizes) {
        var c = Math.round(100.0 * all_sizes[s] / hour_samples) / 100.0;
        if (c > 1.0)
            houragg.sizes[s.toString()] = c;
    }

    return houragg;
}

function save_aggregates() {

    console.log('calculating aggregate.');

    agg.num_samples = num_samples;
    agg.hours = [];
    for(var i=0; i<24; i++) {
        agg.hours[i] = aggregate_hour(i);
    }

    var all_words = {};
    var all_sizes = {};
    for(var k in all_times) {
        var hourinfo = all_times[k];
        for(var w in hourinfo.words) {
            all_words[w] = (all_words[w] || 0) + hourinfo.words[w];
        }
        for(var s in hourinfo.sizes) {
            all_sizes[s] = (all_sizes[s] || 0) + hourinfo.sizes[s];
        }
    }

    agg.all_sizes = {};
    agg.all_words = {};

    for(var w in all_words) {
        var c = Math.round(100.0 * all_words[w] / num_samples) / 100.0;
        if (c > 1.0)
            agg.all_words[w] = c;
    }

    for(var s in all_sizes) {
        var c = Math.round(100.0 * all_sizes[s] / num_samples) / 100.0;
        if (c > 1.0)
            agg.all_sizes[s.toString()] = c;
    }

    console.log('saving aggregate.');

    utils.saveJson('aggregates/' + ymd + '.json', agg, function(done) {
        console.log('aggregate saved.');
    });

}

var stopwords = ['och','det','att','i','en','jag','hon','som','han','på','den','med','var','sig','för','så','till','är','men','ett','om','hade','de','av','icke','mig','du','henne','då','sin','nu','har','inte','hans','honom','skulle','hennes','där','min','man','ej','vid','kunde','något','från','ut','när','efter','upp','vi','dem','vara','vad','över','än','dig','kan','sina','här','ha','mot','alla','under','någon','eller','allt','mycket','sedan','ju','denna','själv','detta','åt','utan','varit','hur','ingen','mitt','ni','bli','blev','oss','din','dessa','några','deras','blir','mina','samma','vilken','er','sådan','vår','blivit','dess','inom','mellan','sådant','varför','varje','vilka','ditt','vem','vilket','sitta','sådana','vart','dina','vars','vårt','våra','ert','era','vilkas'];

function loadminute(filename, hour, minute) {
    console.log('loading ' + filename + ' (' + hour + ':' + minute + ')');
    utils.loadGzippedJson(filename, function(data) {
        console.log('loaded ' + data.length + ' sentences for '+hour+':'+minute+'...');

        var hourinfo = {
            hour: hour,
            minute: minute,
            sentences: data,
            sents: [],
            words: {},
            sizes: {}
        };

        hourinfo.sentences.forEach(function(s) {
            var sent = s.text.toLowerCase();

            s.size = s.size.toString();

            if (sent.indexOf('<') != -1 || sent.indexOf('>') != -1)
                return;

            sent = sent.replace(/\<[^\>]+\>/ig, '');

            sent = sent.replace(/[^\x00-\xFF]+/g, '');
            sent = sent.replace(/-/g, ' ');
            sent = sent.replace(/”/g, ' ');
            sent = sent.replace(/ /g, ' ');
            sent = sent.replace(/…/g, ' ');
            sent = sent.replace(/–/g, ' ');
            sent = sent.replace(/●/g, ' ');
            sent = sent.replace(/[\^\/\!\?\*]+/g, ' ');
            sent = sent.replace(/[\{\[\(\)\]\}]+/g, ' ');

            // console.log('sentence: ' + sent);

            // hourinfo.sents.push({ text: sent, size: s.size });

            var words = sent.split(/[ \t\r\n:;\+,.]+/);

            words.forEach(function(w) {
                w = w.trim();
                w = w.replace(/^\'/, '');
                w = w.replace(/\'$/, '');
                w = w.replace(/^\"/, '');
                w = w.replace(/\"$/, '');

                if (w.length < 2)
                    return;

                if (stopwords.indexOf(w) != -1)
                    return;

                // console.log('word: ' + w)
                hourinfo.words[w] = (hourinfo.words[w] || 0) + 1;
            });

            hourinfo.sizes[s.size] = (hourinfo.sizes[s.size] || 0) + 1;
        });

        delete(hourinfo.sentences);
        all_times[hour+':'+minute] = hourinfo;

        loading --;
        if (loading == 0) {
            save_aggregates();
        }
    });
}

var dir = 'history/' + ymd;
fs.readdir(dir, function(err, files) {
    if (err) throw 'failed to read folder';
    files.forEach(function(file) {
        loading ++;
        num_samples ++;
        var match = file.match(/([0-9]{2})([0-9]{2})\./);
        var hour = match[1];
        var minute = match[2];
        setTimeout(function() {
            loadminute(dir + '/' + file, hour, minute);
        }, loading*1);
    });
});
