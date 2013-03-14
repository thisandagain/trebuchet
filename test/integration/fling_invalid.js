var test        = require('tap').test,
    trebuchet   = require('../../lib/index')('POSTMARK_API_TEST');

trebuchet.fling({
    params: {
        from:       'kitty@diy.org',
        to:         'puppy@diy.org',
        subject:    'This is only a test of the fling pattern'
    },
    html: __dirname + '/../fixtures/lkjhasdflkjhqwef.html',
    text: __dirname + '/../fixtures/fling.txt',
    data: { 
        foo: 'Bar'
    }
}, function (err, result) {
    test('integration', function (t) {
        t.type(err, 'string', 'error object is a string');
        t.equal(err.split(':')[0], 'Invalid html template file path', 'expected error');
        t.end();
    });
});