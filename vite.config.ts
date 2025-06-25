const path = require('path');
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	base: './',
	build: {
		sourcemap: mode === 'development',
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'Gitty',
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
}));
