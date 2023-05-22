import TestError from './TestError'
import * as utils from '../src/utils'

const CLASSNAME = "UtilsTest"

export function testUtils(): void{
	testRound()
	testGetLastWorkingDay()
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

function testGetLastWorkingDay(): void {
	console.log("Running 'testGetWorkingDay' from ", CLASSNAME)
	const testDate1 = new Date(2023, 4, 22)
	const testDate1Expected = new Date(2023, 4, 19).setHours(0,0,0,0) / 1000
	const testDate1Result = utils.getPreviousWorkingDayTimestamp(testDate1)
	if(testDate1Expected !== testDate1Result){
		throw new TestError(`Working day calc off, expected ${testDate1Expected} but got ${testDate1Result}`, "testGetWorkingDay")
	}
	const testDate2 = new Date(2023, 0, 1)
	const testDate2Expected = new Date(2022, 11, 30).setHours(0,0,0,0) / 1000
	const testDate2Result = utils.getPreviousWorkingDayTimestamp(testDate2)
	if(testDate1Expected !== testDate1Result){
		throw new TestError(`Working day calc off, expected ${testDate2Expected} but got ${testDate2Result}`, "testGetWorkingDay")
	}
}
