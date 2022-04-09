import { TwitterApi } from 'twitter-api-v2';
import { Ticker, TwitterUser } from '../../classes'
import { twitterAPIKey, twitterAPIKeySecret } from '../../secrets';
import { users as userMap } from './users'

export const calculateUserScores = async () => {
	console.log("not implemented")
}

export const scrape = async (): Promise<Ticker[]> => {

	const stockWeighting: Map<string, Ticker> = new Map<string, Ticker>()

	const users: Iterable<TwitterUser> = userMap().values()

	for (const user of users) {
		const tweets = await getTweets(user)

		const stocks: string[] = getStocksFromTweets(tweets)
		
		stocks.forEach((stock) => applyStockWeighting(stockWeighting, stock, user))
	
		console.log("added tweets to list")
	}

	return Object.values(stockWeighting)
}

function applyStockWeighting(stockWeighting: Map<string, Ticker>, stock: string, twitterUser: TwitterUser) : void {
	if (!stockWeighting.has(stock)) {
		stockWeighting.set(stock, new Ticker(stock))
	}
	const currentStock = stockWeighting.get(stock)!.multiplyRating(Number.parseFloat("1." + twitterUser.getRating().toString()))
	console.log("got stock " + currentStock.getName() + " with rating: " + currentStock.getRating())
	stockWeighting.set(stock, currentStock)
}

function getStocksFromTweets(tweets: string[]) : string[] {
	const regex = /\b[$][A-Z]+\b/g
	const stocks: string[] = tweets.filter((text) => regex.test(text))
	return stocks
}

async function getTweets(user: TwitterUser) : Promise<string[]> {
	const twitterReqClient = new TwitterApi({
		appKey: twitterAPIKey,
		appSecret: twitterAPIKeySecret,
	})

	const auth = await twitterReqClient.generateAuthLink()

	const twitterClient = new TwitterApi({
		appKey: twitterAPIKey,
		appSecret: twitterAPIKeySecret,
		accessToken: auth.oauth_token, // oauth token from previous step (link generation)
		accessSecret: auth.oauth_token_secret, // oauth token secret from previous step (link generation)
	})

	console.log("Connected to Twitter API " + await twitterClient.currentUser())

	const timeline = await twitterClient.v2.userTimeline(user.getUsername()).catch((e) => console.log(e))
	console.log("Got timeline for " + user.getName() + " " + timeline)
	const tweetArray: string[] = []
	// const tweetArray: string[] = timeline.tweets.filter((tweet) => { console.log(tweet.created_at); return tweet.created_at; }).map((tweet) => { return tweet.text })

	return tweetArray
}

