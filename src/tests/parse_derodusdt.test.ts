



import { test, expect } from '@jest/globals';


import { evaluate } from '../lib/parse';
import { DVMType, Program } from '../types/program';

import { return_value, store, name, val, call, op, if_then, declare, assign, comment, return_expression } from '../lib/build';

const functions =
{
	"Initialize": {
		expected: {
			name: 'Initialize',
			return: DVMType.Uint64,
			args: [
				{ name: 'asset1', type: DVMType.String, },
				{ name: 'asset2', type: DVMType.String, },
				{ name: 'symbol', type: DVMType.String, },
				{ name: 'name', type: DVMType.String, },
				{ name: 'fee', type: DVMType.Uint64 },
			],
			comments: [
				'_____  _____ _______ _______ _  _  _ _______  _____',
				'|_____]   |   |______ |______ |  |  | |_____| |_____]',
				'|       __|__ |______ ______| |__|__| |     | |',
				'Swap contract',
				//'lossless (a * b ) / c',
				//"('cause there ain't no Uint256)",

			],
			statements: [
				// 10 IF EXISTS("version") THEN GOTO 1100
				if_then(call('EXISTS', [val('version')])
					, 1100, 10),
				// 20 SetVer()
				call.statement('SetVer', [], 20),
				// 30 STORE("o:" + HEX(SIGNER()), 0)
				store(op.str.concat(val("o:"), call('HEX', [call('SIGNER')])), val(0), 30),
				// 40 STORE("ol:0", HEX(SIGNER()))
				store(val('ol:0'), call("HEX", [call("SIGNER")]), 40),
				// 50 STORE("numTrustees", 1)
				store(val("numTrustees"), val(1), 50),
				// 60 STORE("quorum", 1)
				store(val("quorum"), val(1), 60),
				// 70 STORE("asset1", HEXDECODE(asset1))
				store(val("asset1"), call("HEXDECODE", [name('asset1')]), 70),
				// 80 STORE("asset2", HEXDECODE(asset2))
				store(val("asset2"), call("HEXDECODE", [name('asset2')]), 80),
				// 90 STORE("symbol", symbol)
				store(val("symbol"), name("symbol"), 90),
				// 100 STORE("decimals", 0)
				store(val('decimals'), val(0), 100),
				// 110 STORE("name", name)
				store(val('name'), name('name'), 110),
				// 120 STORE("fee", fee)
				store(val('fee'), name('fee'), 120),
				// 130 STORE("val1", 0)
				store(val('val1'), val(0), 130),
				// 140 STORE("val2", 0)
				store(val('val2'), val(0), 140),
				// 150 STORE("sharesOutstanding", 0)
				store(val('sharesOutstanding'), val(0), 150),
				// 160 STORE("adds", 0)
				store(val('adds'), val(0), 160),
				// 170 STORE("rems", 0)
				store(val('rems'), val(0), 170),
				// 180 STORE("swaps", 0)
				store(val('swaps'), val(0), 180),

				// 1000 RETURN 0
				return_value(0, 1000),
				// 1100 RETURN 100
				return_value(100, 1100),
			],
		},
		code: `
//    _____  _____ _______ _______ _  _  _ _______  _____ 
//   |_____]   |   |______ |______ |  |  | |_____| |_____]
//   |       __|__ |______ ______| |__|__| |     | |      
//
//   Swap contract

Function Initialize(asset1 String, asset2 String, symbol String, name String, fee Uint64) Uint64
	10 IF EXISTS("version") THEN GOTO 1100
	20 SetVer()
	30 STORE("o:" + HEX(SIGNER()), 0)
	40 STORE("ol:0", HEX(SIGNER()))
	50 STORE("numTrustees", 1)
	60 STORE("quorum", 1)
	70 STORE("asset1", HEXDECODE(asset1))
	80 STORE("asset2", HEXDECODE(asset2))
	90 STORE("symbol", symbol)
	100 STORE("decimals", 0)
	110 STORE("name", name)
	120 STORE("fee", fee)
	130 STORE("val1", 0)
	140 STORE("val2", 0)
	150 STORE("sharesOutstanding", 0)
	160 STORE("adds", 0)
	170 STORE("rems", 0)
	180 STORE("swaps", 0)

	1000 RETURN 0
	1100 RETURN 100
End Function`
	},
	"GetVer": {
		expected: {
			name: 'GetVer',
			args: [],
			comments: [],
			return: DVMType.String,
			statements: [
				// 10 return "2.100"
				return_value("2.100", 10),
			]
		},
		code: `
Function GetVer() String
	10 return "2.100"
End Function`,
	},
	"SetVer": {
		expected: {
			name: 'SetVer',
			args: [],
			return: DVMType.Uint64,
			statements: [
				// 10 STORE("version", GetVer())
				store(val("version"), call('GetVer'), 10),
				// 1000 RETURN 0
				return_value(0, 1000),
			]
		},
		code: `
Function SetVer() Uint64
	10 STORE("version", GetVer())

	1000 RETURN 0
End Function`,
	},

	"multDiv": {
		expected: {
			name: 'multDiv',
			args: [
				{ name: 'a', type: DVMType.Uint64, },
				{ name: 'b', type: DVMType.Uint64, },
				{ name: 'c', type: DVMType.Uint64 },
			],
			comments: [
				"lossless (a * b ) / c",
				"('cause there ain't no Uint256)",
			],
			return: DVMType.Uint64,
			statements: [

				// 10 DIM base, maxdiv AS Uint64
				...declare.multiple(['base', 'maxdiv'], DVMType.Uint64, 10),
				// 20 LET base = 4294967296	// (1<<32)
				assign('base', val(4294967296), 20),
				comment('(1<<32)', 20),
				// 30 LET maxdiv = (base-1)*base + (base-1)
				assign('maxdiv', op.int.add(
					op.int.mul(
						op.int.sub(name('base'), val(1)),
						name('base')
					),
					op.int.sub(name('base'), val(1))
				), 30),
				// 50 DIM res AS Uint64
				declare('res', DVMType.Uint64, 50),
				// 60 LET res = (a/c) * b + (a%c) * (b/c)
				assign('res', op.int.add(
					op.int.mul(
						op.int.div(
							name('a'),
							name('c')
						),
						name('b')
					),
					op.int.mul(
						op.int.mod(
							name('a'),
							name('c')
						),
						op.int.div(
							name('b'),
							name('c')
						),
					),
				), 60),
				// 70 LET a = a % c
				assign('a', op.int.mod(
					name('a'),
					name('c')
				), 70),
				// 80 LET b = b % c
				assign('b', op.int.mod(
					name('b'),
					name('c')
				), 80),
				// 90 IF (a == 0 || b == 0) THEN GOTO 1000
				if_then(op.int.or(
					op.int.eq(name('a'), val(0)),
					op.int.eq(name('b'), val(0))
				), 1000, 90),

				// 100 IF (c >= base) THEN GOTO 200
				if_then(op.int.ge(
					name('c'),
					name('base'),
				), 200, 100),
				// 110 LET res = res + (a*b/c)
				assign('res', op.int.add(
					name('res'),
					op.int.div(
						op.int.mul(name('a'), name('b')),
						name('c')
					)
				), 110),
				// 120 GOTO 1000
				{ type: 'goto', line: 120, goto: 1000 },

				// 200 DIM norm AS Uint64
				declare('norm', DVMType.Uint64, 200),

				// 210 LET norm = maxdiv/c
				assign('norm', op.int.div(
					name('maxdiv'),
					name('c')
				), 210),
				// 220 LET c = c * norm
				assign('c', op.int.mul(name('c'), name('norm')), 220),
				// 230 LET a = a * norm
				assign('a', op.int.mul(name('a'), name('norm')), 230),

				// 300 DIM ah, al, bh, bl, ch, cl AS Uint64
				...['ah', 'al', 'bh', 'bl', 'ch', 'cl']
					.map(v => declare(v, DVMType.Uint64, 300)),
				// 310 LET ah = a / base
				assign('ah', op.int.div(name('a'), name('base')), 310),
				// 320 LET al = a % base
				assign('al', op.int.mod(name('a'), name('base')), 320),
				// 330 LET bh = b / base
				assign('bh', op.int.div(name('b'), name('base')), 330),
				// 340 LET bl = b % base
				assign('bl', op.int.mod(name('b'), name('base')), 340),
				// 350 LET ch = c / base
				assign('ch', op.int.div(name('c'), name('base')), 350),
				// 360 LET cl = c % base
				assign('cl', op.int.mod(name('c'), name('base')), 360),

				// 400 DIM p0, p1, p2 AS Uint64
				...['p0', 'p1', 'p2'].map(v => declare(v, DVMType.Uint64, 400)),
				// 410 LET p0 = al*bl
				assign('p0', op.int.mul(name('al'), name('bl')), 410),
				// 420 LET p1 = p0 / base + al*bh
				assign('p1', op.int.add(
					op.int.div(name('p0'), name('base')),
					op.int.mul(name('al'), name('bh')),
				), 420),
				// 430 LET p0 = p0 % base
				assign('p0', op.int.mod(name('p0'), name('base')), 430),
				// 440 LET p2 = p1 / base + ah*bh
				assign('p2', op.int.add(
					op.int.div(name('p1'), name('base')),
					op.int.mul(name('ah'), name('bh')),
				), 440),
				// 450 LET p1 = (p1 % base) + ah*bl
				assign('p1', op.int.add(
					op.int.mod(name('p1'), name('base')),
					op.int.mul(name('ah'), name('bl')),
				), 450),
				// 460 LET p2 = p2 + p1 / base
				assign('p2', op.int.add(name('p2'), op.int.div(name('p1'), name('base'))), 460),
				// 470 LET p1 = p1 % base
				assign('p1', op.int.mod(name('p1'), name('base')), 470),

				// 500 DIM q0, q1, rhat AS Uint64
				...['q0', 'q1', 'rhat'].map(v => declare(v, DVMType.Uint64, 500)),
				// 510 LET p2 = p2 % c
				assign('p2', op.int.mod(name('p2'), name('c')), 510),
				// 520 LET q1 = p2 / ch
				assign('q1', op.int.div(name('p2'), name('ch')), 520),
				// 530 LET rhat = p2 % ch
				assign('rhat', op.int.mod(name('p2'), name('ch')), 530),

				// 600 IF (q1 < base && (rhat >= base || q1*cl <= rhat*base+p1)) THEN GOTO 700
				if_then(op.int.and(
					op.int.lt(name('q1'), name('base')),
					op.int.or(
						op.int.ge(name('rhat'), name('base')),
						op.int.le(
							op.int.mul(name('q1'), name('cl'),),
							op.int.add(
								op.int.mul(name('rhat'), name('base')),
								name('p1')
							)
						)
					)
				), 700, 600),
				// 610 LET q1 = q1 - 1
				assign('q1', op.int.sub(name('q1'), val(1)), 610),
				// 620 LET rhat = rhat + ch
				assign('rhat', op.var.plus(name('rhat'), name('ch')), 620),
				// 630 GOTO 600
				{ type: 'goto', line: 630, goto: 600 },

				// 700 LET p1 = ((p2 % base) * base + p1) - q1 * cl
				assign('p1', op.int.sub(
					op.int.add(
						op.int.mul(
							op.int.mod(name('p2'), name('base')),
							name('base')
						),
						name('p1')
					),
					op.int.mul(name('q1'), name('cl'))
				), 700),
				// 710 LET p2 = (p2 / base * base + p1 / base) - q1 * ch
				assign('p2', op.int.sub(
					op.int.add(
						op.int.mul(
							op.int.div(name('p2'), name('base')),
							name('base')
						),
						op.int.div(name('p1'), name('base'))
					),
					op.int.mul(name('q1'), name('ch'))
				), 710),
				// 720 LET p1 = (p1 % base) + (p2 % base) * base
				assign('p1', op.int.add(
					op.int.mod(name('p1'), name('base')),
					op.int.mul(
						op.int.mod(name('p2'), name('base')),
						name('base')
					)
				), 720),
				// 730 LET q0 = p1 / ch
				assign('q0', op.int.div(name('p1'), name('ch')), 730),
				// 740 LET rhat = p1 % ch
				assign('rhat', op.int.mod(name('p1'), name('ch')), 740),

				// 800 IF (q0 < base && (rhat >= base || q0*cl <= rhat*base+p0)) THEN GOTO 900
				if_then(op.int.and(
					op.int.lt(name('q0'), name('base')),
					op.int.or(
						op.int.ge(name('rhat'), name('base')),
						op.int.le(
							op.int.mul(name('q0'), name('cl'),),
							op.int.add(
								op.int.mul(name('rhat'), name('base')),
								name('p0')
							)
						)
					)
				), 900, 800),
				// 810 LET q0 = q0 - 1
				assign('q0', op.int.sub(name('q0'), val(1)), 810),
				// 820 LET rhat = rhat + ch
				assign('rhat', op.var.plus(name('rhat'), name('ch')), 820),
				// 830 GOTO 800
				{ type: 'goto', line: 830, goto: 800 },

				// 900 LET res = res + q0 + q1 * base
				assign('res', op.int.add(
					op.var.plus(name('res'), name('q0')),
					op.int.mul(name('q1'), name('base'))
				), 900),

				// 1000 RETURN res
				return_expression(name('res'), 1000),

			]

		},
		code: `
// lossless (a * b ) / c
// ('cause there ain't no Uint256)
Function multDiv(a Uint64, b Uint64, c Uint64) Uint64
	10 DIM base, maxdiv AS Uint64
	20 LET base = 4294967296	// (1<<32)
	30 LET maxdiv = (base-1)*base + (base-1)

	50 DIM res AS Uint64
	60 LET res = (a/c) * b + (a%c) * (b/c)
	70 LET a = a % c
	80 LET b = b % c
	90 IF (a == 0 || b == 0) THEN GOTO 1000

	100 IF (c >= base) THEN GOTO 200
	110 LET res = res + (a*b/c)
	120 GOTO 1000

	200 DIM norm AS Uint64
	210 LET norm = maxdiv/c
	220 LET c = c * norm
	230 LET a = a * norm

	300 DIM ah, al, bh, bl, ch, cl AS Uint64
	310 LET ah = a / base
	320 LET al = a % base
	330 LET bh = b / base
	340 LET bl = b % base
	350 LET ch = c / base
	360 LET cl = c % base

	400 DIM p0, p1, p2 AS Uint64
	410 LET p0 = al*bl
	420 LET p1 = p0 / base + al*bh
	430 LET p0 = p0 % base
	440 LET p2 = p1 / base + ah*bh
	450 LET p1 = (p1 % base) + ah*bl
	460 LET p2 = p2 + p1 / base
	470 LET p1 = p1 % base

	500 DIM q0, q1, rhat AS Uint64
	510 LET p2 = p2 % c
	520 LET q1 = p2 / ch
	530 LET rhat = p2 % ch

	600 IF (q1 < base && (rhat >= base || q1*cl <= rhat*base+p1)) THEN GOTO 700
	610 LET q1 = q1 - 1
	620 LET rhat = rhat + ch
	630 GOTO 600

	700 LET p1 = ((p2 % base) * base + p1) - q1 * cl
	710 LET p2 = (p2 / base * base + p1 / base) - q1 * ch
	720 LET p1 = (p1 % base) + (p2 % base) * base
	730 LET q0 = p1 / ch
	740 LET rhat = p1 % ch

	800 IF (q0 < base && (rhat >= base || q0*cl <= rhat*base+p0)) THEN GOTO 900
	810 LET q0 = q0 - 1
	820 LET rhat = rhat + ch
	830 GOTO 800

	900 LET res = res + q0 + q1 * base

	1000 RETURN res
End Function
`,
	},

}

