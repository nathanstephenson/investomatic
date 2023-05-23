import express, {Express, Request, Response} from 'express'
import bodyParser from 'body-parser'
import {exec} from 'child_process'
import Alpaca from "@alpacahq/alpaca-trade-api"

import testAll from "../test/TestMain"

import { alpacaAPIKey, alpacaKeyID } from "./secrets"

import { Ticker } from "./classes"
import { splitToBuyAndSell } from "./utils"
import { getHistoricScores } from "./sources/market"

const port = process.env.PORT || 8080
const app: Express = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true
})

const FORWARD_SLASH = '/'
const DATA_SEPARATOR = '?'
const SUB_DATA_SEPARATOR = '&'
const DATA_KEYVAL_SEPARATOR = '='

app.listen(port, () => {
	testAll()
	console.log(`Server is UP at: localhost:${port}`)
})

function execAlgo(): Promise<string> {
	return new Promise((resolve, reject) => {
		exec("sh ~/Documents/Projects/investomatic/execAlgo.sh", (error, stdout, stderr) => {
			if (error) {
				console.log(stdout)
				console.log(error)
				reject(error.message)
			}
			console.log(stdout)
			resolve(stdout)
		})
	})	
}

interface Output {
	score: number,
	data: OutputData[]
}

interface OutputData {
	value: number,
	timestamp: number
}
let outputData = new Map<string, Output>()

// data?{ticker}&{start date}?{ticker}&{start date}
app.get('/data', async function(req: Request, res: Response) {
	setResponseHeaders(res)
	const tickersForHistory = getReqData(req.url).split(DATA_SEPARATOR).map(tickerData => {
		const splitData = tickerData.split(SUB_DATA_SEPARATOR)
		return {name: splitData[0], startDate: Number.parseInt(splitData[1]) || 1}
	})
	res.send(await getHistoricScores(tickersForHistory))
})

// visualise?{ticker}
app.get('/visualise', function(req: Request, res: Response) {
	setResponseHeaders(res)
	const reqData = getReqData(req.url)
	res.setHeader("ticker", reqData)
	res.send(outputData.get(reqData))
})

app.get('/tickers', function(req: Request, res: Response) {
	setResponseHeaders(res)
	res.send(Array.from(outputData.keys()))
})

app.get('/exec', async function(req: Request, res: Response) {
	setResponseHeaders(res)
	await execAlgo().then(() => res.send(true), () => res.send(false))
})

// order?{ticker}&{score}?{ticker}&{score}
app.get('/order', function(req: Request, res: Response) {
	setResponseHeaders(res)
	const orderTickers: Ticker[] = getReqData(req.url).split(SUB_DATA_SEPARATOR).map(tickerData => {
		const splitData: string[] = tickerData.split(DATA_KEYVAL_SEPARATOR)
		return new Ticker(splitData[0], Number.parseFloat(splitData[1]) || 1)
	})
	res.send(makeOrder(orderTickers, res))
})

app.post('/output', async function(req: Request, res: Response) {
	setResponseHeaders(res)
	outputData = new Map<string, Output>()
	for(const ticker in req.body) {
		outputData.set(ticker, req.body[ticker])
	}
	res.send(true)
})

function setResponseHeaders(res: Response) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE")
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
}

function getReqData(reqUrl: string): string {
	let indexOfReqData: number = reqUrl.indexOf(DATA_SEPARATOR) 
	if(indexOfReqData == -1) {
		indexOfReqData = reqUrl.length 
	}

	return reqUrl.substring(indexOfReqData + 1)
}

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


// RUN OTHER COMMANDS AFTER SETUP COMPLETE

execAlgo()

