import { TwitterApi } from 'twitter-api-v2';
import { Ticker, TwitterUser } from '../../classes'
import { twitterAPIBearerToken } from '../../secrets';
import { users as userMap } from './users'

export const calculateUserScores = () : void => {
	console.log("not implemented")
}

export const scrape = async () : Promise<Ticker[]> => {

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

	const client = new TwitterApi(twitterAPIBearerToken).readOnly.v2
	console.log("Connected to Twitter API " + client.getActiveTokens())

	const twitterUser = await client.userByUsername(user.getUsername())
	console.log(twitterUser.data)
	const userTweets = await client.userTimeline(twitterUser.data.id)
	console.log("tweets: " + userTweets)
	
	const tweetArray: string[] = []
	// const tweetArray: string[] = timeline.tweets.filter((tweet) => { console.log(tweet.created_at); return tweet.created_at; }).map((tweet) => { return tweet.text })

	return tweetArray
}

