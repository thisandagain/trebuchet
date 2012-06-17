/**
 * Trebuchet - Let's chuck some email!
 *
 * @author Andrew Sliwinski <andrew@diy.org>
 * @contributor Nick Baugh <niftylettuce@gmail.com>
 */

/**
 * Dependencies
 */
var fs          = require('fs'),
    path        = require('path'),
    _           = require('underscore'),
    async       = require('async'),
    request     = require('request'),
    mustache    = require('mu2'),
    juice       = require('juice');

/**
 * Module
 */
module.exports = function (config) {

    // Storage object
    var outbox     = []

    // Configure w/ backwards compatible API key passed as string
    if (_.isString(config)) {
        config = {
            apikey: config
        };
    }

    _.defaults(config, {
        apikey: 'POSTMARK_API_TEST',
        env: 'PRODUCTION',
        templateDirectory: './templates'
    });

    // ---------------------------
    // ---------------------------

    /**
     * Fling - sends a single email to a single target
     *
     * @param {Object} - params: Postmark API "params", e.g. from, to, subject
     *                 - html
     *                 - css
     *                 - text
     *                 - data
     *
     * @return {Function}
     */
    var fling = function (options, callback) {
        _.defaults(options, {
            params: {},
            html: '',
            css: '',
            text: '',
            data: {},
            templateName: ''
        });

        compile(options.html, options.css, options.text, options.data, options.templateName, function (err, content) {
            if (err) callback(err);

            try {
                var message = options.params;
                message.htmlbody = content.html;
                message.textbody = content.text;
                send(message, callback);
            } catch (err) {
                callback(err);
            }
        });
    };

    /**
     * Loads a piece of mail into the outbox.
     *
     * @param {Object} Postmark API params
     *
     * @return {Function}
     */
    var load = function (options, callback) {
        _.defaults(options, {
            params: {},
            html: '',
            css: '',
            text: '',
            data: {},
            templateName: ''
        });

        compile(options.html, options.css, options.text, options.data, options.templateName, function (err, content) {
            if (err) callback(err);

            try {
                var message = options.params;
                message.htmlbody = content.html;
                message.textbody = content.text;
                if (outbox.length >= 500) {
                    callback('Postmark API batch size limit has been reached.', outbox.length);
                } else {
                    outbox.push(message);
                    callback(null, outbox.length);
                }
            } catch (err) {
                callback(err);
            }
        });
    };

    /**
    * Fires all of the mail in the outbox.
    *
    * @return {Function}
    */
    var fire = function (callback) {
        send(outbox, function (err, obj) {
            reset(function () {
                callback(err, obj);
            });
        });
    };

    /**
    * Resets (purges) the outbox.
    *
    * @return {Function}
    */
    var reset = function (callback) {
        outbox = [];
        callback(null, outbox.length);
    };

    /**
     * Compiles templates and returns rendered result.
     *
     * @param {String} File path
     * @param {String} File path
     * @param {String} File path
     * @param {Object} Template locals
     * @param {String} Template directory
     * 
     * @return {Function}
     */
    var compile = function (html, css, text, data, templateName, callback) {
        // Check if we're going to use a template
        if (templateName !== '') {
            html = path.join(config.templateDirectory, templateName, 'index.html');
            css  = path.join(config.templateDirectory, templateName, 'index.css');
            text = path.join(config.templateDirectory, templateName, 'index.txt');
        }

        // Check if we're going to use juice
        var juiced = false;
        if (css !== '') juiced = true;

        // Clear cache
        if (config.env.toUpperCase() === 'DEVELOPMENT') mustache.clearCache();

        // Processor
        var proc = function (input, data, css, callback) {
            var abspath = path.resolve(input),
            buffer  = '';
          
            mustache.compileAndRender(abspath, data)
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

    /**
     * Sends a request to the Postmark API.
     *
     * @param {Object} Message
     *
     * @param {Function}
     */
    var send = function (message, callback) {
        var url = {
            batch: 'https://api.postmarkapp.com/email/batch',
            email: 'https://api.postmarkapp.com/email'
        };

        var uri = (_.isArray(message)) ? url.batch : url.email;

        request({
            uri:        uri,
            method:     'POST',
            headers:    { 'X-Postmark-Server-Token': config.apikey },
            json:       message
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

    // ---------------------------
    // ---------------------------
  
    return {
        fling: fling,
        load: load,
        fire: fire,
        reset: reset
    };

};