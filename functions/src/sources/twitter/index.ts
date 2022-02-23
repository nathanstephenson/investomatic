import puppeteer from 'puppeteer'
import { users } from './users'

const baseURL = "https://twitter.com/"

export const scrape = async (): Promise<string[]> => {

	const allTweets: string[] = []

	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	
	console.log("initialised browser")

	for (const user of Array.from(users().values())) {
		await page.goto(baseURL + user.username, {
			waitUntil: 'networkidle0'
		})
	
		console.log("went to page: " + (baseURL + user.username))
	
		const tweets = await page.evaluate(async () => {// need to start looking at what this is actually doing
			return document.body.innerText
		})
		
		allTweets.push(tweets)
	
		console.log("added tweets to list")
	}

	browser.close()
	return allTweets
}
