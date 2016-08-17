/*
 * HelpTerence
 * A Twitter Bot
 * Copyright(c) 2016 Koen van Gilst <koen@koenvangilst.nl>
 * MIT Licensed
 *
 */

require('dotenv')
	.config({
		silent: true, // suppress warning when .env is missing in production
	});
const express = require('express');
const mongoose = require('mongoose');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

const config = require('./config');
const bot = require('./bot/bot');
const BotController = require('./api/controllers/BotController');

const port = process.env.PORT || 3000;
const app = express();

const botData = {
	twitterID: 'HelpTerence',
};

mongoose.Promise = global.Promise;

module.exports = app;

const listen = asyncFn(() => {
	if (app.get('env') === 'test') return;
	app.listen(port);
	console.log(`[Express] App started on port ${port}`);
	awaitFn(BotController.createOrFindBot(botData));
	bot.listen();
});

function connectToDB() {
	const options = {
		server: {
			socketOptions: {
				keepAlive: 1,
			},
		},
	};
	return mongoose.connect(config.db, options)
		.connection;
}

connectToDB()
	.on('error', console.log)
	.on('disconnected', connectToDB)
	.once('open', listen);
