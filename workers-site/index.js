import { Router } from 'itty-router';
import { customAlphabet } from 'nanoid/async';
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

const router = Router();
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  6,
);
const byteSize = str => new Blob([str]).size;

router.post('/shorten', async request => {
  let slug = await nanoid();
  let requestBody = await request.json();
  if ('url' in requestBody) {
    // Add slug to our KV store so it can be retrieved later:
    await SHORTEN.put(slug, requestBody.url);
    let shortenedURL = `${new URL(request.url).origin}/${slug}`;
    let responseBody = {
      message: 'Link shortened successfully',
      slug,
      url: shortenedURL,
    };
    return new Response(JSON.stringify(responseBody), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });
  } else {
    return new Response("Must provide a valid URL", { status: 400 });
  }
});

router.get('/:slug', async request => {
  let link = await SHORTEN.get(request.params.slug);
  let size = byteSize(link)

  if (link && size < 16000) {
    return Response.redirect(link);
  } else if (link) {
    let html = `<!DOCTYPE html>
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
    return new Response(html, { headers: { 'content-type': 'text/html;charset=UTF-8'}})
  } else {
    return new Response('URL not found', {
      status: 404,
    });
  }
});

async function handleEvent(event) {
  let requestUrl = new URL(event.request.url);
  if (requestUrl.pathname === '/' || requestUrl.pathname.includes('static')) {
    return await getAssetFromKV(event);
  } else {
    return await router.handle(event.request);
  }
}


addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});
