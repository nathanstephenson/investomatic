import puppeteer from 'puppeteer'
import { users } from './users'

const baseURL = "https://twitter.com/"

export const calculateUserScores = async () => {
	console.log("not implemented")
}

export const scrape = async (): Promise<{ [ticker: string]:number }> => {

	const stockWeighting: { [ticker: string] : number } = {}

	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	
	console.log("initialised browser")

	for (const user of Array.from(users().values())) {
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
			stockWeighting[stock] = stockWeighting[stock] == undefined ? user.modifier : stockWeighting[stock] += user.modifier
		})
	
		console.log("added tweets to list")
	}

	browser.close()
	return stockWeighting
}
