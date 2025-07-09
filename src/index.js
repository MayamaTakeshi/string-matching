const MatchingError = require ('./matching_error')

var _set_key = (key, val, dict, throw_matching_error, path) => {
  if(dict[key]) {
    if(dict[key] != val) {
      if(throw_matching_error) {
        throw new MatchingError(path, `key '${key}' cannot be set to '${val}' because it is already set to '${dict[key]}'`)
      } else {
        return false
      }
    }
  } else {
    dict[key] = val
  }

  return true
}

function escapeRegex(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function buildRegexFromPattern(pattern) {
  const regexParts = [];
  const keys = [];

  let lastIndex = 0;
  const collectorRegex = /!{(@?)([a-zA-Z0-9_]+)(?::([a-z]+))?(?::([0-9]+))?}/g;
  let m;

  while ((m = collectorRegex.exec(pattern)) !== null) {
    // Add literal before collector
    if (m.index > lastIndex) {
      regexParts.push(escapeRegex(pattern.slice(lastIndex, m.index)));
    }

    const isArray = m[1] === '@';
    const key = m[2];
    const type = m[3] || 'str';
    const length = m[4] ? parseInt(m[4], 10) : null;

    if (length != null) {
      regexParts.push(`(.{${length}})`);
    } else {
      // Match anything non-greedy until next literal or end
      regexParts.push('(.+?)');
    }

    keys.push({ key, type, isArray });
    lastIndex = m.index + m[0].length;
  }

  // Add remaining literal
  if (lastIndex < pattern.length) {
    regexParts.push(escapeRegex(pattern.slice(lastIndex)));
  }

  const regex = new RegExp('^' + regexParts.join('') + '$');
  return { regex, keys };
}

function convertValue(str, type) {
  switch (type) {
    case 'num':
    case 'dec': return parseInt(str, 10);
    case 'hex': return parseInt(str, 16);
    case 'bin': return parseInt(str, 2);
    case 'oct': return parseInt(str, 8);
    default: return str;
  }
}

var _match = (regex, keys, received, dict, throw_matching_error, path) => {
  const m = regex.exec(received);
  if (!m) {
    if(throw_matching_error) {
      throw new Error(`No match for path=${path}`)
    } else {
      return false;
    }
  }

  for (let i = 0; i < keys.length; i++) {
    const { key, type, isArray } = keys[i];
    if(key == '_') {
      continue
    }

    const rawVal = m[i + 1];
    const val = convertValue(rawVal, type);
    if (isArray) {
      if (!dict[key]) {
        dict[key] = [];
      } else {
        if(!Array.isArray(dict[key])) {
          if(throw_matching_error) {
            throw new MatchingError(path, `value ${val}' cannot be pushed to ${key} because it is not an array. path=${path}`)
          } else {
            return false
          }
        }
      }
      dict[key].push(val)
    } else {
      _set_key(key, val, dict, throw_matching_error, path)
    }
  }

  return true
}

var gen_matcher = (expected) => {
  const { regex, keys } = buildRegexFromPattern(expected);

  return (received, dict, throw_matching_error, path) => {
    return _match(regex, keys, received, dict, throw_matching_error, path)
  }
}

var match = (expected, received, dict, throw_matching_error, path) => {
  var matcher = gen_matcher(expected)
  return matcher(received, dict, throw_matching_error, path)
}

module.exports = {
  gen_matcher: gen_matcher,
  match: match,
  MatchingError: MatchingError,
}

