import TestError from './TestError'
import * as utils from '../src/utils'

const CLASSNAME = "UtilsTest"

export function testUtils(): void{
	testRound()	
}

function testRound(): void {
	console.log("Running 'testRound' from ", CLASSNAME)
	const numberToRound: number = 28.1234
	const roundedNumber: number = utils.round(numberToRound, 2)
	const expectedNumber: number = 28.12
	if(roundedNumber !== expectedNumber){
		throw new TestError(`Rounding off, expected ${expectedNumber} but got ${roundedNumber}`, "testRound")
	}
}
