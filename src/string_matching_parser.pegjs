{
	function flattenArr(a, r){
		if(!r){ r = []}
		for(var i=0; i<a.length; i++){
			if(a[i]) {
				if(a[i].constructor == Array){
					r.concat(flattenArr(a[i], r));
				}else{
					r.push(a[i]);
				}
			}
		}
		return r;
	}
		
	function flattenStr(s) {
		return [].concat.apply([], s).join("")
	}
}


main
	= arr:(collectTil ordinaryString?)+ { return flattenArr(arr) }
	/ ct:collectTil { return [ct] }
	/ arr:(intercalator? (collectTil ordinaryString)* collectTil) { return flattenArr(arr) }
	/ arr:(intercalator? ((collectTil ordinaryString) / intercalator)+) { return flattenArr(arr) }
	/ arr:intercalator+ { return flattenArr(arr) }
		
collectTil
	= bang:[!]+ "{" _* vn:varName _* optional:(":" _* t:type _*)? "}" { 
		var collect = {op: 'collect', name: vn}
		if(optional) {
			collect.type = optional[2]
		}
		if(bang.length == 1) {
			return collect
		} else {
			return [
				{op: 'consume', str: '!'.repeat(bang.length-1) },
				collect
			]
		}
	}
		
collect 
	= bang:[!]+ "{" _* vn:varName _* ":" _* t:type _* ":" _* l:length _* "}" { 
		var collect = {
			op: 'collect',
			name: vn,
			type: t,
			length: l
		}
		if(bang.length == 1) {
			return collect
		} else {
			return [
				{op: 'consume', str: '!'.repeat(bang.length-1) },
				collect
			]
		}
	}

intercalator 
	= collect
	/ ordinaryString

ordinaryString = strs:string+ { return {op: 'consume', str: flattenStr(strs)} }

string 
	= s:([^!{]+) { return flattenStr(s) }
	/ s:([!]+[^{]+) { return flattenStr(s) }
	/ s:([^!]+[{]+) { return flattenStr(s) }
	/ s:([!][{][^}]*!.) { return flattenStr(s) } // till the end of string
	/ s:([!][{][^}]+!.) { return flattenStr(s) } // till the end of string

length
	= s:([1-9][0-9]*) { return parseInt(flattenStr(s)) }

type
	= "str"
	/ "num"
	/ "dec"
	/ "hex"
	/ "bin"
	/ "oct"
		
elementSpec = s:[^:}]+ { return flattenStr(s) }

blank =
	""

_ "space" = " "

varName = s:([_a-zA-Z][_a-zA-Z0-9]*) { return flattenStr(s) }

