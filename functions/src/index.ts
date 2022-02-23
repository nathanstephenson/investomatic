import * as functions from "firebase-functions"
import { Configuration, OpenAIApi } from "openai"
import Alpaca from "@alpacahq/alpaca-trade-api"

import { openAiAPIKey, alpacaAPIKey, alpacaKeyID } from "./secrets"

import { scrape as twitterScrape } from "./sources/twitter"

const configuration = new Configuration({
	apiKey: openAiAPIKey
})

const openAI = new OpenAIApi(configuration)

const alpaca = new Alpaca({
	keyId: alpacaKeyID,
	secretKey: alpacaAPIKey,
	paper: true
})

export const helloWorld = functions.https.onRequest(async (request, response) => {

	const tweets = await twitterScrape()

	console.log("got tweets")

	const gptCompletion = await openAI.createCompletion('text-ada-001', {
		prompt: `${tweets} I'm thinking of buying the following stock tickers: `,
		temperature: 0.7,
		max_tokens: 32,
		top_p: 1,
		frequency_penalty: 0,
		presence_penalty: 0
	})

	console.log("got response from openai")

	const choices = gptCompletion.data.choices
	
	if (choices != undefined && choices != null && choices[0] != undefined && choices[0] != null) {
		const stocksToBuy = choices[0].text?.match(/\b[A-Z]+\b/g)

		console.log("got stocks to buy: " + stocksToBuy)

		const account = await alpaca.getAccount().catch((error: unknown) => response.send(error))

		console.log("got alpaca account")
	
		if (stocksToBuy != undefined && stocksToBuy != null) {
			const order = await alpaca.createOrder({
				symbol: stocksToBuy[Math.floor(Math.random() * stocksToBuy?.length)],
				notional: account.buying_power * 0.1,
				side: 'buy',
				type: 'market',
				time_in_force: 'day'
			})

			console.log("created order")
		
			response.send(order);
		} else {
			response.send("no stocks to buy")
		}
	} else {
		response.send("choices empty")
	}
});
