import { Ticker } from "./classes"

/* eslint-disable require-jsdoc */
export function marshallHistoryFile() : void {// save stored user scores after running calculation
	console.log("not implemented")
}

export function unmarshallHistoryFile() : void {// output users scores to a map/object/dict
	console.log("not implemented")
}

export function addTickersToMap(retreivedTickers: Ticker[], tickers: Map<string, Ticker>, sourceMultiplier: number) : void {
	retreivedTickers.forEach((ticker) => {
		const name = ticker.getName()
		tickers.set(name, tickers.get(name) != undefined ?
			tickers.get(name)!.multiplyRating(sourceMultiplier * ticker.getRating())
			: new Ticker(name).multiplyRating(sourceMultiplier * ticker.getRating())
		)
	})
}

export function filterToAboveAverage(tickers: Map<string, Ticker>) : string[] {
	let averageScore = 0
	Object.values(tickers).forEach((ticker) => averageScore += ticker.getRating())
	averageScore = averageScore / Object.values(tickers).length

	const filteredTickers = Object.keys(tickers).filter((ticker) => tickers.get(ticker)!.getRating() > averageScore)
	console.log("utils | filtered below average tickers out of map")
	return filteredTickers
}

/**
 * Asynchronous forEach method which runs in parallel. Can return an array of results (similar to map)
 */
export async function asyncForEach(params: unknown[], callbackFn: {(param: any):Promise<unknown>}) : Promise<any[]> {
	const results = await Promise.all(params.map(async param => await callbackFn(param)))
	return results
}
