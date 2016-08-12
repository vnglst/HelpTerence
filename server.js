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
const config = require('./config');
const bot = require('./bot/bot');

const port = process.env.PORT || 3000;
const app = express();

mongoose.Promise = global.Promise;

module.exports = app;

function listen() {
	if (app.get('env') === 'test') return;
	app.listen(port);
	console.log(`Express app started on port ${port}`);
}

function connect() {
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

connect()
	.on('error', console.log)
	.on('disconnected', connect)
	.once('open', listen);

bot.login();
