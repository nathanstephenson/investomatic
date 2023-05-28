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
