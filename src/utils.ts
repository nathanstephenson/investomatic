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

export function filterToAboveAverage(tickers: Ticker[]) : Ticker[] {
	return filterScore(tickers, true)	
}

export function filterToBelowAverage(tickers: Ticker[]): Ticker[] {
	return filterScore(tickers, false)
}

function filterScore(tickers: Ticker[], filterAbove: boolean): Ticker[]{
	const averageScore = getAverageScore(tickers)
	const filteredTickers = tickers.filter(ticker => filterAbove ? ticker.getRating() >= averageScore : ticker.getRating() < averageScore)
	console.log("utils | filtered below average tickers out of map")
	return filteredTickers
}

function getAverageScore(tickers: Ticker[]): number {
	let averageScore = 0
	Object.values(tickers).forEach((ticker) => averageScore += ticker.getRating())
	averageScore = averageScore / Object.values(tickers).length
	console.log("Average ticker score: ", averageScore)
	return averageScore

}

export function splitToBuyAndSell(tickers: Ticker[]) : {buy: Ticker[], sell: Ticker[]} {
	return {buy: filterToAboveAverage(tickers), sell: filterToBelowAverage(tickers)}
}

export function round(n: number, decimalPlaces: number) : number {
	if (decimalPlaces === undefined) {
            decimalPlaces = 0
        }

        var multiplicator = Math.pow(10, decimalPlaces)
        n = parseFloat((n * multiplicator).toFixed(11))
        return Math.round(n) / multiplicator
}

/**
 * Asynchronous forEach method which runs in parallel. Can return an array of results (similar to map)
 */
export async function asyncForEach(params: unknown[], callbackFn: {(param: any):Promise<unknown>}) : Promise<any[]> {
	return await Promise.all(params.map(async param => await callbackFn(param)))
}
