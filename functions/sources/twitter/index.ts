const puppeteer = require('puppeteer')
const { userMap } = require('./userMap')

const baseURL = "https://www.twitter.com/"

async function scrape() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await userMap

	await page.goto('https://twitter.com/jimcramer', {
		waitUntil: 'networkidle2',
	});//need to foreach and await

	await page.waitForTimeout(3000);

	// await page.screenshot({path: 'example.png'});

	const tweets = await page.evaluate(async () => {
		return document.body.innerText;
	});//not just tweets, but any object on the page (including suggested stocks to track)

	browser.close();
	return tweets;
}

module.exports = {
	getStocks: async () => {
		const tweets = await scrape();
	}
}