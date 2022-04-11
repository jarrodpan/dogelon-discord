export type HelpPage = {
	command: string;
	message: HelpField[];
};
export type HelpField = {
	title: string;
	body: string;
};
