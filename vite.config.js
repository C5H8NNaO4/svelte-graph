import { sveltekit } from '@sveltejs/kit/vite';
import localtunnel from 'vite-plugin-localtunnel';

/** @type {import('vite').UserConfig} */
const config = {
	https: true,
	plugins: [
		sveltekit(),
		localtunnel({
			subdomain: null // set or set null for a random subdomain
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
};

export default config;
