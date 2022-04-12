enum MatchOn {
	TOKEN,
	MESSAGE,
}

class Command {
	constructor() {
		return;
	}
	public init = () => {
		return;
	};
	public static matchOn = new Map([
		[MatchOn.TOKEN, /^(?<DummyTokenCommand>[!$%](\S*))$/gm],
		[MatchOn.MESSAGE, /^(?<DummyMessageCommand>[!$%](\S*))$/gm],
	]);
}
// for static member

export { Command, MatchOn };
