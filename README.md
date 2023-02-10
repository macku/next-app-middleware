# next-app-middleware

This next.js extension allows for middleware to live in the app directory. The extension will bundle all special middleware files in the app directory into a single middleware.ts file in your project root.

## setup

### install

### clean up current middleware and git working tree

- delete your current middleware (or change the name if you want to keep it)
- commit your repository
- add `/middleware.ts` to your .gitignore (include the `/` to not exclude any `middleware.ts` files in your `app` directory)

### next.config.js

```js
const { withMiddleware } = require("next-app-middleware");

const nextConfig = {
  experimental: {
    appDir: true,
  },
};

module.exports = withMiddleware(nextConfig);
```

## file conventions

unless stated otherwise can be in any segment of the app directory.

### middleware.{ts,js}

Middlewares will be called first when a request reaches its segment. A `MiddlewareHandlerResult` can be returned to intercept the request and stop the handler chain early. If the middleware returns `void` execution continues normally.

```ts
const middleware: MiddlewareHandler = (req, res) => {
  let visitor_id = req.cookies.get("visitor_id")?.value;
  if (!visitor_id) {
    visitor_id = crypto.randomUUID();
    res.cookies.set("visitor_id", visitor_id);
  }
  req.waitUntil(trackVisit(visitor_id, req));
};

export default middleware;
```

### forward.dynamic.{ts,js}

Define internal path rewrites in this file. Export named functions that indicate what parameter will be rewritten. Used to forwar [dyanmic] segments.

```
/app/
  - [locale]
    - page.tsx
  - forward.dynamic.ts
```

```ts
// app/forward.dynamic.ts
export const locale = () => {
  return "en";
};
```

In this example the forward.dynamic.ts file declares a locale rewrite. This setup will result in the final middleware to consider any external request to `/` a request to `/[locale]` and will block all direct external requests to `/[locale]`

### forward.static.{ts,js}

Define internal path rewrites in this file. Export named functions that indicate what parameter will be rewritten. Used to forwar static segments.

```
/app/
  - hosted
    - page.tsx
  - forward.static.ts
```

```ts
// app/forward.static.ts
export const hosted = () => {
  return true;
};
```

In this example the forward.static.ts file declares a hosted rewrite. This setup will result in the final middleware to consider any external request to `/` a request to `/hosted` and will block all direct external requests to `/hosted`

### external.{ts,js}

An external.ts file allows routing traffic to other applications:

```ts
export const origin = "https://example.com";

export default origin;
```

### rewrite.{ts,js}

A rewrite.ts file indicates to the framework that the directory is an external path. The rewrite handler will receive the same arguments as a middleware handler would but can optionally return the final location the request will be routed to.

### redirect.{ts,js}

Similar to rewrite.ts but results in a redirect instead of a rewrite

```ts
/**
 * both rewrites and redirects can co-exist with pages and can
 * dynamically choose to not perform any action and continue matching.
 * Priority: rewrite > redirect > page
 */

// /app/rewrite.ts
const rewrite: RewriteHandler = (req) => {
  if (req.cookies.get("rewrite")?.value === "true") return "/rewritten";
};

// /app/page.tsx
export default () => {
  return <></>;
};

export default rewrite;

/**
 * since there is both a rewrite and a page in the same directory
 * any request that does not have the `rewrite` cookie set to `true`
 * will fall through to the page file while the ones that do have the
 * cookie set will be rewritten to `/rewritten`
 * Note: if `void` is returned and no futher handler exist a `MatchingError`
 * is thrown.
 */
```

### middleware.hooks.{ts,js}

A collection of hooks that can be used to extend the middleware lifecylce. Unlike the others, this file has to be in the root of your project instead of the app directory.

#### notFound

This hook will be invoked if the middleware recieved a request that did not match any external page paths:

```ts
export const notFound: NotFoundHook = () => {
  // most hooks can return a NextResponse to override default behaviour
  return NextResponse(null, { status: 404 });
};
```

#### redirect

This hook will be invoked when a middleware returned a redirect response or a redirect file redirected the response:

```ts
export const redirect: RedirectHook = (_req, _res, destination, status) => {
  console.log(
    `Redirecting to ${destination} with status ${status)`
  );
}
```

#### rewrite

This hook will be invoked when a middleware returned a rewrite response or a rewrite file redirected the response:

```ts
export const rewrite: RewriteHook = (_req, _res, destination) => {
  console.log(`Rewriting to ${destination}`);
};
```

#### json

This hook will be invoked when a middleware resolved with a json response:

```ts
export const json: JsonHook = (_req, _res, data) => {
  return new NextResponse(yaml.stringfy(data), {
    headers: {
      "content-type": "application/x-yaml",
    },
  });
};
```

#### params

This hook can be used to override the path params before the final path is created:

```ts
export const params: ParamsHook = (params) => {
  if (params.test) {
    params.test = "override";
  }
  return params;
};
```

#### response

This hook will receive the final response and does not allow for editing it, it will be executed in the `waitUntil` method of the `NextFetchEvent`:

```ts
export const response: ResponseHook = (response) => {
  // collect metrics in here
};
```

#### error

Invoked when an error happens during matching or handler execution:

```ts
export const error: ErrorHook = (req, res, err) => {
  console.error(err);
  // the error will be re-thrown if this hook does not return a response,
  // causing a 500 response by default, if a response is returned, request
  // processing continues
  return new NextResponse(null, { status: 500 });
};
```
