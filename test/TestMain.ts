import { testUtils } from './UtilsTest'

export default function testAll(): void {
	try {
		testUtils()
	} catch(e) {
		console.log(e)
	}
}
