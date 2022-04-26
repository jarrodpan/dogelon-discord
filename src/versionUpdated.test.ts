/* eslint-disable @typescript-eslint/no-array-constructor */
/* eslint-disable @typescript-eslint/no-var-requires */
//https://simplernerd.com/js-console-colors/

const prerelease = process.env.PRERELEASE ? true : false;
//console.log(prerelease);
const pkgVer: string = require('../package.json').version;
const [pkgLockVer, pkgLockVer2] = [
	require('../package-lock.json').version,
	require('../package-lock.json').packages[''].version,
];

const readme: string = require('fs').readFileSync('./README.md').toString();
const latestChange = readme
	.match(/# Changelog[\S\s]*?(?:###[\S\s]*?){1,3}## /)
	?.toString()
	.replace(/\r/gm, '')
	.split(/\n/gm); // chaotic regex to extract the latest change in the changelog

const ifit = (cond) => (cond ? it : it.skip);

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
	[pkgVer, pkgLockVer2, 'package version matches package-lock version(2)'],
	[pkgVer, changelogVer, 'package version matches changelog version'],
	[pkgVer, tagLinkVer, 'package version matches tag link version'],
	[pkgVer, tagVer, 'package version matches tag version'],
	[
		pkgLockVer,
		pkgLockVer2,
		'package-lock version matches package-lock version(2)',
	],
	[
		pkgLockVer,
		changelogVer,
		'package-lock version matches changelog version',
	],
	[pkgLockVer, tagLinkVer, 'package-lock version matches tag link version'],
	[pkgLockVer, tagVer, 'package-lock version matches tag version'],

	[
		changelogVer,
		pkgLockVer2,
		'changelog version matches package-lock version(2)',
	],
	[changelogVer, tagLinkVer, 'changelog version matches tag link version'],
	[changelogVer, tagVer, 'changelog version matches tag version'],
	[
		tagLinkVer,
		pkgLockVer2,
		'tag link version matches package-lock version(2)',
	],
	[tagLinkVer, tagVer, 'tag link version matches tag version'],
	[tagVer, pkgLockVer2, 'tag version matches package-lock version(2)'],
])('check package and changelong versions', (v1, v2, desc) => {
	it(desc, () => {
		expect(v1).toEqual(v2);
	});
});

describe.each([
	[pkgVer, 'package version is not development version'],
	[pkgLockVer, 'package-lock version is not development version'],
	[changelogVer, 'changelog version is not development version'],
	[tagLinkVer, 'tag link version is not development version'],
	[tagVer, 'tag version is not development version'],
])('check for development version', (ver: string, desc) => {
	ifit(prerelease)(desc, () => {
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

describe('previous version formatting', () => {
	const [nonalpha, alpha] = changelogVer.split('-');
	const [major, minor, patch] = nonalpha
		.split('.')
		.map((x) => Number.parseInt(x));

	const changelogStart = readme.indexOf('# Changelog');

	//ifit(alpha?.length > 0 || !prerelease)(
	const not = prerelease ? 'not ' : '';
	it(`development version is ${not}listed first`, () => {
		const a = readme.indexOf(changelogVer, changelogStart);
		const b =
			patch > 0
				? readme.indexOf(`${major}.${minor}.${patch - 1}`, a)
				: readme.indexOf('# Previous Changes', a);
		const orderedCorrectly = a < b;
		expect(orderedCorrectly).toBe(true);
	});

	let latestPatch = patch;
	while (latestPatch > 0) {
		const prevPatch = latestPatch - 1;
		const current = `${major}.${minor}.${patch}`;
		const last = `${major}.${minor}.${prevPatch}`;
		const desc = `${current} is listed before ${last}`;
		it(desc, () => {
			const orderedCorrectly =
				readme.indexOf(current, changelogStart) <
				readme.indexOf(last, changelogStart);
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

		const a = readme.indexOf(current, changelogStart);
		const b = readme.indexOf(header, a);
		const c = readme.indexOf(details, b);
		const d = readme.indexOf(summary, c);
		const e = readme.indexOf(lastMinor, d);

		const orderedCorrectly = a < b && b < c && c < d && d < e;
		expect(orderedCorrectly).toBe(true);
	});
});
