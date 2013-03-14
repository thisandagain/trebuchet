/**
 * Postmark API adapter.
 *
 * @package trebuchet
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var _       = require('underscore'),
    request = require('request');

/**
 * Sends a request to the Postmark API.
 *
 * @param {Object} Message
 *
 * @param {Function}
 */
module.exports = function (message, apikey, callback) {
    var url = {
        batch: 'https://api.postmarkapp.com/email/batch',
        email: 'https://api.postmarkapp.com/email'
    };

    var uri = (_.isArray(message)) ? url.batch : url.email;

    request({
        uri:        uri,
        method:     'POST',
        headers:    { 'X-Postmark-Server-Token': apikey },
        json:       message
    }, function (err, response, body) {
        if (err) return callback(err);
        if (response.statusCode !== 200) return callback(body.Message);
        callback(null, body);
    });
};