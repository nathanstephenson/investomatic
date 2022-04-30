import { AlphaVantageAPI, DailyBar } from "alpha-vantage-cli"
import { alphaVantageAPIKey } from "../../secrets"
import { asyncForEach } from "../../utils"

const market = new AlphaVantageAPI(alphaVantageAPIKey, "compact", false)
const sensitivity = 5 // PERCENTAGE DIFFERENCE BETWEEN OPEN/CLOSE FOR A DAY'S DATA TO IMPACT THE SCORE OF A STOCK

export async function getHistoricScores(stocks: string[] | undefined) : Promise<Map<string, number>>{
	const scores = new Map<string, number>()

	if (stocks == undefined) {
		return scores
	}
	
	await asyncForEach(stocks, async (stock: string) => {
		const data = await market.getDailyData(stock).catch(e => console.log(e))
		
		let tickerRating = 1;

		if(data){
			tickerRating = getAverageDailyRatio(data)
			console.log(stock, tickerRating)
		}

		scores.set(stock, tickerRating)
	})
	
	return scores
}

function getAverageDailyRatio(history: DailyBar[]) : number {
	const roundingPrecision = 1000 // NUMBER OF ZEROES IS NUMBER OF DECIMAL PLACES
	let ratio: number = 1
	history.forEach(day => {
		const dailyDiff = day.Close - day.Open
		const dailyPercentageIncrease = Math.round((dailyDiff / day.Open)*roundingPrecision)/roundingPrecision // ALSO ROUNDING
		if(Math.abs(dailyPercentageIncrease)*100 >= sensitivity){
			ratio *= 1 + dailyPercentageIncrease
		}
	})
	ratio = Math.round(ratio*roundingPrecision)/roundingPrecision
	return ratio // ALSO ROUNDING
}
