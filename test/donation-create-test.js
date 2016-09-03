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
		const donatee = awaitFn(
			DonationController
			.createDonation(donationData));
		t.ok(donatee, 'A donation should be created');
		t.ok(donatee.twitterID, 'The donatee should be our bot');
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
		t.equal(bot.money, 20, 'Bot should have 20 monies');
		const donations = awaitFn(Donation.find());
		t.equal(donations.length, 2, 'There should be 2 valid donations in the db');
		t.end();
	}));

test('Getting the top donaters',
	asyncFn(t => {
		donationData.createdAt = new Date();
		donationData.fromTwitterID = 'fghij';
		awaitFn(DonationController
			.createDonation(donationData));
		donationData.money = 50;
		donationData.createdAt = new Date();
		donationData.fromTwitterID = 'klmno';
		awaitFn(DonationController
			.createDonation(donationData));
		const bot = awaitFn(Bot.findOne());
		t.equal(bot.money, 80, 'Bot should have 30 monies');
		const donations = awaitFn(Donation.find());
		t.equal(donations.length, 4, 'There should be 3 valid donations in the db');
		const topDonaters = awaitFn(Donation.getTopDonaters());
		t.equal(topDonaters.length, 3, 'topDonaters should have a length of 3');
		t.equal(topDonaters[1]._id, 'abcde', 'topDonater number 2 should be abcde');
		t.equal(topDonaters[1].value, 20, 'value of topDonater number 2 should total of 20');
		t.equal(topDonaters[0].value, 50, 'value of topDonater number 1 should total of 50');
		t.end();
	}));

test('Clean up', cleanup);

test.onFinish(() => process.exit(0));
