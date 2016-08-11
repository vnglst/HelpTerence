const Bot = require('../models/Bot');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

exports.createOrFindBot = asyncFn((botData) => {
	const foundBot = awaitFn(Bot.findOne());
	if (foundBot) return foundBot;
	const bot = new Bot(botData);
	return awaitFn(bot.save());
});
