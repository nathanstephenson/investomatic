import * as functions from "firebase-functions"
import Alpaca from "@alpacahq/alpaca-trade-api"

import { alpacaAPIKey, alpacaKeyID } from "./secrets"

import { Ticker } from "./classes"
import { filterToAboveAverage, splitToBuyAndSell } from "./utils"
import { getHistoricScores } from "./sources/market"

const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true
})

export const investomatic = functions.https.onRequest(async (request, response) => {
	console.log(request.url)
	switch(request.url){
		case '/load':
			break
		case '/calculate':
			break
		case '/display':
			break
		case 'order':
			break
		default:
			break
	}
	const tickers: Ticker[] = await getHistoricScores(['TSLA', 'AAPL'])

	// GATHER DATA

	// POST PROCESSING
	const tickersList = splitToBuyAndSell(tickers)
	const buyList = filterToAboveAverage(tickersList.buy)
	// const sellList = tickersList.sell

	console.log("main | Out of the tickers " + tickers.map(t => t?.getName()) + " these ones are above average in rating: " + buyList)

	// REDUCE ARRAY TO ONLY ONE OF EACH VALUE
	// const stocksToBuy = Array.from(new Set(gptChoices)) 

	// USE HISTORICAL DATA TO ADD WEIGHTING TO SCORES AND VALIDATE TICKERS
	// const validTickers = await getHistoricScores(stocksToBuy)

	// MAKE ORDER
	// await makeOrder(validTickers, response)
	response.send(buyList)
})

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

