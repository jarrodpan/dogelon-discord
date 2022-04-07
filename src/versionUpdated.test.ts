/* eslint-disable @typescript-eslint/no-array-constructor */
/* eslint-disable @typescript-eslint/no-var-requires */
import jest from 'jest';

//https://simplernerd.com/js-console-colors/

const pkgVer: string = require('../package.json').version;
const pkgLockVer: string = require('../package-lock.json').version;

const readme: string = require('fs').readFileSync('./README.md').toString();
const latestChange = readme
	.match(/# Changelog[\S\s]*?(?:###[\S\s]*?){1,3}## /)
	?.toString()
	.replace(/\r/gm, '')
	.split(/\n/gm); // chaotic regex to extract the latest change in the changelog

let changelogVer, changelogDate, tagLinkVer, tagVer;

// extract all the junk
latestChange?.forEach((line) => {
	if (line == '# Changelog' || line.length == 0) return;
	if (line.startsWith('## ') && line.length > 3)
		(changelogVer = line.slice(line.indexOf('[') + 1, line.indexOf(']'))) &&
			(changelogDate = line.slice(line.lastIndexOf(' ') + 1));
	if (line.startsWith('['))
		(tagLinkVer = line.slice(1, line.indexOf(']'))) &&
			(tagVer = line.slice(line.indexOf('tag/v') + 5));

	//if (line.substring(0, 5).includes('-')) changed[state].push(line);
});

describe.each([
	[pkgVer, pkgLockVer, 'package version matches package-lock version'],
	[pkgVer, changelogVer, 'package version matches changelog version'],
	[pkgVer, tagLinkVer, 'package version matches tag link version'],
	[pkgVer, tagVer, 'package version matches tag version'],
	[
		pkgLockVer,
		changelogVer,
		'package-lock version matches changelog version',
	],
	[pkgLockVer, tagLinkVer, 'package-lock version matches tag link version'],
	[pkgLockVer, tagVer, 'package-lock version matches tag version'],

	[changelogVer, tagLinkVer, 'changelog version matches tag link version'],
	[changelogVer, tagVer, 'changelog version matches tag version'],
	[tagLinkVer, tagVer, 'tag link version matches tag version'],
])('check package and changelong versions', (v1, v2, desc) => {
	it(desc, () => {
		expect(v1 === v2).toBe(true);
	});
});

describe.each([
	[pkgVer, 'package version is not development version'],
	[pkgLockVer, 'package-lock version is not development version'],
	[changelogVer, 'changelog version is not development version'],
	[tagLinkVer, 'tag link version is not development version'],
	[tagVer, 'tag version is not development version'],
])('check for development version', (ver: string, desc) => {
	it(desc, () => {
		expect(/-.*$/g.test(ver)).toBe(false);
	});
});

describe('changelog date', () => {
	it('changelog date is today', () => {
		//console.log(changelogDate);
		const dateObj = new Date();

		const day = dateObj.getDate().toString().padStart(2, '0');
		const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
		const year = dateObj.getFullYear().toString();

		const today = `${year}-${month}-${day}`;
		expect(changelogDate).toEqual(today);
	});
});

describe('previous minor version hidden', () => {
	const [major, minor, patch] = changelogVer
		.replace(/-.*$/g, '')
		.split('.')
		.map((x) => Number.parseInt(x));

	let latestPatch = patch;
	while (latestPatch > 0) {
		const prevPatch = latestPatch - 1;
		const current = `${major}.${minor}.${patch}`;
		const last = `${major}.${minor}.${prevPatch}`;
		const desc = `${current} is listed before ${last}`;
		it(desc, () => {
			const orderedCorrectly =
				readme.search(current) < readme.search(last);
			expect(orderedCorrectly).toBe(true);
		});
		latestPatch--;
	}

	const prevMinor = minor - 1;
	const lastMinor = `${major}.${prevMinor}.`;
	it(`${lastMinor}x is hidden behind accordian`, () => {
		const current = `${major}.${minor}.0`;
		const header = '# Previous Changes';
		const details = '<details>';
		const summary = '<summary>Click to expand</summary>';

		const a = readme.indexOf(current);
		const b = readme.indexOf(header, a);
		const c = readme.indexOf(details, b);
		const d = readme.indexOf(summary, c);
		const e = readme.indexOf(lastMinor, d);

		const orderedCorrectly = a < b && b < c && c < d && d < e;
		expect(orderedCorrectly).toBe(true);
	});
});
