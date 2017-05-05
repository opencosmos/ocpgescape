const check_arg = (arg, not_null) => {
	if (arg === void 0) {
		throw new Error('A parameter is undefined');
	}
	if (arg === null && not_null) {
		throw new Error('A parameter is null but should not be');
	}
	return arg;
};

const reserved_words = require('fs')
	.readFileSync(`${__dirname}/reserved.txt`, 'utf8')
	.split('\n')
	.reduce((map, word) => {
		map[word.toLowerCase()] = true;
		return map;
	}, {});

const coerce_string = x => {
	if (x === null) {
		return ['NULL', false];
	}
	switch (typeof x) {
	case 'string': return [x, true];
	case 'number': return [String(x), false];
	case 'boolean': return [String(x).toUpperCase(), false];
	default: throw new Error(`Cannot safely coerce value of type ${typeof x} to string`);
	}
};

const string = val => coerce_string(check_arg(val, true))[0];

const valid_identifier = id => !reserved_words[id] && /^[a-z_][a-z0-9_$]*$/i.test(id);

const quote_identifier = id => `"${check_arg(id, true).replace(/"/g, '""')}"`;

const ident = val => valid_identifier(check_arg(val, true)) ? val : quote_identifier(val);

const check_string = val => {
	if (typeof val !== 'string') {
		throw new Error('Argument is not a string');
	}
};

/* http://www.postgresql.org/docs/8.3/interactive/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING */
const dollar_string = val => {
	check_arg(val);
	if (val === null) {
		return 'NULL';
	}
	check_string(val);
	/* Generate random tag for quote markers */
	const gen_tag = len => `$${Math.random().toString(36).substr(2, len)}$`;
	let tag;
	/*
	 * If data string contains the tag, generate a new one and increase the
	 * tag length (limited by the maximum fractional digits emitted by
	 * Number.prototype.toString)
	 */
	let len = 1;
	do {
		tag = gen_tag(len++);
	} while (val.indexOf(tag) !== -1);
	return `${tag}${val}${tag}`;
};

const quote_string = val => {
	check_arg(val);
	if (val === null) {
		return 'NULL';
	}
	check_string(val);
	const has_backslash = val.indexOf('\\') !== -1;
	const prefix = has_backslash ? 'E' : '';
	return `${prefix}'${val.replace(/'/g, '\'\'').replace(/\\/g, '\\\\')}'`;
};

const literal = val => {
	check_arg(val);
	if (val === null) {
		return 'NULL';
	} else if (Array.isArray(val)) {
		return `(${val.map(literal).join(',')})`;
	} else if (typeof val === 'object') {
		return literal(JSON.stringify(val));
	} else {
		const [str, quote] = coerce_string(val);
		/* Use dollar-quoting for longer strings */
		if (!quote) {
			return str;
		} else if (str.length < 1000) {
			return quote_string(str);
		} else {
			return dollar_string(str);
		}
	}
};

const format = (fmt, ...args) => {
	check_arg(fmt);
	if (typeof fmt !== 'string') {
		throw new Error('Format string is invalid');
	}
	let i = 0;
	const consume = () => {
		const idx = i++;
		if (idx === args.length) {
			throw new Error('Not enough parameters supplied to query formatter');
		}
		return check_arg(args[idx]);
	};
	const res = fmt.replace(/%(.)/g, (_, type) => {
		switch (type) {
		case '%': return '%';
		case 's': return string(consume());
		case 'I': return ident(consume());
		case 'L': return literal(consume());
		case 'Q': return dollar_string(consume());
		case 'J': return literal(JSON.stringify(consume()));
		default: throw new Error(`Invalid query format specifier: '${type}'`);
		}
	});
	if (i !== args.length) {
		throw new Error('Too many parameters supplied to query formatter');
	}
	return res;
};

module.exports = format;
module.exports.string = string;
module.exports.ident = ident;
module.exports.dollar_string = dollar_string;
module.exports.quote_string = quote_string;
module.exports.literal = literal;
