import { AlphaVantageAPI, DailyBar } from "alpha-vantage-cli"
import { Ticker } from "../../classes"
import { alphaVantageAPIKey } from "../../secrets"
import { asyncForEach } from "../../utils"
import { marshallHistoryFile, unmarshallHistoryFile } from "./history/history"

const market = new AlphaVantageAPI(alphaVantageAPIKey, "compact", false)
const sensitivity = 5 // PERCENTAGE DIFFERENCE BETWEEN OPEN/CLOSE FOR A DAY'S DATA TO IMPACT THE SCORE OF A STOCK

// TODO: 
// - STORE HISTORY SO FEWER LOOKUPS CAN BE MADE AND SO DATA CAN BE PRELOADED
//   - STORE LAST DATE CHECKED IN HISTORY
//   - KEEP TRACK OF AVERAGE NUMBER OF DAYS BEING USED FOR DATA EACH TIME HISTORY IS COLLECTED
// - FIND THE BEST WAY TO STORE HISTORY (TEXT FILE, OR LIGHTWEIGHT LOCAL DB?) - currently just using csv
// - FIGURE OUT HOW TO USE TRENDS TO MAKE PREDICTIONS
// - USE HIGH-PERFORMING TICKERS TO LOOK FOR MORE THAT MIGHT ALSO DO WELL (E.G. SAME INDUSTRY)// Array of tickers

// const tickers = ['AAPL', 'GOOGL', 'MSFT'];

// // Function to retrieve stock history for an array of tickers
// async function getStockHistory(tickers: string[]): Promise<any[]> {
// 	const stockHistory: any[] = [];
// 	const alphaVantage = new AlphaVantageAPI(alphaVantageAPIKey, "compact", false);
// 	for (const ticker of tickers) {
// 		// Retrieve stock history using Alpha Vantage API
// 		const response = await alphaVantage.getIntradayData(ticker, '5min');
// 		stockHistory.push({ ticker, stockData: response });
// 	}
// 	return stockHistory;
// }
  
//   // Call the function and log the results
//   getStockHistory(tickers)
// 	.then(stockHistory => {
// 		console.log('Stock History:');
// 		console.log(stockHistory);
// 	})
// 	.catch(error => {
// 		console.error('Error retrieving stock history:', error);
// 	});


export async function getHistoricScores(stocks: string[] | undefined) : Promise<Ticker[]>{
	const scores: Ticker[] = unmarshallHistoryFile()

	if (stocks == undefined) {
		return scores
	}
	
	await asyncForEach(stocks, async (stock: string) => {
		const ticker = new Ticker(stock)

		const data = await market.getDailyData(stock).catch(e => console.log(e))
		
		let tickerRating = 1;

		if(data){
			tickerRating = getAverageDailyRatio(data)
			console.log("market/index.ts | " + stock, tickerRating)
		}

		ticker.setRating(tickerRating)
		scores.push(ticker)
	})

	marshallHistoryFile(scores)
	
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
