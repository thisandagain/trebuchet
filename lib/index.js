
//
// # Trebuchet - Let's chuck some email!
//
// Author:      Andrew Sliwinski - <andrew@diy.org>
// Contributor: Nick Baugh       - <niftylettuce@gmail.com>
//

// # Dependencies
var fs          = require('fs')
  , path        = require('path')
  , _           = require('underscore')
  , async       = require('async')
  , request     = require('request')
  , mustache    = require('mu2')
  , juice       = require('juice');

// # Module
module.exports = function (apikey) {

  var outbox = [];


  // ## Fling - sends a single email to a single target
  // * options [Object] - params: Postmark API "params", e.g. from, to, subject
  //                    - html
  //                    - text
  //                    - data
  var fling = function (options, callback) {
    _.defaults(options, {
        params: {}
      , html: ''
      , text: ''
      , css: ''
      , data: {}
    });
    compile(options.html, options.text, options.data, function (err, content) {
      var message = options.params;
      message.htmlbody = content.html;
      message.textbody = content.text;
      send(message, callback);
    });
  };


  // ## Loads a piece of mail into the outbox.
  // * options [Object] - Postmark API params
  var load = function (options, callback) {
    _.defaults(options, {
        params: {}
      , html: ''
      , text: ''
      , data: {}
    });

    compile(options.html, options.text, options.data, function (err, content) {
      var message = options.params;
      message.htmlbody = content.html;
      message.textbody = content.text;
      if (outbox.length >= 500) {
        callback('Postmark API batch size limit has been reached.',
                 outbox.length);
      } else {
        outbox.push(message);
        callback(null, outbox.length);
      }
    });
  };


  // ## Fires all of the mail in the outbox.
  // * options [Object]
  var fire = function (callback) {
    send(outbox, function (err, obj) {
      reset(function () {
        callback(err, obj);
      });
    });
  };


  // ## Resets (purge) the mailbox.
  var reset = function (callback) {
    outbox = [];
    callback(null, outbox.length);
  };


  // ## Compiles templates and returns rendered result.
  // * html     [String]   - file path
  // * text     [String]   - file path
  // * css      [String]   - file path
  // * data     [Object]   - template locals
  // * env      [String]   - server environment
  // * callback [Function] - callback
  var compile = function (html, text, data, css, env, callback) {

    // TODO: Fallback for older implementations

    // Cache policy
    if ((typeof env !== 'undefined' && (env === 'development'
                                        || env === 'DEVELOPMENT'))
        || (process.env.NODE_ENV === 'development'
            || process.env.NODE_ENV === 'DEVELOPMENT')) {
      mustache.clearCache();
    }

    // Processor
    var proc = function (input, data, callback) {
      var abspath = path.resolve(input)
        , buffer  = '';
      mustache
        .compileAndRender(abspath, data)
        .on('error', function (err) {
          callback(err);
        })
        .on('data', function (data) {
          buffer += data.toString();
        })
        .on('end', function () {
          callback(null, buffer);
        });
    };

    // Compile & return HTML and text inputs
    async.auto({
      html: function (callback) { proc(html, data, callback); },
      text: function (callback) { proc(text, data, callback); }
    }, callback);

  };


  // ## Sends request to the Postmark API.
  // * message  [Object]
  // * callback [Function]
  var url = {
          batch: 'https://api.postmarkapp.com/email/batch'
        , email: 'https://api.postmarkapp.com/email'
      }
    , send = function (message, callback) {
      var uri = (_.isArray(message)) ? url.batch : url.email;
      request({
          uri: uri
        , method: 'POST'
        , headers: { 'X-Postmark-Server-Token': apikey }
        , json: message
      }, function (e, r, body) {
        if (e) {
          callback(e);
        } else if (r.statusCode !== 200) {
          callback(body.Message);
        } else {
          callback(null, body);
        }
      });
    };


  // ## Expose module methods
  return {
    fling:  fling,
    load:   load,
    fire:   fire,
    reset:  reset
  };

};
