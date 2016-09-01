/**
 * Donation Model
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let Donation;
let emit;

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

DonationSchema.statics.getTopDonaters = () => {
	const mapReduce = {
		map: function map() {
			emit(this.fromTwitterID, this.money);
		},
		reduce: function reduce(key, values) {
			return values.reduce((prev, current) => (prev || 0) + current);
		},
		out: {
			inline: 1,
		},
	};
	const p = Donation.mapReduce(mapReduce);
	p.then(results => results.sort((a, b) => a.value < b.value));
	p.then(results => results.slice(0, 4));
	return p;
};

Donation = mongoose.model('Donation', DonationSchema);

module.exports = Donation;
