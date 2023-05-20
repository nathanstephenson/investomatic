export default class TestError extends Error {
	constructor(message: string, testName: string) {
		super(message)
		console.log("Test ", testName, " failed")
	}
}
