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
	console.log("filtered below average tickers out of map")
	return filteredTickers
}
