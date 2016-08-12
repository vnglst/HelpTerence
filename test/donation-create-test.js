/**
 * Tests donation creation function
 */

const app = require('../server');
const test = require('tape');
const Bot = require('../api/models/Bot');
const Donation = require('../api/models/Donation');
const BotController = require('../api/controllers/BotController');
const DonationController = require('../api/controllers/DonationController');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');
const moment = require('moment');

const {
	cleanup,
} = require('./helper');

const botData = {
	twitterID: '12345',
	money: 0,
};

const donationData = {
	fromTwitterID: 'abcde',
	createdAt: moment()
		.subtract(1, 'days')
		.toDate(),
	money: 10,
};

test('Clean up', cleanup);

test('Creating donation',
	asyncFn(t => {
		awaitFn(BotController.createOrFindBot(botData));
		const createdDonation = awaitFn(
			DonationController
			.createDonation(donationData));
		t.ok(createdDonation, 'A donation should be created');
		const bot = awaitFn(Bot.findOne());
		t.ok(bot, 'A bot should be found in db');
		t.equal(bot.money, 10, 'Bot should have 10 monies');
		t.end();
	}));

test('Creating another donation with same date',
	asyncFn(t => {
		try {
			awaitFn(DonationController
				.createDonation(donationData));
		} catch (err) {
			t.equal(err.message,
				'Donation not allowed. Already donated today!',
				'Should throw an error: already donated today.');
		}
		const bot = awaitFn(Bot.findOne());
		t.equal(bot.money, 10, 'Bot should still have 10 monies');
		t.end();
	}));

test('Creating a donation with a different date',
	asyncFn(t => {
		donationData.createdAt = new Date();
		awaitFn(DonationController
			.createDonation(donationData));
		const bot = awaitFn(Bot.findOne());
		t.equal(bot.money, 20, 'Bot should  have 10 monies');
		const donations = awaitFn(Donation.find());
		t.equal(donations.length, 2, 'There should be 2 valid donation in the db');
		t.end();
	}));

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
