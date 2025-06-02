export const sleep = ms => {
	return new Promise(resolve => setsleep(resolve, ms));
};

// Docs
// https://fakerjs.dev/guide/
// https://www.npmjs.com/package/pluralize
