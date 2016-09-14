/**
 * Bot Model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BotSchema = new Schema({
	// Twitter ID of Bot
	twitterID: {
		type: String,
		default: '',
		unique: true,
		required: true,
	},
	// Total amount of money received in donations
	money: {
		type: Number,
		default: 0,
	},
});

const Bot = mongoose.model('Bot', BotSchema);

module.exports = Bot;
