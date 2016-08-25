const DonationController = require('../api/controllers/DonationController');
const Bot = require('./bot');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

const config = {
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
	timeout_ms: 60 * 1000,
};

const bot = new Bot(config);

// Private functions

function format(seconds) {
	function pad(s) {
		return (s < 10 ? '0' : '') + s;
	}
	const hours = Math.floor(seconds / (60 * 60));
	const minutes = Math.floor((seconds % (60 * 60)) / 60);
	const secs = Math.floor(seconds % 60);
	return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

function getStatusMessage() {
	const uptime = format(process.uptime());
	return `still going strong, thanks for asking! Uptime: ${uptime}`;
}

function getDonationMessage(count, total) {
	const message = `thanks for donating ${count} money bags! I now have ${total} money bags! 👍`;
	return message;
}

const handleStatus = asyncFn((tweet) => {
	const replyTo = tweet.user.screen_name;
	const message = getStatusMessage();
	return awaitFn(bot.reply(replyTo, message));
});

const handleDonation = asyncFn((tweet) => {
	const text = tweet.text;
	const count = text.split('💰')
		.length - 1;
	const donator = tweet.user.screen_name;
	const donationData = {
		fromTwitterID: donator,
		createdAt: new Date(),
		money: count,
	};
	try {
		const donetee = awaitFn(DonationController.createDonation(donationData));
		const total = donetee.money;
		const message = getDonationMessage(count, total);
		return awaitFn(bot.reply(donator, message));
	} catch (e) {
		if (e.message === 'Donation not allowed. Already donated today!') {
			const message = 'sorry, you already donated today. I dont want you to get poor!';
			return awaitFn(bot.reply(donator, message));
		}
		// Retrow all other catched errors
		throw e;
	}
});

const handleMention = (tweet) => {
	const text = tweet.text;
	console.log(`[Terence] Somebody mentioned me in the following tweet:\n ${text}`);
	if (text.includes('💰')) handleDonation(tweet);
	if (text.includes('status')) handleStatus(tweet);
};

// Public functions

exports.start = () => {
	bot.listen(handleMention);
};

exports.bot = bot;

// For tests

exports.__tests = {
	handleMention,
	handleDonation,
	handleStatus,
};
