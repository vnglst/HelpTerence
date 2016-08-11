const Bot = require('../api/models/Bot');
const Donation = require('../api/models/Donation');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');

/**
 * Clears database
 * @param  {Object} t	tape test object
 */
exports.cleanup = asyncFn(t => {
	awaitFn(Bot.remove(t.pass('Removing bots')));
	awaitFn(Donation.remove(t.pass('Removing donations')));
	t.pass('Done');
	t.end();
});
