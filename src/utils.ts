import { Ticker } from "./classes"

/* eslint-disable require-jsdoc */
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

        const multiplicator = Math.pow(10, decimalPlaces)
        n = parseFloat((n * multiplicator).toFixed(11))
        return Math.round(n) / multiplicator
}

export function getPreviousWorkingDayTimestamp(date: Date) {
	date = goBackOneDay(date)
	while (date.getDay() === 0 || date.getDay() === 6) {
		date = goBackOneDay(date)
	}
	return date.setHours(0,0,0,0) / 1000
}

function goBackOneDay(date: Date): Date {
	if(date.getDate() > 1){
		date.setDate(date.getDate() - 1)
	} else if (date.getMonth() > 0){
		date.setMonth(date.getMonth() - 1, 0)
	} else {
		date.setFullYear(date.getFullYear() - 1, 11, 0)
	}
	return date
}

/**
 * Asynchronous forEach method which runs in parallel. Can return an array of results (similar to map)
 */
export async function asyncForEach(params: unknown[], callbackFn: {(param: any):Promise<unknown>}) : Promise<any[]> {
	return await Promise.all(params.map(async param => await callbackFn(param)))
}
