import SQLiteDatabase from "./SQLiteDatabase";
//const jest = require("jest");

const db = new SQLiteDatabase();

describe('sqlite wrapper class', () => {
	
	const key = "sampleKey";
	const val = {'object': 1};
	
	test('connect to db', () => {
		expect(db.connect()).toBeTruthy();
	});
	
	test('insert 5 min cache value', () => {
		expect(db.set(key,val,SQLiteDatabase.unixTime()+360)).toBe(1);
	});
	
	
	test('retrieve 5 min cached value', () => {
		expect(db.get(key)).toMatchObject(val);
	});
	
	
	test('replace with expired cache value', () => {
		expect(db.set(key,val,SQLiteDatabase.unixTime()-360)).toBe(1);
	});
	
	
	test('retrieve expired cache value', () => {
		expect(db.get(key)).toBe(false);
	});
	
	
	test('retrieve nonexistant value', () => {
		expect(db.get("no")).toBe(false);
	});
	
	/*
	test('insert cached value', () => {
		expect();
	});
	*/
	/*
	test('insert cached value', () => {
		expect();
	});
	*/
});
