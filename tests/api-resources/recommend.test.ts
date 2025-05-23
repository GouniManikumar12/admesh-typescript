// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Admesh from 'admesh';

const client = new Admesh({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource recommend', () => {
  // skipped: tests are disabled for the time being
  test.skip('getRecommendations: only required params', async () => {
    const responsePromise = client.recommend.getRecommendations({
      query: 'Best CRM for remote teams',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // skipped: tests are disabled for the time being
  test.skip('getRecommendations: required and optional params', async () => {
    const response = await client.recommend.getRecommendations({
      query: 'Best CRM for remote teams',
      format: 'auto',
      previous_query: 'previous_query',
      previous_summary: 'summary of previous recommendation',
      session_id: 'session_id',
    });

    // Example of accessing the response
    if (response.response?.recommendations) {
      for (const rec of response.response.recommendations) {
        console.log(`Title: ${rec.title}`);
        console.log(`Reason: ${rec.reason}`);
        console.log(`Link: ${rec.admesh_link}`);
      }
    }
  });
});
