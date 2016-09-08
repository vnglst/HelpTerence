const DonationController = require('../api/controllers/DonationController');
const Bot = require('./bot');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');
const config = require('../config');

console.log(`[Bot] Creating bot using following config: ${JSON.stringify(config, null, 4)}`);

const bot = new Bot(config.twitter);

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

function includesOne(str, arr) {
	let includes = false;
	arr.forEach(char => {
		if (str.includes(char)) includes = true;
	});
	return includes;
}

function getCount(text, coinTypes) {
	let count = 0;

	function countChar(str, char) {
		return str.split(char)
			.length - 1;
	}
	coinTypes.forEach((coinType) => {
		count += countChar(text, coinType);
	});
	return count;
}

function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function getStatusMessage() {
	const uptime = format(process.uptime());
	return `still going strong, thanks for asking! Uptime: ${uptime}`;
}

function getDonationMessage(count, total) {
	const messages = [
		`thanks for donating ${count} monies! I now have ${
			total} money bags! 👍`,
		`thanks for your ${count} monies, buddy. I'm now at ${
			total} money bags!`,
		`muchas gracias!! Including your ${
			count} I now have ${total} money bags! 🎉`,
		`vielen Dank!! That's German for thank you. With your ${
			count} I'm now at ${total} monies! 🍺`,
		`heel erg bedankt! That's Dutch for thank you. With your ${
			count} I'm now at ${total} monies! 🧀`,
		`Wow, I'm now at ${total} monies! Thanks for those ${
			count} monies. 👍👍`,
	];
	const message = randomElement(messages);
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

const handleDonation = asyncFn((tweet, coinTypes) => {
	const text = tweet.text;
	const count = getCount(text, coinTypes);
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
			const message = 'sorry, you already donated today. I wouldnt want you to get poor!';
			return awaitFn(bot.reply(donator, message));
		}
		// Retrow all other catched errors
		console.log(`[Terence] Twitter error ${e}`);
		throw e;
	}
});

const handleMention = (tweet) => {
	const coinTypes = ['💰', '💵', '💶', '💷', '💴', '💸', '💳'];
	const text = tweet.text;
	console.log(`[Terence] Somebody mentioned me in the following tweet:\n ${text}`);
	if (includesOne(text, coinTypes)) handleDonation(tweet, coinTypes);
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
		if (rand <= 0.60) { //  make a friend
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
	}, 300000); // every 5 minutes = 300 seconden
};

exports.bot = bot;

// For tests

exports.__tests = {
	getDonationMessage,
	includesOne,
	getCount,
	handleMention,
	handleDonation,
	handleStatus,
};
