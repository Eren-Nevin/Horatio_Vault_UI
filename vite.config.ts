// import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig } from 'vite';
// import basicSsl from '@vitejs/plugin-basic-ssl'
//
// export default defineConfig({
// 	plugins: [sveltekit(), basicSsl()]
// });

import basicSsl from '@vitejs/plugin-basic-ssl'
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	console.log(mode)
	process.env.mode = mode
	return {
		server: {
			host: '0.0.0.0',
			port: 4002,
		},
		preview: {
			host: '0.0.0.0',
			port: 4002,
		},
		plugins: [
			...(["development"].includes(mode) ? [basicSsl()] : []),
			tailwindcss(),
			sveltekit()
		]
	}
});

