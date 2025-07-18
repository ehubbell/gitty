import path from 'path';
import { defineConfig } from 'vite';
import { runSize } from 'vite-plugin-size';

export default defineConfig(({ mode }) => {
	return {
		base: './',
		build: {
			ssr: true,
			sourcemap: mode === 'development',
			lib: {
				entry: path.resolve(__dirname, 'src/index.ts'),
				name: 'Gitty',
				formats: ['es', 'cjs'],
			},
			rollupOptions: {
				external: [],
				output: {
					banner: '#!/usr/bin/env node',
				},
			},
		},
		plugins: [runSize()],
		resolve: {
			alias: {
				src: '/src',
			},
		},
	};
});
