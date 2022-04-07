import PostgresDatabase from './PostgresDatabase';
//const jest = require("jest");

const db = new PostgresDatabase();

describe('postgres wrapper class - integration test', () => {
	const key = 'sampleKey';
	const val = { object: 1 };

	test('connect to db', async () => {
		expect(await db.connect()).toBeTruthy();
	});

	test('insert 5 min cache value', async () => {
		expect(await db.set(key, val, +360)).toBe(1);
	});

	test('retrieve 5 min cached value', async () => {
		expect(await db.get(key)).toMatchObject(val);
	});

	test('replace with expired cache value', async () => {
		expect(await db.set(key, val, -360)).toBe(1);
	});

	test('retrieve expired cache value', async () => {
		expect(await db.get(key)).toBe(false);
	});

	test('retrieve nonexistant value', async () => {
		expect(await db.get('no')).toBe(false);
	});

	test('insert expired cache value', async () => {
		expect(await db.set(key, val, -360)).toBe(1);
	});

	test('clean cache', async () => {
		expect(await db.clean()).toBe(1);
	});
});
