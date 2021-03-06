const DonationController = require('../api/controllers/DonationController');
const Bot = require('./bot');
const BotModel = require('../api/models/Bot');
const Donation = require('../api/models/Donation');

const bot = new Bot();

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

function getDonationMessage(count, total, userHandle) {
	const messages = [
		`Thanks for donating ${count} @${userHandle}! I now have ${
			total} money bags! 👍`,
		`Thanks for your ${count} monies @${userHandle}. I'm now at ${
			total} money bags!`,
		`Muchas gracias @${userHandle}!! Including your ${
			count} I now have ${total} money bags! 🎉`,
		`Vielen Dank @${userHandle}!! That's German for thank you. With those ${
			count} I'm now at ${total} monies! 🍺`,
		`Heel erg bedankt @${userHandle}! That's Dutch for thank you very much. With your ${
			count} I'm now at ${total} monies! 🧀`,
		`Wow, I'm now at ${total}! Thanks for those ${
			count} monies @${userHandle}. 👍👍`,
	];
	const message = randomElement(messages);
	return message;
}

function handleError(err) {
	console.error('response status:', err.statusCode);
	console.error('data:', err.data);
}

const handleStatus = async(tweet) => {
	const replyToTweet = tweet;
	const terence = await BotModel.findOne();
	const donationCount = await Donation.count();
	const top = await Donation.getTopDonaters();
	const uptime = format(process.uptime());
	const message = `still going strong!
		Uptime: ${uptime}
		# of donations: ${donationCount}
		Pledged: ${terence.money}
		Top 3 donaters:
			1. @${(top[0] && top[0]._id) || '...'}
			2. @${(top[1] && top[1]._id) || '...'}
			3. @${(top[2] && top[2]._id) || '...'}`;
	return await bot.reply(replyToTweet, message);
};

const handleDonation = async(tweet, coinTypes) => {
	const text = tweet.text;
	const count = getCount(text, coinTypes);
	const donator = tweet.user.screen_name;
	const donationData = {
		fromTwitterID: donator,
		createdAt: new Date(),
		money: count,
	};
	const replyToTweet = tweet;
	try {
		const donetee = await DonationController.createDonation(donationData);
		const total = donetee.money;
		const userHandle = replyToTweet.user.screen_name;
		const message = getDonationMessage(count, total, userHandle);
		const params = {
			status: message,
			in_reply_to_status_id: replyToTweet.id_str,
		};
		return await bot.twit.post('statuses/update', params);
	} catch (e) {
		if (e.message === 'Donation not allowed. Already donated today!') {
			const message = 'sorry, you already donated today. I wouldnt want you to get poor!';
			return await bot.reply(replyToTweet, message);
		}
		// Retrow all other catched errors
		console.log(`[Terence] Twitter error ${e}`);
		throw e;
	}
};

const handleMention = (tweet) => {
	const coinTypes = ['💰', '💵', '💶', '💷', '💴', '💸', '💳'];
	const text = tweet.text;
	console.log(`[Terence] Somebody mentioned me in the following tweet:\n ${text}`);
	try {
		if (includesOne(text, coinTypes)) handleDonation(tweet, coinTypes);
		if (text.includes('status')) handleStatus(tweet);
	} catch (e) {
		console.log(`[Terence] Error handling mention. Error: ${e}`);
	}
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
		if (rand <= 0.55) { //  make a friend
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
	}, 30 * 60000); // every 30 * 1 minute = 60 seconden = 30 * 60 000 ms
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
