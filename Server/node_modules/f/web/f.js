var f = (function() {

  function parseArgList(argList) {

    var args;
    var kwargs = {};

    if (typeof argList[argList.length - 1] === 'object' && argList[argList.length - 1] !== 'null') {
      kwargs = argList.pop();
    }

    args = argList.slice();

    return JSON.stringify({
      args: args,
      kwargs: kwargs
    });

  }

  function f(name, mode, config) {

    name = name[name.length - 1] === '/' ? name : name + '/';
    mode = mode || 'json';
    config = config || f.config;

    return function external() {

      var argList = [].slice.call(arguments);
      var callback = function() {};
      var payload;
      var headers;
      var req;

      if (typeof argList[argList.length - 1] === 'function') {
        callback = argList.pop();
      }

      if (mode === 'json') {
        headers = {'Content-Type': 'application/json'};
        payload = parseArgList(argList);
      } else if (mode === 'command') {
        headers = {'Content-Type': 'application/command'};
        payload = argList[0];
      } else if (mode === 'file') {
        headers = {'Content-Type': 'application/octet-stream'};
        payload = argList[0];
      } else {
        return callback(new Error('Invalid function mode: ' + mode));
      }

      var xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        '//' + config.gateway.host +
        (config.gateway.port ? ':' + config.gateway.port : '') +
        config.gateway.path + name
      );
      xhr.responseType = 'blob';
      Object.keys(headers).forEach(function(h) { xhr.setRequestHeader(h, headers[h]); });
      xhr.addEventListener('readystatechange', function() {

        if (xhr.readyState === 0) {
          return callback(new Error('Request aborted.'));
        }

        if (xhr.readyState === 4) {

          if (xhr.status === 0) {
            return callback(new Error('Could not run function.'));
          }

          var response = xhr.response;
          var contentType = response.type;
          var resheaders = xhr.getAllResponseHeaders();

          if (
            contentType === 'application/json' ||
            contentType.match(/^text\/.*$/i) ||
            ((xhr.status / 100) | 0) !== 2
          ) {
            var reader = new FileReader();
            reader.addEventListener('loadend', function() {
              var result = reader.result;
              if (((xhr.status / 100) | 0) !== 2) {
                return callback(new Error(result));
              } else if (contentType === 'application/json') {
                try {
                  result = JSON.parse(reader.result);
                } catch(e) {
                  return callback(new Error('Invalid Response JSON'));
                }
              }
              return callback(null, result, resheaders);
            });
            reader.readAsText(response);
          } else {
            return callback(null, response, resheaders);
          }

        }

      });

      xhr.send(payload);

    };

  };

  f.config = {
    gateway: {
      host: 'f.stdlib.com',
      port: '',
      path: '/'
    }
  };

  return f;

})();
