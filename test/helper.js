const Bot = require('../src/api/models/Bot');
const Donation = require('../src/api/models/Donation');

/**
 * Clears database
 * @param  {Object} t	tape test object
 */
exports.cleanup = async t => {
	await Bot.remove(t.pass('Removing bots'));
	await Donation.remove(t.pass('Removing donations'));
	t.pass('Done');
	t.end();
};
