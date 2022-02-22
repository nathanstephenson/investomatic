import * as puppeteer from 'puppeteer'
import { users } from './users'

const baseURL = "https://twitter.com/"

export const scrape = async (): Promise<string[]> => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	const allTweets: string[] = []
	
	Array.from(users().values()).forEach(async (user) => {
		await page.goto(baseURL+user.username, {
			waitUntil: 'load'
		})

		await page.screenshot({path: 'example.png'})

		const tweets = await page.evaluate(async () => {
			return document.body.innerText
		})
		
		allTweets.push(tweets)
	})

	browser.close()
	return allTweets
}
