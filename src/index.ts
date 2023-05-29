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

const DATA_SEPARATOR = "?"
const SUB_DATA_SEPARATOR = "&"

type Position = {
	ticker: string
	quantity: number
	price: number
}

interface Output {
	score: number
	data: OutputData[]
}

interface OutputData {
	value: number
	timestamp: number
}

let outputData = new Map<string, Output>()
let currentPositions = new Map<string, Position>()
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
	currentPositions.clear()
	const positions: Position[] = []
	interface CurrentPosition {
		symbol: string,
		qty: number,
		current_price: number
	}
	(await alpaca.getPositions() as CurrentPosition[]).forEach((pos: CurrentPosition) => {
		const position = { ticker: pos.symbol, quantity: pos.qty, price: pos.current_price }
		currentPositions.set(pos.symbol, position)
		positions.push(position)
	})
	res.send(positions)
})

app.get("/suggested", (req: Request, res: Response) => {
	setResponseHeaders(res)
	const suggestions: {ticker: string, value: number}[] = []
	suggestedPositions.forEach((value, key) => {
		suggestions.push({ticker: key, value})
	})
	res.send(suggestions)
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
	for (const position in currentPositions.keys()) { // add sell orders for any positions missing from suggestions
		if (!suggestedPositions.has(position)) {
			suggestedPositions.set(position, - currentPositions.get(position)!.price * currentPositions.get(position)!.quantity)
		}
	}
	for (const ticker in suggestedPositions.keys()) {
		if (suggestedPositions.get(ticker)! < 0 && !currentPositions.has(ticker)) continue
		responses.push(makeOrder(ticker, suggestedPositions.get(ticker)!))
	}
	res.send(responses)
})

app.listen(port, () => {
	testAll()
	console.log(`Server is UP at: localhost:${port}`)
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
 * Makes a single order using a random ticker in the stocksToBuy list (and returns the response)
 */
async function makeOrder(ticker: string, notional: number): Promise<string> {
	console.log("order: ", ticker, notional)
	const account = await alpaca.getAccount().catch((error: Error) => error)
	if (account instanceof Error) {
		return account.message
	}

	let order = ""
	try {
		order = await alpaca.createOrder({
			symbol: ticker,
			notional: Math.abs(notional),
			side: notional >= 0 ? "buy" : "sell",
			type: "market",
			time_in_force: "day",
		})
	} catch (e) {
		console.log("Couldn't create order... \n" + e)
		order += e
		return order
	}

	console.log("src/index.ts | created order")
	return order
}
