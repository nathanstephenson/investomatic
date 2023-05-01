import { Ticker, TickerHistory } from '../../../classes'
import * as fs from 'fs'

const FILEPATH = './src/sources/market/history/history.csv'
const DELIM = ","
const NEWLINE = "\n"

export function unmarshallHistoryFile() : TickerHistory[] {
	const historicalTickers: TickerHistory[] = []

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

			const tickerHistoryRecord = new TickerHistory(new Ticker(tickerName, Number.parseFloat(tickerRating)), new Date(lastCalculated), Number.parseFloat(averageDaysBetweenUpdates))
			console.log("Unmarshalled TickerHistory row from file: ", tickerHistoryRecord)
			historicalTickers.push(tickerHistoryRecord)
		}
	})

	return historicalTickers
}

export function marshallHistoryFile(tickers: Ticker[]) : boolean {
	let data = ""

	const unmarshalledTickerHistory: TickerHistory[] = unmarshallHistoryFile()
	console.log("Unmarshalled history from file: ", unmarshalledTickerHistory)

	const tickerHistory: TickerHistory[] = mergeTickersWithHistory(tickers, unmarshalledTickerHistory)
	console.log("Merged tickers with history file: ", tickerHistory)

	//ADD HEADINGS TO FILE
	data = data.concat("TICKER_NAME")
		.concat(DELIM).concat("RATING")
		.concat(DELIM).concat("LAST_UPDATED")
		.concat(DELIM).concat("AVG_UPDATE_INTERVAL")
		.concat(NEWLINE)

	//CONCAT DATA TO STRING FOR WRITING TO FILE
	for(const ticker of tickerHistory){
		data = data.concat(ticker.getName())
			.concat(DELIM).concat(ticker.getRating().toString())
			.concat(DELIM).concat(Date.now().toString())
			.concat(DELIM).concat(ticker.getAverageDaysBetweenUpdates().toString())
			.concat(tickers.indexOf(ticker) < tickerHistory.length - 1 ? NEWLINE : "")
	}
	console.log("Writing data to file: ", data)

	//WRITE DATA TO FILE
	fs.rm(FILEPATH, ()=>{
		fs.writeFile(FILEPATH, data, err => {
			if(err){
				console.log("market/history/history.ts | failed to write file")
				return
			}
			console.log("market/history/history.ts | successfully wrote to file at " + FILEPATH)
		})
	})
	return false
}

function mergeTickersWithHistory(tickers: Ticker[], tickerHistory: TickerHistory[]) : TickerHistory[] {
	const mergedTickers: TickerHistory[] = []
	
	for(const ticker of tickers){
		if(ticker.getName() === '') {
			continue
		}
		console.log("Iterating over ticker: ", ticker)
		const currentTickerInHistory: TickerHistory | undefined = tickerHistory.filter((th) => th.getName() === ticker.getName()).at(0)!
		let historyTicker: TickerHistory
		if(currentTickerInHistory === undefined){
			console.log("Couldn't find TickerHistory for " + ticker.getName() + ", adding to file now")
			mergedTickers.push(new TickerHistory(ticker))
			continue
		}
		console.log("Updating TickerHistory: ", currentTickerInHistory)
		//historyTicker = tickerHistory.at(tickerHistory.indexOf(currentTickerInHistory))! //TODO: do I even need to do this?
		currentTickerInHistory.setRating(ticker.getRating())
		currentTickerInHistory.setLastUpdated(new Date())
	}

	return mergedTickers
}

