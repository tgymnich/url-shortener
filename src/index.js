import { Router, error, json, html } from 'itty-router';
import { customAlphabet } from 'nanoid'

const router = Router();
const nanoid = customAlphabet(
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	6,
);
const byteSize = str => new Blob([str]).size;

router.get('/', async (request, env) => {
	return await env.ASSETS.fetch(request);
});

router.get('/assets/*', async (request, env) => {
	return await env.ASSETS.fetch(request);
});

router.get('/stats', async (request, env) => {
	const kv = await env.SHORTEN.list();
	return json({ count: kv.keys.length })
});

router.post('/shorten', async (request, env) => {
	const slug = nanoid();
	const requestBody = await request.json();
	let url
	try {
		url = new URL(requestBody.url);
	} catch (error) {
		return error(400, "Invalid URL");
	}

	await env.SHORTEN.put(slug, url.toString());

	const shortenedURL = `${new URL(request.url).origin}/${slug}`;
	return json({
		// "message": 'Link shortened successfully',
		url: shortenedURL
	});
});

router.get('/:slug', async (request, env) => {
	if (request.params.slug.length != 6) {
		return error(400, "Invalid short link");
	}
	const link = await env.SHORTEN.get(request.params.slug);
	if (!link) {
		return error(404, "Short link not found");
	}

	if (byteSize(link) < 16000) {
		return Response.redirect(link);
	}

	const redirectHTML = `<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0 url=${link}">
    <script type="text/javascript">
            window.location.href = "${link}"
    </script>
    <title>Page Redirection</title>
  </head>
  <body>
    If you are not redirected automatically, follow this <a href="${link}">Redirect</a> link
  </body>
</html>`;

	return html(redirectHTML);
});

router.all('*', () => error(404))

export default {
	async fetch(request, env, ctx) {
		return await router.fetch(request, env).catch(error);
	}
};