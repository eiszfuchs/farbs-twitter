const fs = require('fs');
const glob = require('glob');

let twitterKeys = JSON.parse(fs.readFileSync('twitter.json', 'utf-8'));

const Twitter = require('twitter');
const client = new Twitter(twitterKeys);

function isInterestingTweet (tweet) {
    if (tweet.hasOwnProperty('retweeted_status')) {
        return false;
    }

    if (tweet.in_reply_to_user_id) {
        if (tweet.in_reply_to_user_id != tweet.user.id) {
            return false;
        }
    }

    if (!tweet.hasOwnProperty('text')) {
        return false;
    }

    return true;
}

function getUserTweet (userId, callback) {
    client.get('statuses/user_timeline', {
        count: 100,
        user_id: userId,
    }, function (error, tweets, response) {
        if (error) {
            callback(error, null);

            return;
        }

        for (let tweet of tweets) {
            if (!isInterestingTweet(tweet)) {
                continue;
            }

            return callback(false, tweet);
        }
    });
}

let tweets = [];

function refreshTweets () {
    tweets.sort((a, b) => {
        let aTime = (new Date(a.created_at)).getTime();
        let bTime = (new Date(b.created_at)).getTime();

        if (aTime < bTime) {
            return +1;
        }

        if (aTime > bTime) {
            return -1;
        }

        return 0;
    });

    riot.update();
}

function addTweet (tweet) {
    if (!isInterestingTweet(tweet)) {
        return;
    }

    for (let tweetIndex = tweets.length - 1; tweetIndex >= 0; tweetIndex -= 1) {
        let testTweet = tweets[tweetIndex];

        if (testTweet.user.id != tweet.user.id) {
            continue;
        }

        let tweetTime = (new Date(tweet.created_at)).getTime();
        let testTime = (new Date(testTweet.created_at)).getTime();

        if (tweetTime <= testTime) {
            console.warn(`Trashing ${tweet.id_str} in favor of ${testTweet.id_str}`);

            return;
        }

        tweets.splice(tweetIndex, 1);
        break;
    }

    fs.writeFile(`.cache/${tweet.user.id}.json`, JSON.stringify(tweet), 'utf-8', (error) => {});

    tweets.push(tweet);
    refreshTweets();
}

function readCache (callback) {
    let refreshTimeout = null;

    let ready = () => {
        refreshTweets();
        callback();
    };

    glob('.cache/*.json', (error, filenames) => {
        if (error) {
            console.error(error);

            return;
        }

        filenames.forEach((filename) => {
            fs.readFile(filename, 'utf-8', (error, fileTweet) => {
                if (error) {
                    console.error(error);

                    return;
                }

                tweets.push(JSON.parse(fileTweet));

                window.clearTimeout(refreshTimeout);
                refreshTimeout = window.setTimeout(ready, 100);
            });
        });
    });
}

function readHomeTimeline () {
    client.get('statuses/home_timeline', {}, (error, tweets) => {
        if (error) {
            console.error(error);

            return;
        }

        tweets.reverse().forEach((tweet) => {
            addTweet(tweet);
        });
    });
}

riot.tag('raw', '', function (options) {
    this.root.innerHTML = options.html;
});

riot.mount('timeline', {tweets: tweets});

window.setInterval(() => {
    riot.update();
}, 60 * 1000);

function loadFriends (friends) {
    // Damn you, API limit!
    let friendInterval = Math.ceil((15 * 60 * 1000) / 180);

    friends.forEach((userId, friendIndex) => {
        window.setTimeout(() => {
            getUserTweet(userId, (error, tweet) => {
                if (error) {
                    console.error(error);

                    return;
                }

                addTweet(tweet);
            });
        }, friendIndex * friendInterval);
    });
}

client.stream('user', (stream) => {
    readCache(() => {
        readHomeTimeline();
    });

    stream.on('data', (event) => {
        if (event.hasOwnProperty('friends')) {
            return loadFriends(event.friends);
        }

        if (isInterestingTweet(event)) {
            return addTweet(event);
        }

        console.warn(event);
    });

    stream.on('error', (error) => {
        console.error(error);
    });
});
