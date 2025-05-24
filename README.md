# Admesh TypeScript API Library

[![NPM version](https://img.shields.io/npm/v/admesh.svg)](https://npmjs.org/package/admesh) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/admesh)

This library provides convenient access to the Admesh REST API from server-side TypeScript or JavaScript.

The full API of this library can be found in [api.md](api.md).

## Installation

```sh
npm install admesh
```

## Getting an API Key

To use the AdMesh API, you'll need an API key:

1. Create an account at [https://useadmesh.com/agent](https://useadmesh.com/agent) if you don't have one
2. Once registered, you can obtain your API key from the dashboard
3. Use this API key in your application as shown in the examples below

## Usage

<!-- prettier-ignore -->
```js
import Admesh from 'admesh';

const client = new Admesh({
  apiKey: process.env['ADMESH_API_KEY'], // This is the default and can be omitted
});

async function main() {
  const response = await client.recommend.getRecommendations({
    query: 'Best CRM for remote teams',
    format: 'auto',
  });

  console.log(response.recommendation_id);

  // Access recommendations
  response.response?.recommendations?.forEach(rec => {
    console.log(`Title: ${rec.title}`);
    console.log(`Reason: ${rec.reason}`);
    console.log(`Link: ${rec.admesh_link}`);
  });
}

main();
```

There are several ways to provide your API key:

1. **Direct parameter**: Pass it directly as shown above with the `apiKey` parameter
2. **Environment variable**: Set the `ADMESH_API_KEY` environment variable

```js
// Using environment variables (recommended)
// Set ADMESH_API_KEY in your environment
const client = new Admesh(); // No need to specify apiKey, it's loaded from environment

// For Node.js, you can use dotenv to load from a .env file
// npm install dotenv
require('dotenv').config(); // Load API key from .env file
// Create a .env file with: ADMESH_API_KEY=your_api_key_here
const client = new Admesh();
```

Using environment variables is recommended to keep your API key secure and out of source control.

### Request & Response types

This library includes TypeScript definitions for all request params and response fields. You may import and use them like so:

<!-- prettier-ignore -->
```ts
import Admesh from 'admesh';

const client = new Admesh({
  apiKey: process.env['ADMESH_API_KEY'], // This is the default and can be omitted
});

async function main() {
  const params: Admesh.RecommendGetRecommendationsParams = {
    query: 'Best CRM for remote teams',
    format: 'auto',
  };
  const response: Admesh.RecommendGetRecommendationsResponse = await client.recommend.getRecommendations(
    params,
  );

  // Access recommendations with type safety
  response.response?.recommendations?.forEach(rec => {
    console.log(`Title: ${rec.title}`);
    console.log(`Reason: ${rec.reason}`);
    console.log(`Link: ${rec.admesh_link}`);
  });
}

main();
```

Documentation for each method, request param, and response field are available in docstrings and will appear on hover in most modern editors.

## Handling errors

When the library is unable to connect to the API,
or if the API returns a non-success status code (i.e., 4xx or 5xx response),
a subclass of `APIError` will be thrown:

<!-- prettier-ignore -->
```ts
async function main() {
  const response = await client.recommend
    .getRecommendations({
      query: 'Best CRM for remote teams',
      format: 'auto',
      // Set to false if you want to handle empty recommendations yourself
      raiseOnEmptyRecommendations: true,
    })
    .catch(async (err) => {
      if (err instanceof Admesh.NoRecommendationsError) {
        console.log(err.name); // NoRecommendationsError
        console.log(err.message); // No recommendations available for query: Best CRM for remote teams
        // Handle the case where no recommendations are available
        // For example, you might want to suggest alternative queries
      } else if (err instanceof Admesh.APIError) {
        console.log(err.status); // 400
        console.log(err.name); // BadRequestError
        console.log(err.headers); // {server: 'nginx', ...}
      } else {
        throw err;
      }
    });
}

main();
```

Error codes are as follows:

| Status Code | Error Type                 |
| ----------- | -------------------------- |
| 400         | `BadRequestError`          |
| 401         | `AuthenticationError`      |
| 403         | `PermissionDeniedError`    |
| 404         | `NotFoundError`            |
| 422         | `UnprocessableEntityError` |
| 429         | `RateLimitError`           |
| >=500       | `InternalServerError`      |
| N/A         | `APIConnectionError`       |
| N/A         | `NoRecommendationsError`   |

## Requirements

TypeScript >= 4.9 is supported.

The following runtimes are supported:

- Web browsers (Up-to-date Chrome, Firefox, Safari, Edge, and more)
- Node.js 20 LTS or later
- Deno v1.28.0 or higher
- Bun 1.0 or later
- Cloudflare Workers
- Vercel Edge Runtime

## Support

We are keen for your feedback; please open an [issue](https://www.github.com/GouniManikumar12/admesh-typescript/issues) with questions, bugs, or suggestions.
