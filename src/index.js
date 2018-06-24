const MatchingError = require ('./matching_error')
const smp = require('./string_matching_parser')

var _set_key = (step, val, dict, throw_matching_error, path) => {
	var v
	if(!step.type || step.type == 'str') {
		v = val	
	} else {
		switch(step.type) {
		case 'num':
			v = parseFloat(val)
			break
		case 'hex':
			v = parseInt(val, 16)
			break
		case 'bin':
			v = parseInt(val, 2)
			break
		case 'oct':
			v = parseInt(val, 8)
			break
		default:
			throw new Error("Unexpected step.type='" + step.type + "'")
		}
		if(isNaN(v)) throw new Error(`${path}: Invalid value for key '${step.name}'`)
	}

	if(dict[step.name]) {
		if(dict[step.name] != v) {
			if(throw_matching_error) {
				throw new MatchingError(path, `key '${step.name}' cannot be set to '${v}' because it is already set to '${dict[step.name]}'`)
			} else {
				return false
			}
		}
	} else {
		dict[step.name] = v
	}

	return true
}

var _match = (steps, received, dict, throw_matching_error, path) => {
	if(typeof received != 'string') {
		if(throw_matching_error) throw new MatchingError(path, "not string")
		return false
	}

	var remainder = received

	var collected = [];
	
	for(var i=0 ; i<steps.length ; i++) {
		var step = steps[i]

		if(step.op == 'consume') {
			if(remainder.substr(0, step.str.length) != step.str){
				if(throw_matching_error) throw new MatchingError(path, `expected substr '${step.str}' not found`)
				return false
			}
			remainder = remainder.slice(step.str.length)
		} else if(step.op == 'collect') {
			var collected_str
			if(step.length) {
				collected_str = remainder.substring(0, step.length)
				if(collected_str.length < step.length) {
					if(throw_matching_error) throw new MatchingError(path, "not enough chars to be collected in element")
					return false
				}
				remainder = remainder.slice(step.length)
			} else {
				var next_step = steps[i+1]
				if(next_step) {
					var pos = remainder.indexOf(next_step.str)
					if(pos < 0) {
						// we dont use (pos <= 0) because it is OK to collect empty strings
						if(throw_matching_error) throw new MatchingError(path, `expected string collection delimiter '${next_step.str}' not found`)
						return false
					}
					collected_str = remainder.substring(0, pos)
					remainder = remainder.slice(collected_str.length)
				} else {
					// collect till the end
					collected_str = remainder
					remainder = ""
				}
			}
			collected.push([step, collected_str])
		} else {
			throw new Error(`${path}: Invalid match step ${JSON.stringify(step)}. This might be bug in our code.`)
		}
	}
	collected.forEach(function(a) {
		var step = a[0];
		var val = a[1];
		if(!_set_key(step, val, dict, throw_matching_error, path)) {
			return false
		}
	});
	return true
}

var gen_matcher = (expected) => {
	var steps
	try {
		steps = smp.parse(expected)
	} catch (e) {
		console.error(e)
		throw new Error("Invalid string match expression '" + expected + "'")
	}
	return (received, dict, throw_matching_error, path) => {
		return _match(steps, received, dict, throw_matching_error, path)
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

