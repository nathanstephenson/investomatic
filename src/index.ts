import express, { Express, Request, Response } from "express"
import bodyParser from "body-parser"
import { exec } from "child_process"
import Alpaca from "@alpacahq/alpaca-trade-api"

import testAll from "../test/TestMain"

import { alpacaAPIKey, alpacaKeyID } from "./secrets"

import { getHistoricScores } from "./sources/market"

const port = process.env.PORT || 8080
const app: Express = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true,
})
const TOTAL_POSITIONS_VALUE = 20000

const FORWARD_SLASH = "/"
const DATA_SEPARATOR = "?"
const SUB_DATA_SEPARATOR = "&"
const DATA_KEYVAL_SEPARATOR = "="

app.listen(port, () => {
	testAll()
	console.log(`Server is UP at: localhost:${port}`)
})

interface Output {
	score: number
	data: OutputData[]
}

interface OutputData {
	value: number
	timestamp: number
}

let outputData = new Map<string, Output>()
let suggestedPositions = new Map<string, number>()

// data?{ticker}&{start date}?{ticker}&{start date}
app.get("/data", async (req: Request, res: Response) => {
	setResponseHeaders(res)
	const tickersForHistory = getReqData(req.url)
		.split(DATA_SEPARATOR)
		.map(tickerData => {
			const splitData = tickerData.split(SUB_DATA_SEPARATOR)
			return {
				name: splitData[0],
				startDate: Number.parseInt(splitData[1]) || 1,
			}
		})
	res.send(await getHistoricScores(tickersForHistory))
})

// visualise?{ticker}
app.get("/visualise", (req: Request, res: Response) => {
	setResponseHeaders(res)
	const reqData = getReqData(req.url)
	res.setHeader("ticker", reqData)
	res.send(outputData.get(reqData))
})

app.get("/tickers", (req: Request, res: Response) => {
	setResponseHeaders(res)
	res.send(Array.from(outputData.keys()))
})

app.get("/exec", async (req: Request, res: Response) => {
	setResponseHeaders(res)
	await execAlgo().then(
		() => res.send(true),
		() => res.send(false)
	)
})

app.get("/positions", async (req: Request, res: Response) => {
	setResponseHeaders(res)
	type Position = {
		symbol: string
		qty: number
		current_price: number
	}
	;(alpaca.getPositions() as Position[]).map((pos: Position) => {
		return { name: pos.symbol, value: pos.qty * pos.current_price }
	})
})

app.post("/output", async (req: Request, res: Response) => {
	setResponseHeaders(res)
	outputData = new Map<string, Output>()
	for (const ticker in req.body) {
		outputData.set(ticker, req.body[ticker])
	}
	res.send(true)
})

app.post("/suggestions", (req: Request, res: Response) => {
	setResponseHeaders(res)
	suggestedPositions = new Map<string, number>()
	for (const ticker in req.body) {
		suggestedPositions.set(ticker, req.body[ticker])
	}
	res.send(true)
})

app.post("/order", (req: Request, res: Response) => {
	setResponseHeaders(res)
	const responses = []
	for (const ticker in req.body) { // update suggested positions with modifications from client
		suggestedPositions.set(ticker, req.body[ticker])
	}
	for (const ticker in suggestedPositions.keys()) {
		responses.push(makeOrder(ticker, suggestedPositions.get(ticker)!))
	}
	res.send(responses)
})

function setResponseHeaders(res: Response) {
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET,HEAD,OPTIONS,POST,PUT,DELETE"
	)
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	)
}

function getReqData(reqUrl: string): string {
	let indexOfReqData: number = reqUrl.indexOf(DATA_SEPARATOR)
	if (indexOfReqData == -1) {
		indexOfReqData = reqUrl.length
	}

	return reqUrl.substring(indexOfReqData + 1)
}

function execAlgo(): Promise<string> {
	return Promise.resolve(
		new Promise<string>((resolve, reject) => {
			exec(
				"sh ~/Documents/Projects/investomatic/execAlgo.sh",
				(error, stdout, stderr) => {
					if (error) {
						console.log(error)
						reject(error.message)
					}
					console.log(stdout)
					resolve(stdout)
				}
			)
		})
	)
}

/**
 * Makes a single order using a random ticker in the stocksToBuy list (also sends response)
 */
async function makeOrder(ticker: string, notional: number): Promise<string> {
	const account = await alpaca.getAccount().catch((error: Error) => error)
	if (account instanceof Error) {
		return account.message
	}

	console.log("src/index.ts | got alpaca account")

	console.log(
		"src/index.ts | attempting to purchase " +
			ticker +
			" with a notional of £" +
			notional
	)

	let order = ""
	try {
		order = await alpaca.createOrder({
			symbol: ticker,
			notional: notional,
			side: "buy",
			type: "market",
			time_in_force: "day",
		})
	} catch (e) {
		console.log("Couldn't create order... \n" + e)
		order += e
		return "Couldn't create order... \n" + order
	}

	console.log("src/index.ts | created order")
	return order
}
// RUN OTHER COMMANDS AFTER SETUP COMPLETE

// execAlgo()
