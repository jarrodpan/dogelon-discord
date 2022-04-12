export const Command = jest.fn(() => {
	return {
		constructor: () => null,
		init: () => null,
		matchOn: new Map([
			[0, /^(?<DummyTokenCommand>[!$%](\/S*))$/],
			[1, /^(?<DummyMessageCommand>[!$%](\/S*))$/],
		]),
	};
});

export const MatchOn = jest.fn(() => {
	return {
		TOKEN: 0,
		MESSAGE: 1,
	};
});
