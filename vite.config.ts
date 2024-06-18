const path = require('path');
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	base: './',
	plugins: [react()],
	build: {
		sourcemap: true,
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'playbooksTransfer',
			formats: ['es', 'cjs', 'umd', 'iife'],
			fileName: format => `index.${format}.js`,
		},
		rollupOptions: {
			external: [],
		},
	},
	resolve: {
		alias: {
			src: '/src',
		},
	},
});
