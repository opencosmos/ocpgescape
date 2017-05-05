const escape = require('..');
const { describe, it } = global;

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
			escape('some %s here', 'thing')
				.should.equal('some thing here');

			escape('some %s thing %s', 'long', 'here')
				.should.equal('some long thing here');
		});
	});

	describe('%%', () => {
		it('should format as %', () => {
			escape('some %%')
				.should.equal('some %');
		});
		it('should not eat args', () => {
			escape('just %% a %s', 'test')
				.should.equal('just % a test');
		});
	});

	describe('%I', () => {
		it('should format as an identifier', () => {
			escape('some %I', 'foo/bar/baz')
				.should.equal('some "foo/bar/baz"');
		});
	});

	describe('%L', () => {
		it('should format as a literal', () => {
			escape('%L', 'Tobi\'s')
				.should.equal("'Tobi''s'");
		});
	});

	describe('%Q', () => {
		it('should format as a dollar quoted string', () => {
			escape('%Q', "Tobi's")
				.should.match(/\$\w+\$Tobi's\$\w+\$/);
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
		escape.string(0).should.equal('0');
		escape.string(15).should.equal('15');
		escape.string('something').should.equal('something');
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
		escape.quote_string('something').should.match(/'something'/);
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
		escape.dollar_string('something').should.match(/\$\w+\$something\$\w+\$/);
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
		escape.ident('foo').should.equal('foo');
		escape.ident('_foo').should.equal('_foo');
		escape.ident('_foo_bar$baz').should.equal('_foo_bar$baz');
		escape.ident('test.some.stuff').should.equal('"test.some.stuff"');
		escape.ident('test."some".stuff').should.equal('"test.""some"".stuff"');
	});
	it('should quote reserved words', () => {
		escape.ident('desc').should.equal('"desc"');
		escape.ident('join').should.equal('"join"');
		escape.ident('cross').should.equal('"cross"');
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
		escape.literal(null).should.equal('NULL');
	});
	it('should return a tuple for arrays', () => {
		escape.literal(["foo", "bar", "baz' DROP TABLE foo;"]).should.equal("('foo','bar','baz'' DROP TABLE foo;')");
	});
	it('should quote', () => {
		escape.literal('hello world').should.equal("'hello world'");
	});
	it('should escape quotes', () => {
		escape.literal("O'Reilly").should.equal("'O''Reilly'");
	});
	it('should escape backslashes', () => {
		escape.literal('\\whoop\\').should.equal("E'\\\\whoop\\\\'");
	});
});
