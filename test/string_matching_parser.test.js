const smp = require('../src/string_matching_parser');

test('process CollectAndCollect', () => {
	var res = smp.parse(`!{user}@!{domain}`)

	expect(res).toEqual([
		{ op: 'collect', name: 'user' },
		{ op: 'consume', str: '@' },
		{ op: 'collect', name: 'domain' },
	])
})

test('single collect', () => {
		expect(smp.parse('!{something}')).toEqual([
		{ op: 'collect', name: 'something' },
	])

})

test('collect and delimiter', () => {
		expect(smp.parse('!{something}#')).toEqual([
		{ op: 'collect', name: 'something' },
		{ op: 'consume', str: '#' },
	])

})

test('multiple collects with length', () => {
	var res = smp.parse(`!{first:str:1}!{second:num:2}!{third:str:3}`)

	expect(res).toEqual([
		{ op: 'collect', name: 'first', type: 'str', length: 1 },
		{ op: 'collect', name: 'second', type: 'num', length: 2 },
		{ op: 'collect', name: 'third', type: 'str', length: 3 },
	])
})

test('process complex url', () => {
	var proto = 'sip'

	var res = smp.parse(`"jim" <${proto}:!{user}@!{ip}:!{port};tag=!{tag:str:26};phone=!{phone:str:9}>`)

	expect(res).toEqual([
		{ op: 'consume', str: '"jim" <sip:' },
		{ op: 'collect', name: 'user' },
		{ op: 'consume', str: '@' },
		{ op: 'collect', name: 'ip' },
		{ op: 'consume', str: ':' },
		{ op: 'collect', name: 'port' },
		{ op: 'consume', str: ';tag=' },
		{ op: 'collect', name: 'tag', type: 'str', length: 26 },
		{ op: 'consume', str: ';phone=' },
		{ op: 'collect', name: 'phone', type: 'str', length: 9 },
		{ op: 'consume', str: '>' }
	])
})

test('unclosed !{}', () => {
	expect( () => { smp.parse('abc!{') } ).toThrow()
})

test('bang', () => {
	expect(smp.parse('abc!!def')).toEqual([
		{ op: 'consume', str: 'abc!def' },
	])
})

test('non collection', () => {
	expect(smp.parse('@!!{aaa')).toEqual([
		{ op: 'consume', str: '@!{aaa' },
	])
})


