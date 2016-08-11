/**
 * Tests donation creation function
 */

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "app" }] */
const app = require('../server');
const test = require('tape');
const Bot = require('../api/models/Bot');
const BotController = require('../api/controllers/BotController');
const DonationController = require('../api/controllers/DonationController');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

const {
	cleanup,
} = require('./helper');

const botData = {
	twitterID: '12345',
	money: 0,
};

const donationData = {
	twitterID: 'abcde',
	money: 10,
};

test('Clean up', cleanup);

test('Creating donation', asyncFn(t => {
	awaitFn(BotController.createOrFindBot(botData));
	const createdDonation = awaitFn(
		DonationController
		.createDonation(donationData));
	t.ok(createdDonation, 'A donation should be created');
	const bot = awaitFn(Bot.findOne());
	t.ok(bot, 'A bot should be found in db');
	t.equal(bot.money, donationData.money, 'Bot should have 10 monies');
	t.end();
}));

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
