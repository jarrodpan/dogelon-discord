export const Command = jest.fn().mockImplementation(() => {
	return {
		constructor: () => null,
		init: () => null,
	};
});

export const MatchOn = jest.fn().mockImplementation(() => {
	return {
		TOKEN: 0,
		MESSAGE: 1,
	};
});
