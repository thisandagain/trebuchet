
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
module.exports = function (trebuchetOptions) {

  // If the param is a string then it is simply an apikey
  // NOTE: this will need cleaned up, prob with `_.defaults`
  var apikey, templateDirectory, env;
  if (trebuchetOptions instanceof String) {
    apikey = trebuchetOptions;
  } else if (typeof trebuchetOptions === 'object') {
    // apikey
    if ('apikey' in trebuchetOptions) {
      apikey = trebuchetOptions.apikey;
    } else {
      throw 'Please specify an apikey';
    }
    // env
    if ('env' in trebuchetOptions) {
      env = trebuchetOptions.env;
    }
    // templateDirectory
    if ('templateDirectory' in trebuchetOptions) {
      templateDirectory = trebuchetOptions.templateDirectory;
    }
  }

  // Otherwise if it is an object then we need to do some magic


  // ## Set initial variables
  var outbox     = []
    , clearCache = false
    , dev        = 'development';


  // ## Determine if we're in development mode and need to clear cache
  if (typeof env !== 'undefined' && (env === dev || env === dev.toUpperCase()) ) {
    clearCache = true;
  }


  // ## Fling - sends a single email to a single target
  // * options [Object] - params: Postmark API "params", e.g. from, to, subject
  //                    - html
  //                    - css
  //                    - text
  //                    - data
  // * callback [Function]
  var fling = function (options, callback) {
    _.defaults(options, {
        params: {}
      , html: ''
      , css: ''
      , text: ''
      , data: {}
      , templateName: ''
    });
    compile(options.html, options.css, options.text, options.data, options.templateName, function (err, content) {
      var message = options.params;
      // TODO: do something with errors here
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
      , css: ''
      , text: ''
      , data: {}
      , templateName: ''
    });

    compile(options.html, options.css, options.text, options.data, options.templateName, function (err, content) {
      var message = options.params;
      // TODO: do something with errors here
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
  //
  // **NEW**
  // * html         [String]   - file path
  // * css          [String]   - file path
  // * text         [String]   - file path
  // * data         [Object]   - template locals
  // * templateName [String]   - template directory
  // * callback     [Function] - callback
  //
  // **OLD**
  // * html     [String]   - file path
  // * text     [String]   - file path
  // * data     [Object]   - template locals
  // * callback [Function] - callback
  //
  var compile = function (html, css, text, data, templateName, callback) {


    // Check if we're going to use a template
    if (templateName !== '') {
      if (templateDirectory === 'undefined') throw 'You must specify a template directory';
      html = path.join(templateDirectory, templateName, 'index.html');
      css  = path.join(templateDirectory, templateName, 'index.css');
      text = path.join(templateDirectory, templateName, 'index.txt');
    }

    // Check if we're going to use juice
    var juiced = false;
    if (css !== '') juiced = true;

    // Cache cache
    if (clearCache) mustache.clearCache();

    // Processor
    var proc = function (input, data, css, callback) {
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
          // Utilize juice to compile HTML with inline CSS styling
          if (juiced) {
            fs.readFile(css, 'utf8', function(err, style) {
              if (err) {
                callback(err);
              } else {
                buffer = juice(buffer, style);
                callback(null, buffer);
              }
            });
          } else {
            callback(null, buffer);
          }
        });
    };

    // Compile & return HTML and text inputs
    async.auto({
      html: function (callback) { proc(html, data, css, callback); },
      text: function (callback) { proc(text, data, css, callback); }
    }, callback);

  };


  // ## Sends request to the Postmark API.
  // * message  [Object]
  // * callback [Function]
  var url = {
    batch: 'https://api.postmarkapp.com/email/batch',
    email: 'https://api.postmarkapp.com/email'
  };
  var send = function (message, callback) {
    var uri = (_.isArray(message)) ? url.batch : url.email;
    request({
      uri: uri,
      method: 'POST',
      headers: { 'X-Postmark-Server-Token': apikey },
      json: message
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
    fling: fling,
    load: load,
    fire: fire,
    reset: reset
  };

};
