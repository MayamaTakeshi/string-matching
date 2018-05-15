const smp = require('./string_matching_parser')

var _set_key = (step, val, dict) => {
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
		if(isNaN(v)) throw new Error("Invalid value for key '" + step.name + "'")
	}

	if(dict[step.name]) {
		if(dict[step.name] != v) throw new Error(step.name + " value cannot be set to " + v + " because it is already set to " + dict[step.name])
	} else {
		dict[step.name] = v
	}
}

var _match = (steps, received, dict, throw_matching_errors) => {
	if(typeof received != 'string') throw new Error('Received element is not string')

	var remainder = received
	
	for(var i=0 ; i<steps.length ; i++) {
		var step = steps[i]

		if(step.op == 'consume') {
			if(remainder.substr(0, step.str.length) != step.str){
				if(throw_matching_errors) {
					throw new Error("Expected substr '" + step.str + "' not found")
				} else {
					return false
				}
			}
			remainder = remainder.slice(step.str.length)
		} else if(step.op == 'collect') {
			var collected_str
			if(step.length) {
				collected_str = remainder.substring(0, step.length)
				if(collected_str.length < step.length) throw new Error("Not enough chars to be collected in element")
					
				remainder = remainder.slice(step.length)
			} else {
				var next_step = steps[i+1]
				if(next_step) {
					var pos = remainder.indexOf(next_step.str)
					if(pos < 0) {
						if(throw_matching_errors) {
							// we dont use (pos <= 0) because it is OK to collect empty strings
							throw new Error("Expected string collection delimiter '" + next_step.str + "' not found")
						} else {
							return false
						}
					}
					collected_str = remainder.substring(0, pos)
					remainder = remainder.slice(collected_str.length)
				} else {
					// collect till the end
					collected_str = remainder
					remainder = ""
				}
			}
			_set_key(step, collected_str, dict)
		} else {
			if(throw_matching_errors) {
				throw new Error("Invalid match step")
			} else {
				return false
			}
		}
	}	
	return true
}

var gen_matcher = (expected, throw_matching_errors) => {
	var steps
	try {
		steps = smp.parse(expected)
	} catch (e) {
		console.error(e)
		throw new Error("Invalid string match expression '" + expected + "'")
	}
	return (received, dict) => {
		return _match(steps, received, dict, throw_matching_errors)
	} 
}

var match = (expected, received, dict) => {
	var matcher = gen_matcher(expected)
	return matcher(received, dict) 
}

module.exports = {
	gen_matcher: gen_matcher,
	match: match,
}
