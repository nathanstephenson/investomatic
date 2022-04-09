import * as functions from "firebase-functions"
import { Configuration, OpenAIApi } from "openai"
import Alpaca from "@alpacahq/alpaca-trade-api"

import { openAiAPIKey, alpacaAPIKey, alpacaKeyID } from "./secrets"

import { scrape as twitterScrape } from "./sources/twitter"
import { Ticker } from "./classes"
import { addTickersToMap, filterToAboveAverage } from "./utils"

const configuration = new Configuration({
	apiKey: openAiAPIKey
})

const openAI = new OpenAIApi(configuration)

const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true
})

const sourceMultipliers = {
	"twitter": 1,
}

export const investomatic = functions.https.onRequest(async (request, response) => {

	


	response.send("You probably shouldn't see this")
})

export const scraping = functions.https.onRequest(async (request, response) => {

	const tickers: Map<string, Ticker> = new Map<string, Ticker>()

	// GATHER DATA
	const twitterTickers = await twitterScrape()
	addTickersToMap(twitterTickers, tickers, sourceMultipliers["twitter"])
	console.log("added tweets to map")

	// POST PROCESSING
	const tickersList = filterToAboveAverage(tickers)

	console.log("Out of the tickers " + tickers.values() + " these ones are above average in rating: " + tickersList)

	const stocksToBuy = await getChoicesFromGPT(tickersList)

	await makeOrder(stocksToBuy, tickers, response)
});


async function getChoicesFromGPT(tickersList: string[]) {
	const filteredTickers = tickersList.toString().replace(",", "\n")
	console.log("tickers selected: " + tickersList)

	const gptCompletion = await openAI.createCompletion('text-ada-001', {
		prompt: `${filteredTickers} I'm thinking of buying the following stock tickers: `,
		temperature: 0.7,
		max_tokens: 32,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0
	})

	console.log("got response from openai")

	const choices = gptCompletion.data.choices
	
	if (choices != undefined && choices != null && choices[0] != undefined && choices[0] != null) {
		const stocksToBuy = choices[0].text?.match(/\b[A-Z]+\b/g)?.map((s) => {return s})

		console.log("got stocks to buy: " + stocksToBuy)

		return stocksToBuy
	}

	return
}

/**
 * Makes a single order using a random ticker in the stocksToBuy list (also sends response)
 */
async function makeOrder(stocksToBuy: string[] | undefined, tickers: Map<string, Ticker>, response: functions.Response<any>) {
	
	const account = await alpaca.getAccount().catch((error: unknown) => response.send(error))

	console.log("got alpaca account")

	if (stocksToBuy != undefined && stocksToBuy != null) {
		const stockToBuy = stocksToBuy[Math.floor(Math.random() * stocksToBuy?.length)]
		const order = await alpaca.createOrder({
			symbol: stockToBuy,
			notional: 0.1 * account.buying_power * tickers.size > 0 ? tickers.get(stockToBuy)!.getRating() : 1,
			side: 'buy',
			type: 'market',
			time_in_force: 'day'
		})

		console.log("created order")

		response.send(order)
	} else {
		response.send("no stocks to buy")
	}
}

