
const path = './src/commands/';// require("path").join(__dirname, "src", "commands");
const commandList: any[] = [];

require('fs').readdirSync(path).forEach((command: string) => {
	const [commandName, ts] = command.split(".");
	if (ts !== "ts" || commandName == "index") return;

	commandList[commandName] = require("./" + commandName);
	console.log(commandName, "loaded");
});

export const Commands = commandList;
