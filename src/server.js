/*
 * HelpTerence
 * A Twitter Bot
 * Copyright(c) 2016 Koen van Gilst <koen@koenvangilst.nl>
 * MIT Licensed
 *
 */

require('dotenv')
	.config();
const express = require('express');
const mongoose = require('mongoose');

const terence = require('./bot/terence');
const config = require('./config');
const BotController = require('./api/controllers/BotController');

const port = process.env.PORT || 1970;
const app = express();
const botData = {
	twitterID: 'HelpTerence',
};

mongoose.Promise = global.Promise;
module.exports = app;

require('./config/express')(app);
require('./config/routes')(app);

const listen = async() => {
	if (app.get('env') === 'test') return;
	app.listen(port);
	console.log(`[Express] App started on port ${port}`);
	console.log(`[Express] Visit http://localhost:${port}`);
	console.log(`[App] Starting in ${process.env.NODE_ENV} mode`);
	try {
		const botInfo = await BotController.createOrFindBot(botData);
		if (botInfo) console.log(`[App] Bot found with ${botInfo.money} money bags`);
	} catch (e) {
		console.log(`[Express] Database error ${e}`);
	}
	terence.start();
};

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
