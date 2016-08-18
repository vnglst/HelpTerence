//
//  Bot
//  class for performing various twitter actions
//
const Twit = require('twit');

const Bot = module.exports = function defineBot(config) {
	this.twit = new Twit(config);
};

function randIndex(arr) {
	const index = Math.floor(arr.length * Math.random());
	return arr[index];
}

//
//  post a tweet
//
Bot.prototype.tweet = function tweet(status, callback) {
	if (typeof status !== 'string') {
		return callback(new Error('tweet must be of type String'));
	} else if (status.length > 140) {
		return callback(new Error(`tweet is too long: ${status.length}`));
	}
	return this.twit.post('statuses/update', {
		status,
	}, callback);
};

//
//  delete a tweet
//
Bot.prototype.destroy = function destroy(id, callback) {
	return this.twit.post('statuses/destroy/:id', {
		id,
	}, callback);
};

// choose a random tweet and follow that user
Bot.prototype.searchFollow = function searchFollow(params, callback) {
	const self = this;
	return self.twit.get('search/tweets', params)
		.then((result) => {
			const tweets = result.data.statuses;
			const rTweet = randIndex(tweets);
			if (typeof rTweet !== 'undefined') {
				const target = rTweet.user.id_str;

				return self.twit.post('friendships/create', {
					id: target,
				}, callback);
			}
			return callback();
		});
};

//
// retweet
//
Bot.prototype.retweet = function retweet(params, callback) {
	const self = this;

	self.twit.get('search/tweets', params, (err, reply) => {
		if (err) return callback(err);

		const tweets = reply.statuses;
		const randomTweet = randIndex(tweets);
		if (typeof randomTweet !== 'undefined') {
			return self.twit.post('statuses/retweet/:id', {
				id: randomTweet.id_str,
			}, callback);
		}
		return callback();
	});
};

//
// reply
//
Bot.prototype.reply = function reploy(userHandle, message, callback) {
	const params = {
		status: `@${userHandle} ${message}`,
	};
	console.log(`[Bot] Tweeting: ${params.status}`);
	return this.twit.post('statuses/update', params, callback);
};

//
// start listening for mentions
//
Bot.prototype.listen = function listen(handler) {
	const stream = this.twit.stream('statuses/filter', {
		track: ['@HelpTerence'],
	});

	stream.on('connected', () => {
		console.log('[Bot] Connected to stream. Listening...');
	});

	stream.on('tweet', handler);

	stream.on('reconnecting', (req, res, connectInterval) => {
		console.log('[Bot] Got disconnected. Scheduling reconnect! statusCode:',
			res.statusCode,
			'connectInterval',
			connectInterval);
	});

	stream.on('error', (err) => {
		console.log('[Bot] Stream emitted an error', err);
	});

	stream.on('disconnected', () => {
		console.log('[Bot] Disconnected from stream.');
	});
};

// //
// // favorite a tweet
// //
// Bot.prototype.favorite = function favorite(params, callback) {
// 	const self = this;
//
// 	self.twit.get('search/tweets', params, (err, reply) => {
// 		if (err) return callback(err);
//
// 		const tweets = reply.statuses;
// 		const randomTweet = randIndex(tweets);
// 		if (typeof randomTweet !== 'undefined') {
// 			return self.twit.post('favorites/create', {
// 				id: randomTweet.id_str,
// 			}, callback);
// 		}
// 		return callback();
// 	});
// };
//
// //
// //  choose a random friend of one of your followers, and follow that user
// //
// Bot.prototype.mingle = function mingle(callback) {
// 	const self = this;
//
// 	this.twit.get('followers/ids', (err, reply) => {
// 		if (err) {
// 			return callback(err);
// 		}
//
// 		const followers = reply.ids;
// 		const randFollower = randIndex(followers);
//
// 		self.twit.get('friends/ids', {
// 			user_id: randFollower,
// 		}, (err, reply) => {
// 			if (err) {
// 				return callback(err);
// 			}
//
// 			const friends = reply.ids;
// 			const target = randIndex(friends);
//
// 			self.twit.post('friendships/create', {
// 				id: target,
// 			}, callback);
// 		});
// 	});
// };
//
// //
// //  prune your followers list; unfollow a friend that hasn't followed you back
// //
// Bot.prototype.prune = function prune(callback) {
// 	const self = this;
//
// 	this.twit.get('followers/ids', (err, reply) => {
// 		if (err) return callback(err);
//
// 		const followers = reply.ids;
//
// 		self.twit.get('friends/ids', (err, reply) => {
// 			if (err) return callback(err);
//
// 			const friends = reply.ids;
// 			let pruned = false;
//
// 			while (!pruned) {
// 				const target = randIndex(friends);
//
// 				if (!~followers.indexOf(target)) {
// 					pruned = true;
// 					self.twit.post('friendships/destroy', {
// 						id: target,
// 					}, callback);
// 				}
// 			}
// 		});
// 	});
// };
