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
