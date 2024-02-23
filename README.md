# string-matching

Checks strings against patterns and collects matched substrings

## Sample usage

```

var assert = require('assert')
var match = require('string-matching').match

var d = {}
var expected = 'mailto:!{username}@!{domain}'
var received = 'mailto:popeye@thimbletheater.com'
assert(match(expected, received, d))
console.dir(d) // { username: 'popeye', domain: 'thimbletheater.com' }

```

## Specification

Basically, we implement a substring collection language.

You define a substring collector using this notation: '!{KEY}'.

The match function will receive a dict and will update its keys with the data extracted by the matching operation.

The substring will be delimited by other fixed substrings like "mailto:" and "@"

Also, you can specify the type and length of substring to collect.

The types can be 'str', 'num', 'dec', 'hex', 'bin' and 'oct'.

So if you want to collect an hex substring with 4 chars of length you can specify the collector this way: "!{KEY:hex:4}"

Ex:
```
var assert = require('assert')
var match = require('string-matching').match

var d = {}
var expected = 'data:!{part1:str:4}!{part2:dec:4}!{part3:hex:4}!{part4:bin:8}'
var received = 'data:abcd1234aabb11111111'
assert(match(expected, received, d))
console.dir(d) // { part1: 'abcd', part2: 1234, part3: 43707, part4: 255 }
assert(d.part1 == 'abcd')
assert(d.part2 == 1234)
assert(d.part3 == 0xaabb)
assert(d.part4 == 0b11111111)
```
Notice we convert numeric substrings to numbers.

It is also possible to collect substrings and push them to an array stored in a specific key (the array is created if it doesn't exist).
Ex:

```
var assert = require('assert')
var match = require('string-matching').match

var expected = '!{@list},!{@list},!{@list}'
var received = 'abc,def,ghi'

var d = {}

assert(match(expected, received, d))

assert.deepEqual(d, {list: ['abc', 'def', 'ghi']})

console.dir(d) // { list: [ 'abc', 'def', 'ghi' ] }

```

