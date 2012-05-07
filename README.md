# Trebuchet
#### Let's chuck some email!

Trebuchet is a node.js module for super simple email transactions using the [Postmark API](http://postmarkapp.com) and [Mustache](http://mustache.github.com/) for templating. Trebuchet was designed with simple email rendering, batching and API operations in mind.

## Installation
    npm install trebuchet

## Templating
Trebuchet uses [Mustache](http://mustache.github.com/) templates to make sending dynamic HTML and plain-text emails super-duper simple. 

An example template:
```html
<html>
    <body>
        <h1>{{greeting}}</h1>
    </body>
</html>
````

With example data:
```javascript
{
    greeting: 'Hello World!'
}
````

Result:
```html
<html>
    <body>
        <h1>Hello World!</h1>
    </body>
</html>
````

## Basic Use (Fling Pattern)
```javascript
var trebuchet = require('trebuchet')('yourapikey');

trebuchet.fling({
    params:     {
        from:       'you@domain.com',
        to:         'someone@domain.com',
        subject:    'This is only a test of the fling pattern'
    },
    html:       'path/to/template/fling.html',
    text:       'path/to/template/fling.txt',
    data:       {
        foo:        'Bar'
    }
}, function (err, response) {
    // Win!
});
````

## Batch Sender (Load --> Fire Pattern)
The batch sender uses the [Postmark API's batch method](http://developer.postmarkapp.com/developer-build.html#batching-messages) to support sending groups of messages (up to 500 at a time).

```javascript
var trebuchet = require('trebuchet')('yourapikey');

trebuchet.load({
    params:     {
        from:       'you@domain.com',
        to:         'someone@domain.com',
        subject:    'This is only a test of the load/fire pattern'
    },
    html:       'path/to/template/fire.html',
    text:       'path/to/template/fire.txt',
    data:       {
        foo:        'Bar',
        name:       'Bubba'
    }
}, function (err, response) {
    // Loaded!
});
````

```javascript
trebuchet.fire(function (err, response) {
    // Win! 
});
````

## Testing
    node test/* --from "you@domain.com" --to "someone@domain.com"