for (const f in functions) {
	if (Object.prototype.hasOwnProperty.call(functions, f)) {
		const element = functions[f];
		test(f, () => {
			const expected: Program = {
				functions: [
					element.expected
				]
			}
			expect(evaluate(element.code)).toMatchObject(expected)
		})
	}
}


/*test('whole', () => {
	const expected: Program = {

		functions: [
			// Initialize
			functions.Initialize.expected,


			// GetVer 
			functions.GetVer.expected,

			// SetVer 
			functions.SetVer.expected,

			// multDiv
			functions.multDiv.expected,


		],
	};

	const code = `
//    _____  _____ _______ _______ _  _  _ _______  _____ 
//   |_____]   |   |______ |______ |  |  | |_____| |_____]
//   |       __|__ |______ ______| |__|__| |     | |      
//
//   Swap contract

Function Initialize(asset1 String, asset2 String, symbol String, name String, fee Uint64) Uint64
	10 IF EXISTS("version") THEN GOTO 1100
	20 SetVer()
	30 STORE("o:" + HEX(SIGNER()), 0)
	40 STORE("ol:0", HEX(SIGNER()))
	50 STORE("numTrustees", 1)
	60 STORE("quorum", 1)
	70 STORE("asset1", HEXDECODE(asset1))
	80 STORE("asset2", HEXDECODE(asset2))
	90 STORE("symbol", symbol)
	100 STORE("decimals", 0)
	110 STORE("name", name)
	120 STORE("fee", fee)
	130 STORE("val1", 0)
	140 STORE("val2", 0)
	150 STORE("sharesOutstanding", 0)
	160 STORE("adds", 0)
	170 STORE("rems", 0)
	180 STORE("swaps", 0)

	1000 RETURN 0
	1100 RETURN 100
End Function

Function GetVer() String
	10 return "2.100"
End Function

Function SetVer() Uint64
	10 STORE("version", GetVer())

	1000 RETURN 0
End Function

// lossless (a * b ) / c
// ('cause there ain't no Uint256)
Function multDiv(a Uint64, b Uint64, c Uint64) Uint64
	10 DIM base, maxdiv AS Uint64
	20 LET base = 4294967296	// (1<<32)
	30 LET maxdiv = (base-1)*base + (base-1)

	50 DIM res AS Uint64
	60 LET res = (a/c) * b + (a%c) * (b/c)
	70 LET a = a % c
	80 LET b = b % c
	90 IF (a == 0 || b == 0) THEN GOTO 1000

	100 IF (c >= base) THEN GOTO 200
	110 LET res = res + (a*b/c)
	120 GOTO 1000

	200 DIM norm AS Uint64
	210 LET norm = maxdiv/c
	220 LET c = c * norm
	230 LET a = a * norm

	300 DIM ah, al, bh, bl, ch, cl AS Uint64
	310 LET ah = a / base
	320 LET al = a % base
	330 LET bh = b / base
	340 LET bl = b % base
	350 LET ch = c / base
	360 LET cl = c % base

	400 DIM p0, p1, p2 AS Uint64
	410 LET p0 = al*bl
	420 LET p1 = p0 / base + al*bh
	430 LET p0 = p0 % base
	440 LET p2 = p1 / base + ah*bh
	450 LET p1 = (p1 % base) + ah*bl
	460 LET p2 = p2 + p1 / base
	470 LET p1 = p1 % base

	500 DIM q0, q1, rhat AS Uint64
	510 LET p2 = p2 % c
	520 LET q1 = p2 / ch
	530 LET rhat = p2 % ch

	600 IF (q1 < base && (rhat >= base || q1*cl <= rhat*base+p1)) THEN GOTO 700
	610 LET q1 = q1 - 1
	620 LET rhat = rhat + ch
	630 GOTO 600

	700 LET p1 = ((p2 % base) * base + p1) - q1 * cl
	710 LET p2 = (p2 / base * base + p1 / base) - q1 * ch
	720 LET p1 = (p1 % base) + (p2 % base) * base
	730 LET q0 = p1 / ch
	740 LET rhat = p1 % ch

	800 IF (q0 < base && (rhat >= base || q0*cl <= rhat*base+p0)) THEN GOTO 900
	810 LET q0 = q0 - 1
	820 LET rhat = rhat + ch
	830 GOTO 800

	900 LET res = res + q0 + q1 * base

	1000 RETURN res
End Function

Function AddLiquidity() Uint64 
	10 DIM in1, in2, val1, val2, sharesOutstanding, share AS Uint64
	20 DIM asset1, asset2 AS String

	30 LET asset1 = LOAD("asset1")
	40 LET asset2 = LOAD("asset2")
	50 LET val1 = LOAD("val1")
	60 LET val2 = LOAD("val2")
	70 LET sharesOutstanding = LOAD("sharesOutstanding")
	80 LET in1 = ASSETVALUE(asset1)
	90 LET in2 = ASSETVALUE(asset2)

	100 IF in1 < 1 || in2 < 1 THEN GOTO 1110
	110 IF sharesOutstanding > 0 THEN GOTO 150
	120 LET share = MAX(in1, in2)
	130 GOTO 300

	150 IF in2 == multDiv(in1, val2, val1) THEN GOTO 200
	160 IF in1 == multDiv(in2, val1, val2) THEN GOTO 200
	170 GOTO 1120

	200 LET share = multDiv(sharesOutstanding, in1, val1)

	300 SEND_ASSET_TO_ADDRESS(SIGNER(), share, SCID())
	310 STORE("val1", val1 + in1)
	320 STORE("val2", val2 + in2)
	330 STORE("sharesOutstanding", sharesOutstanding + share)
	340 STORE("adds", LOAD("adds") + 1)

	1000 RETURN 0
	1110 RETURN 110
	1120 RETURN 120
End Function

Function RemoveLiquidity() Uint64
	10 DIM out1, out2, val1, val2, shares, sharesOutstanding AS Uint64
	20 DIM asset1, asset2 AS String

	30 LET val1 = LOAD("val1")
	40 LET val2 = LOAD("val2")
	50 LET shares = ASSETVALUE(SCID())
	60 LET sharesOutstanding = LOAD("sharesOutstanding")
	70 LET asset1 = LOAD("asset1")
	80 LET asset2 = LOAD("asset2")

	90 IF sharesOutstanding < 1 || shares < 1 THEN GOTO 1130
	100 LET out1 = multDiv(val1, shares, sharesOutstanding)
	110 LET out2 = multDiv(val2, shares, sharesOutstanding)

	120 STORE("val1", val1 - out1)
	130 STORE("val2", val2 - out2)
	140 STORE("sharesOutstanding", sharesOutstanding - shares)
	150 STORE("rems", LOAD("rems") + 1)
	160 SEND_ASSET_TO_ADDRESS(SIGNER(), out1, asset1)
	170 SEND_ASSET_TO_ADDRESS(SIGNER(), out2, asset2)

	1000 RETURN 0
	1100 RETURN 100
	1130 RETURN 130
End Function

Function Swap() Uint64
	10 DIM in1, in2, out1, out2, val1, val2, fee AS Uint64
	20 DIM asset1, asset2 AS String

	30 LET asset1 = LOAD("asset1")
	40 LET asset2 = LOAD("asset2")
	50 LET in1 = ASSETVALUE(asset1)
	60 LET in2 = ASSETVALUE(asset2)
	70 LET val1 = LOAD("val1")
	80 LET val2 = LOAD("val2")
	90 LET fee = LOAD("fee")

	100 IF in1 > 0 && in2 > 0 THEN GOTO 1140
	110 IF in1 < 1 && in2 < 1 THEN GOTO 1110
	120 IF in2 > 0 THEN GOTO 300

	200 LET out2 = multDiv(in1, val2, (val1 + in1))
	210 LET out2 = multDiv(out2, (10000-fee), 10000)
	220 STORE("val1", val1 + in1)
	230 STORE("val2", val2 - out2)
	250 SEND_ASSET_TO_ADDRESS(SIGNER(), out2, asset2)
	260 GOTO 400

	300 LET out1 = multDiv(in2, val1, (val2 + in2))
	310 LET out1 = multDiv(out1, (10000-fee), 10000)
	320 STORE("val1", val1 - out1)
	330 STORE("val2", val2 + in2)
	350 SEND_ASSET_TO_ADDRESS(SIGNER(), out1, asset1)

	400 STORE("swaps", LOAD("swaps") + 1)

	1000 RETURN 0
	1100 RETURN 100
	1110 RETURN 110
	1140 RETURN 140
End Function

Function VoteSetFee(fee Uint64) Uint64
	10 DIM trustee AS String
	20 LET trustee = "o:" + HEX(SIGNER())
	30 IF EXISTS(trustee) != 1 THEN GOTO 1100
	40 IF LOAD("fee") == fee THEN GOTO 1260

	100 IF castVote(trustee, "0", ITOA(fee)) != 1 THEN GOTO 200
	110 DELETE("i:0")
	120 STORE("fee", fee)

	1000 RETURN 0
	1100 RETURN 100
	1260 RETURN 260
End Function

Function VoteAddTrustee(new_trustee String) Uint64
	10 DIM trustee AS String
	20 LET trustee = "o:" + HEX(SIGNER())
	30 IF EXISTS(trustee) != 1 THEN GOTO 1100
	40 IF EXISTS("o:" + new_trustee) THEN GOTO 1260
	50 IF STRLEN(new_trustee) != 66 THEN GOTO 1260

	100 IF castVote(trustee, "1", new_trustee) != 1 THEN GOTO 200
	110 DELETE("i:1")
	120 DIM numTrustees AS Uint64
	130 LET numTrustees = LOAD("numTrustees")
	140 STORE("ol:" + numTrustees, new_trustee)
	150 STORE("o:"+ new_trustee, numTrustees)
	160 STORE("numTrustees", numTrustees + 1)

	200 RETURN 0

	1100 RETURN 100
	1260 RETURN 260
End Function

Function VoteRemoveTrustee(old_trustee String) Uint64
	10 DIM trustee AS String
	20 DIM numTrustees AS Uint64
	30 LET trustee = "o:" + HEX(SIGNER())
	40 IF EXISTS(trustee) != 1 THEN GOTO 1100
	50 IF EXISTS("o:" + old_trustee) != 1 THEN GOTO 1260
	60 LET numTrustees = LOAD("numTrustees") - 1
	70 IF numTrustees == 0 THEN GOTO 1270
	80 IF numTrustees > LOAD("quorum") THEN GOTO 1280

	100 IF castVote(trustee, "2", old_trustee) != 1 THEN GOTO 300
	110 DELETE("i:2")

	200 DIM keyToMove AS String
	210 DIM rowToReplace AS Uint64
	220 LET keyToMove = LOAD("ol:" + numTrustees)
	230 LET rowToReplace = LOAD("o:" + old_trustee)
	240 STORE("o:" + keyToMove, rowToReplace)
	250 STORE("ol:" + rowToReplace, keyToMove)
	260 DELETE("o:" + old_trustee)
	270 DELETE("ol:" + numTrustees)
	280 STORE("numTrustees", numTrustees)

	300 RETURN 0

	1100 RETURN 100
	1260 RETURN 260
	1270 RETURN 270
	1290 RETURN 290
End Function

Function VoteChangeQuorum(new_quorum Uint64) Uint64
	10 DIM trustee AS String
	20 LET trustee = "o:" + HEX(SIGNER())
	30 IF EXISTS(trustee) != 1 THEN GOTO 1100
	40 IF LOAD("quorum") == new_quorum THEN GOTO 1260
	50 IF new_quorum > LOAD("numTrustees") THEN GOTO 1300

	100 IF castVote(trustee, "3", ITOA(new_quorum)) != 1 THEN GOTO 200
	110 DELETE("i:3")
	120 STORE("quorum", new_quorum)

	200 RETURN 0

	1100 RETURN 100
	1260 RETURN 260
	1300 RETURN 300
End Function

Function VoteUpdateCode(code String) Uint64
	10 DIM trustee AS String
	20 LET trustee = "o:" + HEX(SIGNER())
	30 IF EXISTS(trustee) != 1 THEN GOTO 1100

	100 IF castVote(trustee, "4", sha256(code)) != 1 THEN GOTO 200
	110 DELETE("i:4")
	120 UPDATE_SC_CODE(code)

	200 RETURN 0

	1100 RETURN 100
	1260 RETURN 260
End Function

Function countVotes(tally Uint64) Uint64
	10 DIM votes, i AS Uint64
	20 LET votes = 0
	30 LET i = LOAD("numTrustees")

	100 IF (tally & (1<<i)) < 1 THEN GOTO 120
	110 LET votes = votes + 1
	120 LET i = i - 1
	130 IF i < 1 THEN GOTO 1000
	140 GOTO 100

	1000 RETURN votes
End Function

Function SHL(a Uint64, b Uint64) Uint64
	10 RETURN a << b
End Function

Function castVote(trustee String, key String, proposal String) Uint64
	10 DIM value, c, tally_str AS String
	20 DIM i, tally AS Uint64
	30 LET tally_str = "0"
	40 IF EXISTS("i:" + key) != 1 THEN GOTO 230
	50 LET value = LOAD("i:" + key)
	60 LET i = 0

	100 LET c = SUBSTR(value, i, 1)
	110 IF (c == ":") THEN GOTO 200
	120 LET tally_str = tally_str + c
	130 LET i = i + 1
	140 GOTO 100

	200 LET tally = ATOI(tally_str)
	210 IF ((tally & 1) == 1) THEN GOTO 1000
	220 IF SUBSTR(value, i+1, STRLEN(proposal)) == proposal THEN GOTO 300
	230 LET tally = 0

	300 LET tally = tally | SHL(1, LOAD(trustee) + 1)
	310 IF countVotes(tally) < LOAD("quorum") THEN GOTO 400
	320 LET tally = tally | 1

	400 STORE("i:" + key, ITOA(tally) + ":" + proposal)
	410 RETURN (tally & 1)

	1000 RETURN 0
End Function
`;
	expect(evaluate(code)).toMatchObject(expected)
})*/
