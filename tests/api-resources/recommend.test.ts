// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Admesh from 'admesh';

const client = new Admesh({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource recommend', () => {
  // skipped: tests are disabled for the time being
  test.skip('getRecommendations: only required params', async () => {
    const responsePromise = client.recommend.getRecommendations({ query: 'Best CRM for remote teams' });
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
      followup_suggestions: 'followup_suggestions',
      intent_summary: 'User just had a meeting about OKRs and needs a task management tool.',
      model: 'mistralai/mistral-7b-instruct',
      previous_query: 'previous_query',
      session_id: 'session_id',
      summary: 'summary',
      user_id: 'user_id',
    });
  });
});
