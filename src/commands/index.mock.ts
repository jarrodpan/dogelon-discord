export default jest.mock('./', () => {
	return {
		Command: jest.fn().mockImplementation(() => {
			return {
				init: () => null,
			};
		}),
		MatchOn: jest.fn().mockImplementation(() => {
			return {
				TOKEN: 0,
				MESSAGE: 1,
			};
		}),
	};
});
