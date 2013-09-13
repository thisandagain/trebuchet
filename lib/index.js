/**
 * Trebuchet - Let's chuck some email!
 *
 * @author Andrew Sliwinski <andrew@diy.org>
 * @contributor Nick Baugh <niftylettuce@gmail.com>
 */

/**
 * Dependencies
 */
var _           = require('underscore');

var compile     = require('./compile'),
    send        = require('./send');

/**
 * Module
 */
module.exports = function (apikey) {

    // Storage object
    var outbox     = []

    /**
     * Sends a single email to a single target
     *
     * @param {Object} - params: Postmark API "params", e.g. from, to, subject
     *                 - html {String, Required}
     *                 - text {String, Required}
     *                 - css {String, Optional}
     *                 - data {Object, Optional}
     *
     * @return {Function}
     */
    var fling = function (options, callback) {
        compile(options, function (err, content) {
            if (err) return callback(err);

            try {
                var message         = options.params;
                message.htmlbody    = content.html;
                message.textbody    = content.text;
                send(message, apikey, callback);
            } catch (err) {
                callback(err);
            }
        });
    };

    /**
     * Loads a piece of mail into the outbox.
     *
     * @param {Object} Postmark API params (see fling method)
     *
     * @return {Number}
     */
    var load = function (options, callback) {
        compile(options, function (err, content) {
            if (err) return callback(err);

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
    * @return {Object}
    */
    var fire = function (callback) {
        send(outbox, apikey, function (err, obj) {
            reset(function () {
                callback(err, obj);
            });
        });
    };

    /**
    * Resets (purges) the outbox.
    *
    * @return {Number}
    */
    var reset = function (callback) {
        outbox = [];
        callback(null, outbox.length);
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