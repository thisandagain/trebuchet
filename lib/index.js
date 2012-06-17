/**
 * Trebuchet - Let's chuck some email!
 *
 * @package  trebuchet
 * @author  Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var fs          = require('fs'),
    path        = require('path'),
    
    _           = require('underscore'),
    async       = require('async'),
    request     = require('request'),
    mustache    = require('mu2');

/**
 * Module
 */
module.exports = function (apikey) {

    var outbox = [];

    // -------------------------

    /**
     * Sends a single email to a single target.
     *
     * @param  object  Options
     *                      - Postmark API "params" (from, to, subject, etc.)
     *                      - html (HTML template)
     *                      - text (Text template)
     *                      - data (Render data)
     *
     * @return  object
     */
    var fling = function (options, callback) {
        _.defaults(options, {
            params: {},
            html: '',
            text: '',
            data: {}
        });

        //

        compile(options.html, options.text, options.data, function (err, content) {
            if (err) {
                callback(err);
            } else {
                var message = options.params;
                message.htmlbody = content.html;
                message.textbody = content.text;

                send(message, callback);
            }
        });
    };

    /**
     * Loads a piece of mail into the outbox.
     *
     * @param  object  Postmark API params
     *
     * @return  object
     */
    var load = function (options, callback) {
        _.defaults(options, {
            params: {},
            html: '',
            text: '',
            data: {}
        });

        //

        compile(options.html, options.text, options.data, function (err, content) {
            var message = options.params;
            message.htmlbody = content.html;
            message.textbody = content.text;

            if (outbox.length >= 500) {
                callback('Postmark API batch size limit has been reached.', outbox.length);
            } else {
                outbox.push(message);
                callback(null, outbox.length);
            }
        });
    };

    /**
     * Fires all of the mail in the outbox.
     *
     * @param  object  Options
     *
     * @return  array
     */
    var fire = function (callback) {
        send(outbox, function (err, obj) {
            reset(function () {
                callback(err, obj);
            });
        });
    };

    /**
     * Resets (purge) the mailbox.
     *
     * @return  object
     */
    var reset = function (callback) {
        outbox = [];
        callback(null, outbox.length);
    };

    // -------------------------

    /**
     * Compiles templates and returns rendered result.
     *
     * @param  string  HTML template path
     * @param  string  Text template path
     * @param  object  Template data
     *
     * @return  object
     */
    var compile = function (html, text, data, callback) {
        // Cache policy
        if (process.env.NODE_ENV == 'DEVELOPMENT') mustache.clearCache();

        // Processor
        var proc = function (input, data, callback) {
            var abspath = path.resolve(input);
            var buffer  = '';
            mustache.compileAndRender(abspath, data)
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
            html:   function (callback) { proc(html, data, callback); },
            text:   function (callback) { proc(text, data, callback); }
        }, callback);
    };

    /**
     * Sends request to the Postmark API.
     *
     * @param  object  Message
     * 
     * @return  object
     */
    var send = function (message, callback) {
        var uri = (_.isArray(message)) ? 'https://api.postmarkapp.com/email/batch' : 'https://api.postmarkapp.com/email';

        request({
            uri:        uri,
            method:     'POST',
            headers:    {
                'X-Postmark-Server-Token': apikey
            },
            json:       message,
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

    // -------------------------
    // -------------------------

    return {
        fling:  fling,
        load:   load,
        fire:   fire,
        reset:  reset
    };

};