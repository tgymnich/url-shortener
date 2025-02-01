import { Router } from 'itty-router';
import { customAlphabet } from 'nanoid'
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

const assetManifest = JSON.parse(manifestJSON);
const router = Router();
const nanoid = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  6,
);
const byteSize = str => new Blob([str]).size;

export default {
  async fetch(request, env, ctx) {
    router.post('/shorten', async req => {
      let slug = nanoid();
      let requestBody = await req.json();
      if ('url' in requestBody) {
        await env.SHORTEN.put(slug, requestBody.url);
        let shortenedURL = `${new URL(req.url).origin}/${slug}`;
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
    
    router.get('/:slug', async req => {
      let link = await env.SHORTEN.get(req.params.slug);
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

    let requestUrl = new URL(request.url);
    if (requestUrl.pathname === '/' || requestUrl.pathname.includes('static')) {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        },
      );
    } else {
      return await router.handle(request, env, ctx);
    }
  },
};