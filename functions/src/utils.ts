import { Ticker } from "./classes"

/* eslint-disable require-jsdoc */
export function marshallHistoryFile() : void {// save stored user scores after running calculation
	console.log("not implemented")
}

export function unmarshallHistoryFile() : void {// output users scores to a map/object/dict
	console.log("not implemented")
}

export function updateTickerScores(retreivedTickers: Ticker[], existingTickers: Ticker[], sourceMultiplier: number) : Ticker[] {
	const tickerMap = new Map<string, Ticker>()
	existingTickers.forEach(t => {
		tickerMap.set(t.getName(), t)
	})

	retreivedTickers.forEach((ticker) => {
		const name = ticker.getName()
		tickerMap.set(name, tickerMap.get(name) != undefined ?
			tickerMap.get(name)!.multiplyRating(sourceMultiplier * ticker.getRating())
			: new Ticker(name).multiplyRating(sourceMultiplier * ticker.getRating())
		)
	})

	return Array.from(tickerMap.values())
}

export function filterToAboveAverage(tickers: Ticker[]) : string[] {
	let averageScore = 0
	Object.values(tickers).forEach((ticker) => averageScore += ticker.getRating())
	averageScore = averageScore / Object.values(tickers).length

	const filteredTickers = tickers.filter(ticker => ticker.getRating() > averageScore).map(ticker => ticker.getName())
	console.log("utils | filtered below average tickers out of map")
	return filteredTickers
}

export function splitToBuyAndSell(tickers: Ticker[]) : {buy: Ticker[], sell: Ticker[]} {
	const filtered: {buy: Ticker[], sell: Ticker[]} = {buy: [], sell: []}

	for(const ticker of tickers){
		if(ticker.getRating() > 1) {
			filtered.buy.push(ticker)
		} else if (ticker.getRating() < 1) {
			filtered.sell.push(ticker)
		}
	} 

	return filtered
}

export function round(num: number, decimalPlaces: number) : number {
	let PLACES = ""
	for(let i = 0; i < decimalPlaces; i++){
		PLACES += "0"
	}
	return Math.round(Number.parseFloat(num + PLACES)) / PLACES.length
}

/**
 * Asynchronous forEach method which runs in parallel. Can return an array of results (similar to map)
 */
export async function asyncForEach(params: unknown[], callbackFn: {(param: any):Promise<unknown>}) : Promise<any[]> {
	const results = await Promise.all(params.map(async param => await callbackFn(param)))
	return results
}
