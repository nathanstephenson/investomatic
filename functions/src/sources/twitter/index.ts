import puppeteer from 'puppeteer'
import { Ticker, TwitterUser } from '../../classes'
import { users as userMap } from './users'

const baseURL = "https://twitter.com/"

export const calculateUserScores = async () => {
	console.log("not implemented")
}

export const scrape = async (): Promise<Ticker[]> => {

	const stockWeighting: Map<string, Ticker> = new Map<string, Ticker>()

	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	
	console.log("initialised browser")

	const users: Iterable<TwitterUser> = userMap().values()

	for (const user of users) {
		const tweets = await getTweets(page, user)

		const stocks: string[] = getStocksFromTweets(tweets)
		
		stocks.forEach((stock) => applyStockWeighting(stockWeighting, stock, user))
	
		console.log("added tweets to list")
	}

	browser.close()
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

async function getTweets(page: puppeteer.Page, user: TwitterUser) : Promise<string[]> {
	await page.goto(baseURL + user.username, { waitUntil: 'networkidle0' })

	console.log("went to page for user: " + (baseURL + user.name))

	const tweets = await page.evaluate(async () => {
		return document.body.innerText
	})
	const tweetArray: string[] = tweets.split("\n")
	return tweetArray
}

