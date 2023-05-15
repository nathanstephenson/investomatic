import { AlphaVantageAPI, DailyBar } from "alpha-vantage-cli"
import { alphaVantageAPIKey } from "../../secrets"
import { asyncForEach } from "../../utils"

const market = new AlphaVantageAPI(alphaVantageAPIKey, "compact", false)

interface DailyTicker {
	name: string,
	open: number,
	close: number,
	high: number,
	low: number,
	quantity: number,
	timestamp: number
}

export async function getHistoricScores(stocks: string[], startDate: number) : Promise<DailyTicker[][]>{
	const returnVals: DailyTicker[][] = []
	await asyncForEach(stocks, async (stock: string) => {
		const data = await market.getDailyData(stock).catch(e => console.log(e))
		if(data){
			console.log("market/index.ts | " + stock)
			returnVals.push(data
				.filter(s => s.Timestamp.getTime() / 1000 > startDate)
				.map(s => {
					return {
						name: stock,
						open: s.Open,
						close: s.Close,
						high: s.High,
						low: s.Low,
						quantity: s.Volume,
						timestamp: s.Timestamp.getTime() / 1000 
					}
				})
			)
		}
	})
	return returnVals
}

//const sensitivity = 5 // PERCENTAGE DIFFERENCE BETWEEN OPEN/CLOSE FOR A DAY'S DATA TO IMPACT THE SCORE OF A STOCK
//function getAverageDailyRatio(history: DailyBar[]) : number {
//	const roundingPrecision = 1000 // NUMBER OF ZEROES IS NUMBER OF DECIMAL PLACES
//	let ratio: number = 1
//	history.forEach(day => {
//		const dailyDiff = day.Close - day.Open
//		const dailyPercentageIncrease = Math.round((dailyDiff / day.Open)*roundingPrecision)/roundingPrecision // ALSO ROUNDING
//		if(Math.abs(dailyPercentageIncrease)*100 >= sensitivity){
//			ratio *= 1 + dailyPercentageIncrease
//		}
//	})
//	ratio = Math.round(ratio*roundingPrecision)/roundingPrecision
//	return ratio // ALSO ROUNDING
//}
