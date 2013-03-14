var codebux     = require('codebux'),
    test        = require('tap').test;

codebux('../../lib/index.js', function (err, obj) {
    test('governance', function (t) {
        t.equal(err, null, 'error object is null');
        t.type(obj, 'number', 'result should be a number');
        t.ok(obj > 50, 'total should be greater than zero');
        t.end();
    });
});