
const test = require('tape');
const app = require('../server');
const terence = require('../bot/terence');

const coinTypes = ['💰', '💵', '💶', '💷', '💴', '💸', '💳'];

test('Testing count for monies', t => {
	let str = 'here some 💰💰💰';
	let count = terence.__tests.getCount(str, coinTypes);
	t.equal(count, 3, '3 monies should be counted');
	str = 'here some 💰💰💰💵💶💷💴💸💳';
	count = terence.__tests.getCount(str, coinTypes);
	t.equal(count, 9, '9 monies should be counted');
	t.end();
});

test('Testing includesOne function', t => {
	let str = '💵💶💷💴💸💳';
	let result = terence.__tests.includesOne(str, coinTypes);
	t.ok(result, 'Should be true');
	str = 'test';
	result = terence.__tests.includesOne(str, coinTypes);
	t.notOk(result, 'Should be false');
	t.end();
});

test.onFinish(() => process.exit(0));
