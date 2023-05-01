import express, {Express, Request, Response} from 'express'
import Alpaca from "@alpacahq/alpaca-trade-api"

import testAll from "../test/TestMain"

import { alpacaAPIKey, alpacaKeyID } from "./secrets"

import { Ticker } from "./classes"
import { splitToBuyAndSell } from "./utils"
import { getHistoricScores } from "./sources/market"

const port = process.env.PORT || 8080
const app: Express = express()
const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true
})

const FORWARD_SLASH = '/'
const DATA_SEPARATOR = '&'
const SUB_DATA_SEPARATOR = '&7C'

app.listen(port, () => {
	testAll()
	console.log(`Server is UP at: localhost:${port}`)
})

app.get('/*', async function(req: Request, res: Response) {
	if(req.url === '/favicon.ico'){ return }
	let indexOfReqData: number = req.url.indexOf(DATA_SEPARATOR) 
	if(indexOfReqData == -1) {
		indexOfReqData = req.url.length 
	}
	console.log("Req index is ", indexOfReqData)
	const reqType = req.url.substring(1, indexOfReqData)
	const reqData = req.url.substring(indexOfReqData)
	console.log(`req type: ${reqType}, req data: ${reqData}`)
	switch(reqType) {
		case '':
			const tickersForHistory = reqData.split(DATA_SEPARATOR)
			res.send(await getHistoricScores(tickersForHistory))
			break
		case 'order':
			const orderTickers: Ticker[] = reqData.split(DATA_SEPARATOR).map(tickerData => {
				const splitData: string[] = tickerData.split(SUB_DATA_SEPARATOR)
				return new Ticker(splitData[0], Number.parseFloat(splitData[1]) || 1)
			})
			res.send(makeOrder(orderTickers, res))
			break
		default:
			res.send("You probably shouldn't be here")
			break
	}
})

/**
 * Makes a single order using a random ticker in the stocksToBuy list (also sends response)
 */
async function makeOrder(stocksToBuy: Ticker[], response: Response): Promise<void> {
	
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

