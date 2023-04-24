import * as functions from "firebase-functions"
import { Configuration, OpenAIApi } from "openai"
import Alpaca from "@alpacahq/alpaca-trade-api"

import { openAiAPIKey, alpacaAPIKey, alpacaKeyID } from "./secrets"

import { scrape as twitterScrape } from "./sources/twitter"
import { Ticker } from "./classes"
import { updateTickerScores, filterToAboveAverage, splitToBuyAndSell } from "./utils"
import { getHistoricScores } from "./sources/market"

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

	const tickers: Ticker[] = await getHistoricScores(['TSLA', 'AAPL'])

	// GATHER DATA
	// const twitterTickers = await twitterScrape()
	// tickers = updateTickerScores(twitterTickers, tickers, sourceMultipliers["twitter"])
	// console.log("main | added tweets to map")

	// POST PROCESSING
	const tickersList = splitToBuyAndSell(tickers)
	const buyList = filterToAboveAverage(tickersList.buy)
	// const sellList = tickersList.sell

	console.log("main | Out of the tickers " + tickers.map(t => t?.getName()) + " these ones are above average in rating: " + buyList)

	// GET AN AI TO TELL ME WHAT TO DO WITH MY MONEY
	// const gptChoices = await getChoicesFromGPT(buyList)

	// REDUCE ARRAY TO ONLY ONE OF EACH VALUE
	// const stocksToBuy = Array.from(new Set(gptChoices)) 

	// USE HISTORICAL DATA TO ADD WEIGHTING TO SCORES AND VALIDATE TICKERS
	// const validTickers = await getHistoricScores(stocksToBuy)

	// MAKE ORDER
	// await makeOrder(validTickers, response)
	response.send(buyList)
})


async function getChoicesFromGPT(tickersList: string[]) : Promise<string[] | undefined> {
	const filteredTickers = tickersList.toString().replace(",", "\n")
	console.log("src/index.ts | tickers selected: " + tickersList)

	const gptCompletion = await openAI.createCompletion('text-ada-001', {
		prompt: `${filteredTickers} I'm thinking of buying the following stock tickers: `,
		temperature: 0.7,
		max_tokens: 32,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0
	})

	console.log("src/index.ts | got response from openai")

	const choices = gptCompletion.data.choices
	
	if (choices != undefined && choices != null && choices[0] != undefined && choices[0] != null) {
		const stocksToBuy = choices[0].text?.match(/\b[A-Z]+\b/g)?.map((s) => {return s})

		console.log("src/index.ts | got stocks to buy: " + stocksToBuy)

		return stocksToBuy
	}

	return
}

/**
 * Makes a single order using a random ticker in the stocksToBuy list (also sends response)
 */
async function makeOrder(stocksToBuy: Ticker[], response: functions.Response<any>) : Promise<void> {
	
	const account = await alpaca.getAccount().catch((error: unknown) => response.send(error))

	console.log("src/index.ts | got alpaca account")

	if (stocksToBuy != undefined && stocksToBuy != null) {
		const stockToBuy = stocksToBuy[Math.floor(Math.random() * stocksToBuy?.length)]
		const notional = 0.1 * account.buying_power * stocksToBuy.length > 0 ? stockToBuy.getRating() : 1
		console.log("src/index.ts | attempting to purchase " + stockToBuy + " with a notional of £" + notional)

		let order = ""
		try{
			order = await alpaca.createOrder({
				symbol: stockToBuy,
				notional: notional,
				side: 'buy',
				type: 'market',
				time_in_force: 'day'
			})
		} catch (e) {
			console.log("Couldn't create order... \n" + e)
			order += e
			response.send("Couldn't create order... \n" + order)
		}

		if(!response.headersSent){
			console.log("src/index.ts | created order")
			response.send(order)
		} else {
			console.log("src/index.ts | process failed :(")
		}
	} else {
		response.send("no stocks to buy")
	}
}

