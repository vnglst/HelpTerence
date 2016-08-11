/**
 * Donation Model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DonationSchema = new Schema({
	// Twitter user ID donating
	fromTwitterID: {
		type: String,
		default: '',
	},
	// Amount donated
	money: {
		type: Number,
		default: 0,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Donation = mongoose.model('Donation', DonationSchema);

module.exports = Donation;
