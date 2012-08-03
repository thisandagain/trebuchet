/**
 * Unit test suite.
 *
 * @package API
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var async       = require('async'),
    test        = require('tap').test,
    argv        = require('optimist')
        .demand(['from','to'])
        .default('key', 'POSTMARK_API_TEST')
        .argv;

    trebuchet   = require('../lib/index.js')(argv.key);

/**
 * Suite
 */
async.auto({

    fling:  function (callback) {
        trebuchet.fling({
            params: {
                from: argv.from,
                to: argv.to,
                subject: 'This is only a test of the fling pattern'
            },
            html: 'test/template/fling.html',
            text: 'test/template/fling.txt',
            data: { foo: 'Bar' }
        }, callback);
    },

    load_1: function (callback) {
        trebuchet.load({
            params: {
                from: argv.from,
                to: argv.to,
                subject: 'This is only a test of the load/fire pattern #1'
            },
            html: 'test/template/fire.html',
            text: 'test/template/fire.txt',
            data: { foo: 'Bar', name: 'Bubba' }
        }, callback);
    },

    load_2: function (callback) {
        trebuchet.load({
            params: {
                from: argv.from,
                to: argv.to,
                subject: 'This is only a test of the load/fire pattern #2'
            },
            html: 'test/template/fire.html',
            text: 'test/template/fire.txt',
            data: { foo: 'Bar', name: 'Jane' }
        }, callback);
    },

    fire:   ['load_1', 'load_2', function (callback) {
        trebuchet.fire(callback);
    }],

    css:    function (callback) {
        trebuchet.fling({
            params: {
                from: argv.from,
                to: argv.to,
                subject: 'This is only a test of the fling pattern with inlined CSS'
            },
            html: 'test/template/fling.html',
            css: 'test/template/fling.css',
            text: 'test/template/fling.html',
            data: { foo: 'Bar' }
        }, callback);
    },

    test:   ['fling', 'fire', 'css', function (callback, obj) {
        test("Component definition", function (t) {
            t.type(trebuchet, "object", "Component should be an object");
            t.type(trebuchet.fling, "function", "Method should be a function");
            t.type(trebuchet.load, "function", "Method should be a function");
            t.type(trebuchet.fire, "function", "Method should be a function");
            t.type(trebuchet.reset, "function", "Method should be a function");
            t.end();
        });

        test("Fling method", function (t) {
            t.type(obj.fling, "object", "Results should be an object");
            t.equal(obj.fling.To, argv.to, "To attributes should match");
            t.equal(obj.fling.ErrorCode, 0, "Error code should equal 0");
            t.end();
        });

        test("Load method", function (t) {
            t.type(obj.load_1, "number", "Results should be a number");
            t.type(obj.load_2, "number", "Results should be a number");
            t.end();
        })

        test("Fire method", function (t) {
            t.type(obj.fire, "object", "Results should be an object");
            t.equal(obj.fire[0].To, argv.to, "To attributes should match");
            t.equal(obj.fire[0].ErrorCode, 0, "Error code should equal 0");
            t.end();
        });

        test("Fling method (CSS)", function (t) {
            t.type(obj.css, "object", "Results should be an object");
            t.equal(obj.css.To, argv.to, "To attributes should match");
            t.equal(obj.css.ErrorCode, 0, "Error code should equal 0");
            t.end();
        });

        callback();
    }]

}, function (err, obj) {
    test("Catch errors", function (t) {
        t.equal(err, null, "Errors should be null");
        t.end();
    });
});