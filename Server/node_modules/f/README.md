# ![f](http://stdlib.com/static/images/f-128.png)
## Functional Microservice Request Library

`f` is a Functional Microservice Request Library. It's a zero-dependency module
that wraps HTTP(S) requests, intended for use with stateless, functional
microservices. It's built to work out-of-the-box with services created using
[the stdlib microservice registry](https://stdlib.com), but can be
configured to use any gateway (and associated platform or infrastructure provider).

## Installation

### Node.js

For usage in an existing Node.js project, add it to your dependencies:

```
$ npm install f
```

And use it with the following line wherever you need it:

```javascript
const f = require('f');
```

### Web

Using Bower...

```
$ bower install poly/f
```

Or, simply copy `web/f.js` to wherever you keep your vendor scripts and include
it as a script:

```html
<script src="path/to/f.js"></script>
```

## How do I use f?

`f` creates HTTP(S) requests following a custom specification that maps very
closely to function invocation you're used to (as if it were running in a
	native environment). Let's say we have a microservice running on
	[stdlib](https://stdlib.com) that calculates great-circle distances given
	two sets of coordinates using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula).

The call to this service using `f`, might look like this;

```javascript
// Calculate distance from Toronto to San Francisco
f('polybit/haversine')({
	from: [43.65, -79.38],
	to: [37.77, -122.42]
}, (err, result) => {

	console.log(result); // logs 3644329 (metres!)

});
```

## Parameters: Arguments and Keyword Arguments

Usually when we make HTTP requests we think of querystring parameters, form-data,
urlencoded variables and of course, json. With `f`, our goal is to standardize
the way functional microservices are invoked (and deal with parameters) by
referencing familiar concepts; function *arguments* and *keyword arguments*.

Arguments (`args`) are passed to functions as an array of basic JSON types
(non-objects); number, boolean, string, null. Keyword arguments are allowed to
be anything JSON-serializable (Objects and Arrays). The basic structure for
function calls with `f` is the following;

```javascript
let fn = f('route/to/function');
fn(arg_1, ..., arg_n, {kwarg_1: val_1, ... kwarg_n: val_n}, callback);
```

This maps to an HTTP request with the following POST data in the body;

```
{
	"args": [arg_1, ..., arg_n],
	"kwargs": {
		"kwarg_1": val_1,
		...
		"kwarg_n": val_n
	}
}
```

Which should be interpreted by a functional microservice (server-side) as;

```javascript
module.exports = (params, callback) => {
	// params.args == [arg_1, ..., arg_n]
	// params.kwargs == {kwarg_1: val_1, ..., kwarg_n: val_n}
	callback(null, 'Hello World');
};
```

**Note** that every parameter is optional. It's up to whoever creates the
microservice to lay out the expectation of which arguments / keyword arguments
are supported, which can be done using descriptions on services like
[stdlib](https://stdlib.com) or [GitHub](https://github.com).

## Sending Files

To send raw file (`Buffer`) data, simply provide `'file'` as a string to the
second argument when referencing the function:

```javascript
f('path/to/func', 'file')(new Buffer(0), callback);
```

This will send POST data with exactly the `Buffer` contents.

## Configuring Gateway

If you don't feel like using stdlib's gateway at https://f.stdlib.com/, simply
configure the gateway as follows;

```javascript
const f = require('f');
f.config.gateway = {
	host: 'my.host',
	port: 8080,
	path: '/'
};
```

You can, alternatively, pass in custom configuration as a third parameter on a
per-function basis.

```javascript
let fn = f('path/to/func', 'json', {host: 'my.host', port: 8080, path: '/'});
fn(arg0, ..., callback);
```

## Why Use Microservices?

Microservices are tremendously useful for offloading computationally
expensive tasks from your core infrastructure, or providing standardized
functionality to many different systems (at the cost of a few ms of network latency).

An example would be image processing. Resizing, cropping and editing may not be
done frequently on your webserver, but when it does happen, it can slow everything
down. Offloading to a scalable, stateless microservice that your application simply
calls via the `f` module is a simple solution.

Another example would be the haversine distance formula given above. You may
have found a great npm package, but what if that service functionality needs
to be shared across multiple applications written in different languages? Python
and Ruby are both capable of making simple HTTP requests to a microservice, but
do not share packages in common with the Node ecosystem. Microservices solve
this problem.

We plan to have more SDKs out in the coming months. :)

## Where can I find Microservices to use?

You can find a list of available microservices on [stdlib's search page](https://stdlib.com/search),
where the `f` team (Polybit Inc.) is hard at work creating a central registry
of microservices for the web. Feel free to test drive a basic service or create
your own.

You can create microservices using the [stdlib CLI tools](https://github.com/poly/stdlib),
but microservice development is out of the scope of the `f`
package directly. It is handled on a platform and infrastructure provider basis.

## Thanks!

The `f` package is &copy; 2016 Polybit Inc. and happily MIT licensed.

Go wild! Contributors welcome, but we ask that PRs don't introduce
dependencies and mostly focus on bugfixes and usability.

Sign up for [stdlib: A Standard Library for Microservices](https://stdlib.com).

Follow us on Twitter [@polybit](https://twitter.com/polybit).
