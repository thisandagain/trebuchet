/**
 * Mustache / juice template compilation.
 *
 * @package trebuchet
 * @author Andrew Sliwinski <andrew@diy.org>
 */

/**
 * Dependencies
 */
var fs          = require('fs'),
    path        = require('path');

var _           = require('underscore'),
    mustache    = require('mu2'),
    juice       = require('juice');

/**
 * Mustache compiler.
 */
function compileMustache (path, data, callback) {
    // Storage object
    var buffer = '';

    // Compile
    mustache.compileAndRender(path, data)
        .on('error', function (err) {
            return callback(err);
        })
        .on('data', function (data) {
            buffer += data.toString();
        })
        .on('end', function () {
            callback(null, buffer);
        });
}

/**
 * Juice compiler.
 */
function compileJuice (path, buffer, callback) {
    if (path === null) return callback(null, buffer);
    
    fs.readFile(path, 'utf8', function (err, style) {
        if (err) return callback(err);
        
        buffer = juice(buffer, style);
        callback(null, buffer);
    });
}

/**
 * Compiles templates and returns rendered result.
 *
 * @param {Object} Options
 *      - html {String} Path to html template OR prerendered html or buffer
 *      - css {String} Path to css template
 *      - text {String} Path to text template OR prerendered text or buffer
 *      - data {Object} Template locals
 * @param {String} File path
 * @param {String} File path
 * @param {String} File path
 * @param {Object} Template locals
 * @param {String} Template directory
 * 
 * @return {Function}
 */
module.exports = function (options, callback) {
    _.defaults(options, {
        prerendered :   null,
        html:           null,
        css:            null,
        text:           null,
        data:           {}
    });

    if(options.prerendered){
        //echo prerendered data back
        if(!options.html) return callback("Missing prerendred HTML option");
        if(!options.text) return callback("Missing prerendred text option");

        // allow for passing a buffer rather than a string
        if(typeof options.html == 'object'){
            options.html = options.html.toString();
        }
        if(typeof options.text == 'object'){
            options.text = options.text.toString();
        }

        return callback(null, {
            html : options.html,
            text : options.text
        });
    }

    // Clear cache
    if (process.env.NODE_ENV !== 'production') mustache.clearCache();

    // Validate file paths
    if (!fs.existsSync(options.html)) return callback('Invalid html template file path: ' + options.html);
    if (!fs.existsSync(options.text)) return callback('Invalid text template file path: ' + options.text);
    if (options.css !== null && !fs.existsSync(options.html)) return callback('Invalid css template file path: ' + options.css);

    // Processor
    function render (input, data, css, callback) {
        compileMustache(input, data, function (err, html) {
            if (err) return callback(err);
            compileJuice(css, html, callback);
        });
    };

    // Compile & return HTML
    render(options.html, options.data, options.css, function (err, html) {
        if (err) return callback(err);

        // Compile & return TEXT
        render(options.text, options.data, null, function (err, text) {
            if (err) return callback(err);

            callback(null, {
                html: html,
                text: text
            });          
        });
    });
};