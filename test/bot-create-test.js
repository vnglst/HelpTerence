/**
 * Tests bot creation function
 */

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "app" }] */
const app = require('../server');
const test = require('tape');
const Bot = require('../api/models/Bot');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

const {
	cleanup,
} = require('./helper');

const botData = {
	twitterID: '12345',
};

test('Clean up', cleanup);

test('Checking if DB is empty', asyncFn(t => {
	const bots = awaitFn(Bot.find());
	t.equal(bots.length, 0, 'There should be 0 bots in db');
	t.end();
}));

test('Creating first bot', asyncFn(t => {
	const bot = new Bot(botData);
	awaitFn(bot.save());
	const foundBot = awaitFn(Bot.findOne());
	t.equal(foundBot.twitterID, bot.twitterID, 'Bot found in db should be saved bot');
	t.end();
}));

test('Creating same bot again', asyncFn(t => {
	try {
		const bot = new Bot(botData);
		awaitFn(bot.save());
	} catch (err) {
		t.ok(err, 'Should return an error: no duplicates allowed');
	}
	t.end();
}));

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
