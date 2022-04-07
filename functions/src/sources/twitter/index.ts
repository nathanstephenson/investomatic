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
		await page.goto(baseURL + user.username, {
			waitUntil: 'networkidle0'
		})
	
		console.log("went to page for user: " + (baseURL + user.name))
	
		const tweets = await page.evaluate(async () => {// need to start looking at what this is actually doing
			return document.body.innerText
		})

		const regex = /\b[$][A-Z]+\b/g
		const tweetArray: string[] = tweets.split("\n")
		const stocks: string[] = tweetArray.filter((text) => regex.test(text))
		
		stocks.forEach((stock) => {
			if (!stockWeighting.has(stock)) {
				stockWeighting.set(stock, new Ticker(stock))
			}
			const currentStock = stockWeighting.get(stock)!
			stockWeighting.set(stock, currentStock.multiplyRating(Number.parseFloat("1."+user.getRating().toString())))
		})
	
		console.log("added tweets to list")
	}

	browser.close()
	return Object.values(stockWeighting)
}
