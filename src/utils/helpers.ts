export const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatName = url => {
	const paths = url.split('?')[0].split('#')[0].split('/');
	const name = url.split('/')[paths.length - 1];
	return name.split('.')[0];
};

// Docs
// https://fakerjs.dev/guide/
// https://www.npmjs.com/package/pluralize
