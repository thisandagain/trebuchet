
//
// # Unit test for load & fire methods.
//
// Author:      Andrew Sliwinski - <andrew@diy.org>
// Contributor: Nick Baugh       - <niftylettuce@gmail.com>
//

// # Dependencies
var assert    = require('assert')
  , vows      = require('vows')
  , argv      = require('optimist')
                  .demand(['from','to'])
                  .default('key', 'POSTMARK_API_TEST')
                  .argv
  , suite     = vows.describe('Trebuchet')
  , trebuchet = require('../lib/index.js')(argv.key);


// # Suite
suite
  /*
  .addBatch({
    'Fling': {
      topic: function() {
        trebuchet.fling({
            params: {
                from: argv.from
              , to: argv.to
              , subject: 'This is only a test of the fling pattern'
            }
          , html: 'test/template/fling.html'
          , text: 'test/template/fling.txt'
          , data: { foo: 'Bar' }
        }, this.callback);
      },
      'does not return an error': function(err, obj) {
        assert.isNull(err);
      },
      'returns a response': function(err, obj) {
        assert.isNotNull(obj);
      },
      'response is an object': function(err, obj) {
        assert.isObject(obj);
      },
      'response includes expected values from API': function(err, obj) {
        assert.equal(obj.To, argv.to);
        assert.equal(obj.ErrorCode, 0);
      }
    }
  })
  .addBatch({
    'Load #1': {
      topic: function() {
        trebuchet.load({
            params: {
                from: argv.from
              , to: argv.to
              , subject: 'This is only a test of the load/fire pattern #1'
            }
          , html: 'test/template/fire.html'
          , text: 'test/template/fire.txt'
          , data: { foo: 'Bar', name: 'Bubba' }
        }, this.callback);
      },
      'does not return an error': function(err, obj) {
        assert.isNull(err);
      },
      'returns a response': function(err, obj) {
        assert.isNotNull(obj);
      },
      'response is a number': function(err, obj) {
        assert.isNumber(obj);
      }
    }
  })
  .addBatch({
    'Load #2': {
      topic: function() {
        trebuchet.load({
            params: {
                from: argv.from
              , to: argv.to
              , subject: 'This is only a test of the load/fire pattern #2'
            }
          , html: 'test/template/fire.html'
          , text: 'test/template/fire.txt'
          , data: { foo: 'Bar', name: 'Jane' }
        }, this.callback);
      },
      'does not return an error': function(err, obj) {
        assert.isNull(err);
      },
      'returns a response': function(err, obj) {
        assert.isNotNull(obj);
      },
      'response is a number': function(err, obj) {
        assert.isNumber(obj);
      }
    }
  })
  .addBatch({
    'Fire': {
      topic:  function () {
        trebuchet.fire(this.callback);
      },
      'does not return an error': function(err, obj) {
        assert.isNull(err);
      },
      'returns a response': function(err, obj) {
        assert.isNotNull(obj);
      },
      'response is an array': function(err, obj) {
        assert.isArray(obj);
      },
      'response includes expected values from API': function(err, obj) {
        assert.equal(obj[0].To, argv.to);
        assert.equal(obj[0].ErrorCode, 0);
      }
    }
  })
  */
  .addBatch({
    'Load #3 with CSS': {
      topic: function() {
        trebuchet.fling({
            params: {
                from: argv.from
              , to: argv.to
              , subject: 'This is only a test of the fling pattern with inlined CSS'
            }
          , html: 'test/template/fling.html'
          , css: 'test/template/fling.css'
          , text: 'test/template/fling.html'
          , data: { foo: 'Bar' }
        }, this.callback);
      },
      'does not return an error': function(err, obj) {
        assert.isNull(err);
      },
      'returns a response': function(err, obj) {
        assert.isNotNull(obj);
      },
      'response is an object': function(err, obj) {
        assert.isObject(obj);
      },
      'response includes expected values from API': function(err, obj) {
        assert.equal(obj.To, argv.to);
        assert.equal(obj.ErrorCode, 0);
      }
    }
  })
  .export(module);
