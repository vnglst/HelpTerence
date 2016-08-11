const Donation = require('../models/Bot');
const Bot = require('../models/Bot');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

exports.createDonation = asyncFn((donationData) => {
	const donation = new Donation(donationData);
	const bot = awaitFn(Bot.findOne());
	bot.money += donation.money;
	awaitFn(bot.save());
	return awaitFn(donation.save());
});
