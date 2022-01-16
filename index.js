import { Router } from 'itty-router';
import { customAlphabet } from 'nanoid';

const router = Router();
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  6,
);

router.post('/shorten', async request => {
  let slug = nanoid();
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

  if (link) {
    return new Response(null, {
      headers: { Location: link },
      status: 301,
    });
  } else {
    return new Response('URL not found', {
      status: 404,
    });
  }
});


addEventListener('fetch', event => {
  event.respondWith(router.handle(event.request))
})
