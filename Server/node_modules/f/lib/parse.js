function convertString(value) {

  if (value && value[0] === '"') {
    try {
      value = JSON.parse(value);
    } catch (e) {
      // do nothing
    }
  }

  return value;

}

function parseArgumentArray(str) {

  var arr = [];

  var quotation = false;
  var escape = false;

  var word = '';

  for (i = 0; i < str.length; i++) {
    if (!quotation && str[i] === ' ') {
      word = convertString(word);
      arr.push(word);
      word = '';
      balancer = [];
    } else {
      if (str[i] === '\\') {
        escape = !escape;
      } else {
        if (str[i] === '"' && !escape) {
          quotation = !quotation;
        }
        escape = false;
      }
      word = word + str[i];
    }
  }

  word.length && arr.push(convertString(word));

  return arr;

};

function parseArg(result, str) {

  var quotation = false;
  var escape = false;
  var value = null;
  var json = false;
  var remainder = '';

  if (result.keyword && (str[0] + str[1]) == '--') {

    result.value = '';
    result.remainder = str;

  } else {

    for (i = 0; i < str.length; i++) {
      if (!quotation && str.substr(i, 3) === ' --') {
        value = str.substr(0, i);
        remainder = str.substr(i + 1);
        break;
      } else if (str[i] === '\\') {
        escape = !escape;
      } else {
        if (str[i] === '"' && !escape) {
          quotation = !quotation;
        }
        escape = false;
      }
    }

    if (i === str.length) {
      value = str.length ? str : null;
      remainder = '';
    }

    result.value = result.keyword ? convertString(value) : parseArgumentArray(value);
    result.remainder = remainder;

  }

  return result;

}

function parseParams(str) {

  if (!str.length) {
    return null;
  }

  var result = {
    keyword: null,
    value: null,
    remainder: ''
  };

  var i;

  if (str[0] + str[1] === '--') {
    str = str.substr(2);
    i = str.indexOf(' ');
    if (i === -1) {
      result.keyword = str;
      str = '';
    } else {
      result.keyword = str.substr(0, i);
      str = str.substr(i + 1);
    }
  }

  return parseArg(result, str);

}

function parseString(str) {

  var params = {
    args: [],
    kwargs: {}
  };

  var result;
  var keyword;
  var value;

  while (result = parseParams(str)) {

    keyword = result.keyword;
    value = result.value;
    str = result.remainder;

    if (keyword === null) {
      params.args = value;
    } else {
      params.kwargs[keyword] = value;
    }

  }

  return params;

};

function parseArgList(argList) {

  var args;
  var kwargs = {};
  var params = {};

  if (typeof argList[argList.length - 1] === 'object' && argList[argList.length - 1] !== 'null') {
    kwargs = argList.pop();
  }

  args = argList.slice();

  params.args = args;
  params.kwargs = kwargs;

  return params;

}

module.exports = {
  fromString: parseString,
  fromArgList: parseArgList
};
