const path = require('path');
import { defineConfig } from 'vite';

export default defineConfig({
	base: './',
	build: {
		sourcemap: true,
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'gitdl',
			formats: ['es', 'cjs'],
			fileName: format => `index.${format}.js`,
		},
		rollupOptions: {
			external: [],
			output: {
				banner: '#!/usr/bin/env node',
			},
		},
	},
	resolve: {
		alias: {
			src: '/src',
		},
	},
});
