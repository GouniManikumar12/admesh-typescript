// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';
import { NoRecommendationsError } from '../core/error';

export class Recommend extends APIResource {
  /**
   * Get monetized product/tool recommendations
   *
   * @param body - The request parameters
   * @param options - Additional request options
   * @returns A promise that resolves to the recommendation response
   * @throws NoRecommendationsError if no recommendations are available and raiseOnEmptyRecommendations is true
   *
   * @example
   * ```ts
   * const response = await client.recommend.getRecommendations({
   *   query: 'Best CRM for remote teams',
   *   format: 'auto',
   * });
   * ```
   */
  getRecommendations(
    body: RecommendGetRecommendationsParams,
    options?: RequestOptions,
  ): APIPromise<RecommendGetRecommendationsResponse> {
    const { raiseOnEmptyRecommendations = true, ...restBody } = body;

    return this._client.post('/agent/recommend', { body: restBody, ...options }).then((response) => {
      // Check if recommendations are empty or null
      if (
        raiseOnEmptyRecommendations &&
        (!response.response ||
          !response.response.recommendations ||
          response.response.recommendations.length === 0)
      ) {
        throw new NoRecommendationsError({ message: `No recommendations available for query: ${body.query}` });
      }

      return response;
    });
  }
}

export interface RecommendGetRecommendationsResponse {
  intent?: RecommendGetRecommendationsResponse.Intent;

  response?: RecommendGetRecommendationsResponse.Response;

  tokens_used?: number;

  model_used?: string;

  recommendation_id?: string;

  session_id?: string;

  end_of_session?: boolean;
}

export namespace RecommendGetRecommendationsResponse {
  export interface Intent {
    categories?: Array<string>;

    goal?: string;

    llm_intent_confidence_score?: number;

    known_mentions?: Array<string>;

    intent_type?: string;

    intent_group?: string;

    tags?: Array<string>;
  }

  export interface FollowupSuggestion {
    label?: string;

    query?: string;

    product_mentions?: Array<string>;

    admesh_links?: Record<string, string>;

    session_id?: string;
  }

  export interface Response {
    summary?: string;

    recommendations?: Array<Response.Recommendation>;

    followup_suggestions?: Array<FollowupSuggestion>;
  }

  export namespace Response {
    export interface Recommendation {
      ad_id: string;

      admesh_link: string;

      product_id: string;

      reason: string;

      title: string;

      intent_match_score?: number;

      features?: Array<string>;

      has_free_tier?: boolean;

      integrations?: Array<string>;

      pricing?: string;

      redirect_url?: string;

      reviews_summary?: string;

      reward_note?: string | null;

      security?: Array<string>;

      slug?: string;

      support?: Array<string>;

      trial_days?: number;

      url?: string;
    }
  }
}

export interface RecommendGetRecommendationsParams {
  query: string;

  format?: string | null;

  previous_query?: string | null;

  previous_summary?: string | null;

  session_id?: string | null;

  /**
   * Whether to raise a NoRecommendationsError when no recommendations are available.
   * @default true
   */
  raiseOnEmptyRecommendations?: boolean;
}

export declare namespace Recommend {
  export {
    type RecommendGetRecommendationsResponse as RecommendGetRecommendationsResponse,
    type RecommendGetRecommendationsParams as RecommendGetRecommendationsParams,
  };
}
