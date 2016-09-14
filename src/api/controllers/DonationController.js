const moment = require('moment');

const Donation = require('../models/Donation');
const Bot = require('../models/Bot');

exports.createDonation = async(donationData) => {
	const createdAt = donationData.createdAt;
	const earlierDonation = await
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
	});
	if (earlierDonation.length) {
		throw new Error('Donation not allowed. Already donated today!');
	}
	const donation = new Donation(donationData);
	const bot = await Bot.findOne();
	bot.money += donation.money;
	await donation.save();
	return await bot.save();
};

exports.index = async(req, res) => {
	const terence = await Bot.findOne();
	const donations = await Donation.find()
		.sort({
			createdAt: 'desc',
		})
		.limit(10);
	const count = await Donation.count();
	const top = await Donation.getTopDonaters();
	const totalDonaters = top.length;
	const topDonaters = top.slice(0, 10); // use only top 10
	res.render('', {
		title: 'Donations',
		totalDonaters,
		topDonaters,
		donations,
		count,
		terence,
	});
};
