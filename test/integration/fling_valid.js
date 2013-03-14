var test        = require('tap').test,
    trebuchet   = require('../../lib/index')('POSTMARK_API_TEST');

trebuchet.fling({
    params: {
        from:       'kitty@diy.org',
        to:         'puppy@diy.org',
        subject:    'This is only a test of the fling pattern'
    },
    html: __dirname + '/../fixtures/fling.html',
    text: __dirname + '/../fixtures/fling.txt',
    data: { 
        foo: 'Bar'
    }
}, function (err, result) {
    test('integration', function (t) {
        t.equal(err, null, 'error object is null');
        t.type(result, 'object', 'api response is an object');
        t.equal(result['ErrorCode'], 0, 'api error code is 0');
        t.equal(result['Message'], 'Test job accepted', 'api message is as expected');
        t.end();
    });
});