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
        t.equal(err, 'Invalid html template file path: /Users/asliwinski/Documents/Projects/trebuchet/test/integration/../fixtures/lkjhasdflkjhqwef.html', 'expected error message');
        t.end();
    });
});