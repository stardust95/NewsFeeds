'use strict';
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var parse = require('./parse.js');

function f(name, mode, config) {

  name = name[name.length - 1] === '/' ? name : name + '/';
  mode = mode || 'json';
  config = config || f.config;

  return function external() {

    var argList = [].slice.call(arguments);
    var callback = function() {};
    var params;
    var payload;
    var headers;
    var req;

    var pkgjson;
    var fnjson;
    var fn;
    var env;

    var responded = false;

    if (typeof argList[argList.length - 1] === 'function') {
      callback = argList.pop();
    }

    if (mode === 'json') {
      headers = {'Content-Type': 'application/json'};
      params = parse.fromArgList(argList);
      payload = new Buffer(JSON.stringify(params));
    } else if (mode === 'command') {
      headers = {'Content-Type': 'application/json'};
      params = parse.fromString(argList[0]);
      payload = new Buffer(JSON.stringify(params));
    } else if (mode === 'file') {
      if (!argList[0] instanceof Buffer) {
        return callback(new Error('Expecting Buffer for function mode: ' + mode));
      }
      headers = {'Content-Type': 'application/octet-stream'};
      params = parse.fromArgList([]);
      payload = argList[0];
    } else {
      return callback(new Error('Invalid function mode: ' + mode));
    }

    // if it's a string and the first character is a period...
    if (typeof name === 'string' && name[0] === '.') {
      try {
        let fnpath = path.join(process.cwd(), 'f', name, 'index.js');
        let fnjpath = path.join(process.cwd(), 'f', name, 'function.json');
        if (!config.local.cache) {
          delete require.cache[require.resolve(fnpath)];
          delete require.cache[require.resolve(fnjpath)];
        }
        name = require(fnpath);
        name.json = require(fnjpath);
      } catch (e) {
        callback(new Error('Could not find local function "' + name + '"'));
        return true;
      }
    }

    // if it's a function, it's being called locally
    if (typeof name === 'function') {
      params.env = process.env.ENV || 'dev';
      params.service = '.';
      params.remoteAddress = '::1';
      params.buffer = payload;
      return name(params, (err, result, headers) => {
        if (err) {
          return callback(err);
        }
        headers = headers || {};
        headers = typeof headers === 'object' ? headers : {};
        let oheaders = (name.json && name.json.http && name.json.http.headers) || {};
        oheaders = typeof oheaders === 'object' ? oheaders : {};
        headers = Object.assign(oheaders, headers);
        return callback(err, result, headers);
      });
    }

    // Throw error if invalid function
    if (!name || typeof name !== 'string') {
      callback(new Error('Invalid function name'));
      return true;
    }

    req = [http, https][(config.gateway.port === 443) | 0].request({
      host: config.gateway.host,
      method: 'POST',
      headers: headers,
      port: config.gateway.port,
      path: config.gateway.path + name,
      agent: false
    }, function (res) {

      var buffers = [];
      res.on('data', function (chunk) { buffers.push(chunk); });
      res.on('end', function () {

        var response = Buffer.concat(buffers);
        var contentType = res.headers['content-type'] || '';

        if (contentType === 'application/json') {
          response = response.toString();
          try {
            response = JSON.parse(response);
          } catch(e) {
            response = null;
          }
        } else if (contentType.match(/^text\/.*$/i)) {
          response = response.toString();
        }

        // Prevent req error
        responded = true;

        if (((res.statusCode / 100) | 0) !== 2) {
          return callback(new Error(response));
        } else {
          return callback(null, response, res.headers);
        }

      });

    });

    req.on('error', function(err) {

      if (responded) {
        return;
      }

      callback(err);

    });

    req.write(payload);
    req.end();
    return;

  }

};

f.config = {
  gateway: {
    host: 'f.stdlib.com',
    port: 443,
    path: '/'
  },
  local: {
    cache: true
  }
};

module.exports = f;
