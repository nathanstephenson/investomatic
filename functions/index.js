/* eslint-disable no-tabs */
const functions = require('firebase-functions');
const { openAiAPIKey, alpacaKeyID, alpacaAPIKey } = require('./secrets');
const { Configuration, OpenAIApi } = require('openai');
const puppeteer = require('puppeteer');
const Alpaca = require('@alpacahq/alpaca-trade-api');


const configuration = new Configuration({
	apiKey: openAiAPIKey,
});

const openAI = new OpenAIApi(configuration);
const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true,
});

exports.helloWorld = functions.https.onRequest(async (request, response) => {

	const tweets = await scrape();

	const gptCompletion = await openAI.createCompletion('text-ada-001', {
		prompt: `${tweets} Jim Cramer recommends buying the folling stock tickers: `,
		temperature: 0.7,
		max_tokens: 32,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0,
	});

	const stocksToBuy = gptCompletion.data.choices[0].text.match(/\b[A-Z]+\b/g);

	const account = await alpaca.getAccount();

	const order = await alpaca.createOrder({
		symbol: stocksToBuy[Math.floor(Math.random() * stocksToBuy.length)],
		notional: account.buying_power * 0.9,
		side: 'buy',
		type: 'market',
		time_in_force: 'day',
	})

	response.send(order);
});

async function scrape() {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	await page.goto('https://twitter.com/jimcramer', {
		waitUntil: 'networkidle2',
	});

	await page.waitForTimeout(3000);

	// await page.screenshot({path: 'example.png'});

	const tweets = await page.evaluate(async () => {
		return document.body.innerText;
	});//not just tweets, but any object on the page (including suggested stocks to track)

	browser.close();
	return tweets;
}
