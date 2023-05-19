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

export async function getHistoricScores(stocks: {name: string, startDate: number}[]) : Promise<DailyTicker[][]>{
	const returnVals: DailyTicker[][] = []
	const today = new Date()
	today.setDate(new Date().getDate() - 1)
	const yesterday = today.setHours(0,0,0,0) / 1000
	console.log(`timestamp for up-to-date data:`, yesterday)
	await asyncForEach(stocks, async (stock: {name: string, startDate: number}) => {
		if (stock.startDate == yesterday) {
			console.log(`data for ${stock.name} up to date, skipping`)
			return
		}
		const data = await market.getDailyData(stock.name).catch(e => console.log(e))
		if(data){
			console.log("market/index.ts | " + stock.name)
			returnVals.push(data
				.filter(s => s.Timestamp.getTime() / 1000 > stock.startDate)
				.map(s => {
					return {
						name: stock.name,
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

