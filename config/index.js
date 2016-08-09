const path = require('path');
const extend = require('util')
	._extend;

const development = require('./env/development');
const test = require('./env/test');
const production = require('./env/production');

const defaults = {
	root: path.join(__dirname, '..'),
};

module.exports = {
	development: extend(development, defaults),
	test: extend(test, defaults),
	production: extend(production, defaults),
}[process.env.NODE_ENV || 'development'];
