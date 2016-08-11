const Donation = require('../models/Donation');
const Bot = require('../models/Bot');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');
const moment = require('moment');

exports.createDonation = asyncFn((donationData) => {
	const createdAt = donationData.createdAt;
	const earlierDonation = awaitFn(
		Donation.find({
			fromTwitterID: donationData.fromTwitterID,
			createdAt: {
				$gte: moment(createdAt)
					.startOf('day')
					.toDate(),
				$lt: moment(createdAt)
					.endOf('day')
					.toDate(),
			},
		})
	);
	if (earlierDonation.length) {
		throw new Error('Donation not allowed. Already donated today!');
	}
	const donation = new Donation(donationData);
	const bot = awaitFn(Bot.findOne());
	bot.money += donation.money;
	awaitFn(bot.save());
	return awaitFn(donation.save());
});
