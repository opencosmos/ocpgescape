const chai = require('chai');
const expect = chai.expect;
const { describe, it } = global;

const escape = require('..');

/* eslint-disable quotes, no-magic-numbers */

describe('escape(fmt, ...)', () => {

	describe('argument count', () => {
		it('should fail when too few arguments', done => {
			try {
				escape('%s %s', 'value');
				return done(new Error('Did not throw'));
			} catch (err) {
				return done();
			}
		});
		it('should fail when too many arguments', done => {
			try {
				escape('%s', 'value', 'value');
				return done(new Error('Did not throw'));
			} catch (err) {
				return done();
			}
		});
	});

	describe('%s', () => {
		it('should format as a simple string', () => {
			expect(escape('some %s here', 'thing'))
				.to.equal('some thing here');

			expect(escape('some %s thing %s', 'long', 'here'))
				.to.equal('some long thing here');
		});
	});

	describe('%%', () => {
		it('should format as %', () => {
			expect(escape('some %%'))
				.to.equal('some %');
		});
		it('should not eat args', () => {
			expect(escape('just %% a %s', 'test'))
				.to.equal('just % a test');
		});
	});

	describe('%I', () => {
		it('should format as an identifier', () => {
			expect(escape('some %I', 'foo/bar/baz'))
				.to.equal('some "foo/bar/baz"');
		});
	});

	describe('%L', () => {
		it('should format as a literal', () => {
			expect(escape('%L', 'Tobi\'s'))
				.to.equal("'Tobi''s'");
		});
	});
	describe('%Q', () => {
		it('should format as a dollar quoted string', () => {
			expect(escape('%Q', "Tobi's"))
				.to.match(/\$\w*\$Tobi's\$\w*\$/);
		});
	});
});

describe('escape.string(val)', () => {
	it('should fail on undefined', done => {
		try {
			escape.string(void 0);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should coerce to a string', () => {
		expect(escape.string(0)).to.equal('0');
		expect(escape.string(15)).to.equal('15');
		expect(escape.string('something')).to.equal('something');
	});
});

describe('escape.quote_string(val)', () => {
	it('should throw on undefined', done => {
		try {
			escape.quote_string(void 0);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should throw on non-string', done => {
		try {
			escape.quote_string(1);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should quote a string', () => {
		expect(escape.quote_string('something')).to.match(/'something'/);
	});
});

describe('escape.dollar_string(val)', () => {
	it('should throw on undefined', done => {
		try {
			escape.dollar_string(void 0);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should throw on non-string', done => {
		try {
			escape.dollar_string(1);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should dollar-quote a string', () => {
		expect(escape.dollar_string('something'))
			.to.match(/\$\w*\$something\$\w*\$/);
	});
	it('should use tag which is valid as unquoted identifier', () => {
		for (let i = 0; i < 1000; ++i) {
			expect(escape.dollar_string('something'))
				.to.match(/\$([a-z]\w*)?\$something\$([a-z]\w*)?\$/i);
		}
	});
});

describe('escape.ident(val)', () => {
	it('should throw on undefined', done => {
		try {
			escape.ident(void 0);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should throw on null', done => {
		try {
			escape.ident(null);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should quote when necessary', () => {
		expect(escape.ident('foo')).to.equal('foo');
		expect(escape.ident('_foo')).to.equal('_foo');
		expect(escape.ident('_foo_bar$baz')).to.equal('_foo_bar$baz');
		expect(escape.ident('test.some.stuff')).to.equal('"test.some.stuff"');
		expect(escape.ident('test."some".stuff')).to.equal('"test.""some"".stuff"');
	});
	it('should quote reserved words', () => {
		expect(escape.ident('desc')).to.equal('"desc"');
		expect(escape.ident('join')).to.equal('"join"');
		expect(escape.ident('cross')).to.equal('"cross"');
	});
});

describe('escape.literal(val)', () => {
	it('should throw on undefined', done => {
		try {
			escape.literal(void 0);
			return done(new Error('Did not throw'));
		} catch (err) {
			return done();
		}
	});
	it('should return NULL for null', () => {
		expect(escape.literal(null))
			.to.equal('NULL');
	});
	it('should return a well-formed array expression for arrays', () => {
		expect(escape.literal(["foo", "bar", "baz' DROP TABLE foo;"]))
			.to.equal("ARRAY['foo', 'bar', 'baz'' DROP TABLE foo;']");
	});
	it('should return a well-formed array expression for multidimensional arrays', () => {
		expect(escape.literal([["foo", "bar"], ["baz' DROP TABLE foo;", "potato"]]))
			.to.equal("ARRAY[['foo', 'bar'], ['baz'' DROP TABLE foo;', 'potato']]");
	});
	it('should quote', () => {
		expect(escape.literal('hello world'))
			.to.equal("'hello world'");
	});
	it('should escape quotes', () => {
		expect(escape.literal("O'Reilly"))
			.to.equal("'O''Reilly'");
	});
	it('should escape backslashes', () => {
		expect(escape.literal('\\whoop\\'))
			.to.equal("E'\\\\whoop\\\\'");
	});
});
