# FARBS' Twitter Client

> Is there a twitter interface that shows only the latest tweet from people you follow? I want to hear all the voices, not just the loud ones.
>
> -- [@FarbsMcFarbs](https://twitter.com/FarbsMcFarbs/status/777408936706048001)


## Current features

- Displays one (1) tweet per followed account in chronological order
- Streams user's Timeline in real-time
- Ignores Retweets and replies completely
- Caches displayed Tweets


## Running

This application is completely cross-platform, but requires [Node JS](https://nodejs.org/) to be installed on your system.

Save `twitter.json-dist` as `twitter.json` and fill it with [your API keys](https://apps.twitter.com/).

```bash
npm install -g electron-prebuilt
npm install
electron .
```
