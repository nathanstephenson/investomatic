import { round } from "./utils"

const DECIMAL_PLACES: number = 3

export class Ticker {
	private name: string
	private rating: number

	constructor(name: string, rating: number = 1) {
		this.name = name
		this.rating = rating
	}

	getName() : string {
		return this.name
	}

	getRating() : number {
		return this.rating
	}

	setRating(rating: number) : Ticker {
		this.rating = rating
		return this
	}

	multiplyRating(multiplier: number) : Ticker {
		this.rating *= multiplier
		return this
	}
}

export class TickerHistory extends Ticker {
	private lastUpdated: Date
	private averageDaysBetweenUpdates: number
	private updateCount: number

	constructor(name: string, rating:number, lastUpdated: Date, averageDaysBetweenUpdates: number) {
		super(name, rating)
		this.lastUpdated = lastUpdated
		this.averageDaysBetweenUpdates = averageDaysBetweenUpdates
		this.updateCount = 0
	}

	getLastUpdated() : Date {
		return this.lastUpdated
	}

	setLastUpdated(lastUpdated: Date) : void {
		this.updateCount += 1
		const oldAverageInterval = this.getAverageDaysBetweenUpdates()
		const currentInterval = (lastUpdated.getMilliseconds() - this.getLastUpdated().getMilliseconds())/(1000*60*60*24)
		this.averageDaysBetweenUpdates = round((currentInterval + oldAverageInterval) / this.getUpdateCount(), DECIMAL_PLACES)
		this.lastUpdated = lastUpdated
	}
	
	getAverageDaysBetweenUpdates() : number {
		return this.averageDaysBetweenUpdates
	}

	getUpdateCount() : number {
		return this.updateCount
	}
}

export class User {
	private name: string
	private rating: number

	constructor(name: string, rating: number = 0) {
		this.name = name
		this.rating = rating
	}

	getName() : string {
		return this.name
	}

	getRating() : number {
		return this.rating
	}

	setRating(rating: number) : User {
		this.rating = rating
		return this
	}
}

export class TwitterUser extends User {
	private username: string

	constructor(name: string, username: string, rating: number) {
		super(name, rating)
		this.username = username
	}

	getUsername() : string {
		return this.username
	}
}
