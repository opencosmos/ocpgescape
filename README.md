# ocpgescape

  Sprintf-style postgres query formatting and escape helper functions.

  Forked from [pg-escape](https://github.com/segmentio/pg-escape)

## API

### escape(fmt, ...)

Format the given arguments using a format string

### escape.string(val)

Emit verbatim

### escape.dollar\_string(val)

Format as a [dollar quoted string](http://www.postgresql.org/docs/8.3/interactive/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING)

### escape.quote\_string(val)

Format as a SQL string.

### escape.ident(val)

Format as an identifier.

### escape.literal(val)

Format as a literal.

## Formats

- `%s` formats the argument value as a simple string.
- `%Q` formats the argument value as a [dollar quoted string](http://www.postgresql.org/docs/8.3/interactive/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING). A null value is treated as an empty string.
- `%I` treats the argument value as an SQL identifier, double-quoting it if necessary. It is an error for the value to be null.
- `%L` stringifies JSON objects, SQL-quotes small strings, dollar-quotes long strings, and emits NULLs, numbers, and booleans unquoted.
- `%J` stringifies the value then emits as either a SQL-string or a dollar-quoted string, depending on the length of the resulting JSON.
- `%%` In addition to the format specifiers described above, the special sequence %% may be used to output a literal % character.

# License

  MIT
