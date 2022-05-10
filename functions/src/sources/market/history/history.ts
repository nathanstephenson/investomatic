import { Ticker } from '../../../classes'
import * as fs from 'fs'

const FILEPATH = './src/sources/market/history/history.csv'
const DELIM = ","
const NEWLINE = "\n"

export function unmarshallHistoryFile() : Ticker[] {
	const tickers: Ticker[] = []

	fs.readFile(FILEPATH, (err, data) => {
		if(err) {
			console.log("market/history/history.ts | failed to read file")
			return
		}

		const lines = data.toString().split("\n").slice(1)
		for(const line of lines){
			const split = line.split(DELIM)
			const tickerName = split[0]
			const tickerRating = split[1]
			// const lastCalculated = split[2]

			tickers.push(new Ticker(tickerName, Number.parseFloat(tickerRating)))
		}
	})

	return tickers
}

export function marshallHistoryFile(tickers: Ticker[]) : boolean {
	let data = ""

	const tickerHistory = unmarshallHistoryFile()

	tickers = mergeTickersWithHistory(tickers, tickerHistory)

	data = data.concat("TICKER_NAME")
		.concat(DELIM).concat("VALUE")
		.concat(DELIM).concat("LAST_CALCULATED")
		.concat("\n")

	for(const ticker of tickers){
		data = data.concat(ticker.getName())
			.concat(DELIM).concat(ticker.getRating().toString())
			.concat(DELIM).concat(Date.now().toString())
			.concat(tickers.indexOf(ticker) < tickers.length - 1 ? NEWLINE : "")
	}

	fs.writeFile(FILEPATH, data, err => {
		if(err){
			console.log("market/history/history.ts | failed to write file")
			return
		}

		console.log("market/history/history.ts | successfully wrote to file at " + FILEPATH)
	})
	return false
}

function mergeTickersWithHistory(tickers: Ticker[], tickerHistory: Ticker[]): Ticker[] {
	const mergedTickers: Ticker[] = []

	

	return mergedTickers
}
