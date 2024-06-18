const errorStyles = 'color: crimson';
const infoStyles = 'color: cadetblue';
const successStyles = 'color: aquamarine';

const mode = import.meta.env.MODE;

export const log = (title, ...data) => {
	if (mode == 'production') return;
	return console.log(title, ...data);
};

export const debug = (title, ...data) => {
	return console.debug(`%c${title}`, infoStyles, ...data);
};

export const info = (title, ...data) => {
	return console.info(`%c${title}`, successStyles, ...data);
};

export const warn = (title, ...data) => {
	return console.warn(`%c${title}`, errorStyles, ...data);
};

export const error = (title, ...data) => {
	return console.error(`%c${title}`, errorStyles, ...data);
};

// Docs:
// https://developer.mozilla.team/en-US/docs/Web/API/Console
// https://betterstack.com/docs/logs/javascript/install/
