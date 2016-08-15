const DonationController = require('../api/controllers/DonationController');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

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

function getStatusStr(tweet) {
	const uptime = format(process.uptime());
	const replyTo = tweet.user.screen_name;
	return `@${replyTo} still going strong, thanks for asking! Uptime: ${uptime}`;
}

function getDonationThanksStr(replyTo, count, total) {
	const status =
		`@${replyTo} thanks for donating ${count} money bags! I now have ${total} money bags! 👍`;
	return status;
}

// Public functions

exports.handleStatus = (tweet, T) => {
	const params = {
		status: getStatusStr(tweet),
	};
	T.post('statuses/update', params, (err, reply) => {
		if (err) {
			console.log('[Bot] Error:', err);
		} else {
			console.log('[Bot] Tweeted:', reply.text);
		}
	});
};

exports.handleDonation = asyncFn((tweet, T) => {
	const text = tweet.text;
	const count = text.split('💰')
		.length - 1;
	const donator = tweet.user.screen_name;

	const donationData = {
		fromTwitterID: donator,
		createdAt: new Date(),
		money: count,
	};

	const donetee = awaitFn(DonationController.createDonation(donationData));
	const total = donetee.money;
	const params = {
		status: getDonationThanksStr(donator, count, total),
	};

	T.post('statuses/update', params, (err, reply) => {
		if (err) {
			console.log('[Bot] Error:', err);
		} else {
			console.log('[Bot] Tweeted:', reply.text);
		}
	});
});
