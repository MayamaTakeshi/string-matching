# string-matching

Checks strings against patterns and collects matched substrings


```

var assert = require('assert')
var match = require('string-matching').match

var d = {}
assert(match('mailto:!{username}@!{domain}', 'mailto:popeye@thimbletheater.com', d))
console.dir(d) // { username: 'popeye', domain: 'thimbletheater.com' }


```

