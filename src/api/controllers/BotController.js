const Bot = require('../models/Bot');

exports.createOrFindBot = async (botData) => {
	console.log('[App] Creating or loading bot.');
	const foundBot = await Bot.findOne();
	if (foundBot) return foundBot;
	const bot = new Bot(botData);
	return await bot.save();
};
