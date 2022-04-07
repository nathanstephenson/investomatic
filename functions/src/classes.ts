export class Ticker {
	name: string
	rating: number

	constructor(name: string) {
		this.name = name
		this.rating = 1
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

export class User {
	name: string
	rating: number

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
	username: string

	constructor(name: string, username: string, rating: number) {
		super(name, rating)
		this.username = username
	}
}
