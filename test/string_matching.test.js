const sm = require('../src/index');

test('process valid match string', () => {
	var alias = "tom"
	var proto = 'sip'

	var matcher = sm.gen_matcher(`"${alias}" <${proto}:!{user}@!{ip}:!{port:num};tag=!{tag:str:30};phone=!{phone:str:10}>`)

	var user = 'tomjones'
	var ip = '10.20.30.40'
	var port = 88888
	var tag = '111222333444555666777888999000'
	var phone = '0312341234'

	var dict = {}

	var res = matcher(`"${alias}" <${proto}:${user}@${ip}:${port};tag=${tag};phone=${phone}>`, dict)

	expect(res).toEqual(true)
	expect(dict).toEqual({
		user: user,
		ip: ip,
		port: port,
		tag: tag,
		phone: phone,
	})		
})

test('underscore', () => {
	var matcher = sm.gen_matcher('!{first},!{_},!{second},!{_},!{third}')
	var dict = {}

	var res = matcher('abc,000,def,111,ghi', dict)

	expect(res).toEqual(true)
	expect(dict).toEqual({
		first: 'abc',
		second: 'def',
		third: 'ghi',
	})
})

test('key already set in dict', () => {
	var matcher = sm.gen_matcher(`name=!{name}`)
	var dict = {
		name: 'spock',
	} 

	expect( () => { matcher(`name=sulu`, dict, true, 'some_path') }).toThrow(/it is already set to/)
})

test('push to non-existing array', () => {
	var matcher = sm.gen_matcher('!{@list},!{@list},!{@list}')
	var dict = {}

	var res = matcher('abc,def,ghi', dict)

	expect(res).toEqual(true)
	expect(dict).toEqual({
		list: ['abc', 'def', 'ghi']
	})
})

test('push to existing array', () => {
	var matcher = sm.gen_matcher('!{@list},!{@list},!{@list}')
	var dict = {list: ['000']}

	var res = matcher('abc,def,ghi', dict)

	expect(res).toEqual(true)
	expect(dict).toEqual({
		list: ['000', 'abc', 'def', 'ghi']
	})
})

test('trailing spaces, left bang', () => {
	var matcher = sm.gen_matcher(' !!{@list},!{@list},!{@list} ')
	var dict = {}

	var res = matcher(' !abc,def,ghi ', dict)

	expect(res).toEqual(true)
	expect(dict).toEqual({
		list: ['abc', 'def', 'ghi']
	})
})

test('trailing spaces, bangs, curly-braces and empty !{}', () => {
	var matcher = sm.gen_matcher(' !{@list},!{@list},!{@list},!{@list} !{@list} ')
	var dict = {}

	var res = matcher(' !!!,abc,{def},{{ghi}} !{} ', dict)

	expect(res).toEqual(true)
	expect(dict).toEqual({
		list: ['!!!', 'abc', '{def}', '{{ghi}}', '!{}']
	})
})

test('json inside string', () => {
	var matcher = sm.gen_matcher('Destination [!{_}/ban_cti_sync.py remove domain] error [None]. result: Failed with {"result_code": 500}')

	var dict = {}

	var res = matcher('Destination [/root/tmp/some_app/ban_cti_sync.py remove domain] error [None]. result: Failed with {"result_code": 500}', dict)

	expect(res).toEqual(true)
})

test('excracting from complex string', () => {
	var matcher = sm.gen_matcher('xml_url:{id=send_fax;notify_call_completed=true}http://!{ip_addr}:4001/xml?uuid=20e1538c-6f65-4d17-b5ff-4da25da3a472')

	var dict = {}

	var res = matcher('xml_url:{id=send_fax;notify_call_completed=true}http://192.168.0.113:4001/xml?uuid=20e1538c-6f65-4d17-b5ff-4da25da3a472', dict)

	expect(res).toEqual(true)
  expect(dict.ip_addr).toEqual('192.168.0.113')
})

test('sip uri match', () => {
	var matcher = sm.gen_matcher('sip:!{user}@!{domain}')

	var dict = {}

	var res = matcher("sip:bob@biloxi.com", dict)

	expect(res).toEqual(true)
  expect(dict.user).toEqual("bob")
  expect(dict.domain).toEqual("biloxi.com")
})

test('multiline string', () => {
	var matcher = sm.gen_matcher('#!{main}BBB#!{rest}')

	var dict = {}

	var res = matcher("#AAA\r\nAAABBB#\r\nBBB", dict)

	expect(res).toEqual(true)
  expect(dict.main).toEqual("AAA\r\nAAA")
  expect(dict.rest).toEqual("\r\nBBB")
})

test('empty match', () => {
	var matcher = sm.gen_matcher('!{nothing}AAA')

	var dict = {}

	var res = matcher("AAA", dict)

	expect(res).toEqual(true)
  expect(dict.nothing).toEqual("")
})

test('empty match, no capture', () => {
	var matcher = sm.gen_matcher('!{_}AAA')

	var dict = {}

	var res = matcher("AAA", dict)

	expect(res).toEqual(true)
})


