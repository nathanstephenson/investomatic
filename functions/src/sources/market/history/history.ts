import { Ticker, TickerHistory } from '../../../classes'
import * as fs from 'fs'

const FILEPATH = './src/sources/market/history/history.csv'
const DELIM = ","
const NEWLINE = "\n"

export function unmarshallHistoryFile() : TickerHistory[] {
	const tickers: TickerHistory[] = []

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
			const lastCalculated = split[2]
			const averageDaysBetweenUpdates = split[3]

			tickers.push(new TickerHistory(tickerName, Number.parseFloat(tickerRating), new Date(lastCalculated), Number.parseFloat(averageDaysBetweenUpdates)))
		}
	})

	return tickers
}

export function marshallHistoryFile(tickers: Ticker[]) : boolean {
	let data = ""

	const tickerHistory = unmarshallHistoryFile()

	tickers = mergeTickersWithHistory(tickers, tickerHistory)

	data = data.concat("TICKER_NAME")
		.concat(DELIM).concat("RATING")
		.concat(DELIM).concat("LAST_UPDATED")
		.concat(DELIM).concat("AVG_UPDATE_INTERVAL")
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

function mergeTickersWithHistory(tickers: Ticker[], tickerHistory: TickerHistory[]) : TickerHistory[] {
	const mergedTickers: TickerHistory[] = []

	

	return mergedTickers
}

