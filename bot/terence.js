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

console.log(`[Bot] Creating bot using following config: ${config}`);

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

function handleError(err) {
	console.error('response status:', err.statusCode);
	console.error('data:', err.data);
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
		console.log(`[Terence] Twitter error ${e}`);
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

	// Start following and unfollowing
	setInterval(() => {
		bot.twit.get('followers/ids', (err, reply) => {
			if (err) {
				handleError(err);
			} else console.log(`[Terence] # followers: ${reply.ids.length.toString()}`);
		});

		const rand = Math.random();
		if (rand <= 0.70) { //  make a friend
			bot.mingle((err, reply) => {
				if (err) {
					handleError(err);
				} else {
					const name = reply.screen_name;
					console.log(`[Terence] Mingle: followed @${name}`);
				}
			});
		} else { //  prune a friend
			bot.prune((err, reply) => {
				if (err) {
					handleError(err);
				} else {
					const name = reply.screen_name;
					console.log(`[Terence] Prune: unfollowed @${name}`);
				}
			});
		}
	}, 600000); // every 10 minutes = 600 seconden
};

exports.bot = bot;

// For tests

exports.__tests = {
	handleMention,
	handleDonation,
	handleStatus,
};
