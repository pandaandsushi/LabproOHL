/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['class', '[data-theme="dark"]'],
	theme: {
		extend: {}
	},
	daisyui: {
		themes: ['light', 'dark']
	},
	plugins: [require('daisyui')]
};
