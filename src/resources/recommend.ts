// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../core/resource';
import { APIPromise } from '../core/api-promise';
import { RequestOptions } from '../internal/request-options';

export class Recommend extends APIResource {
  /**
   * Get monetized product/tool recommendations
   *
   * @example
   * ```ts
   * const response = await client.recommend.getRecommendations({
   *   query: 'Best CRM for remote teams',
   * });
   * ```
   */
  getRecommendations(
    body: RecommendGetRecommendationsParams,
    options?: RequestOptions,
  ): APIPromise<RecommendGetRecommendationsResponse> {
    return this._client.post('/recommend', { body, ...options });
  }
}

export interface RecommendGetRecommendationsResponse {
  decision_factors?: RecommendGetRecommendationsResponse.DecisionFactors;

  end_of_session?: boolean;

  intent?: RecommendGetRecommendationsResponse.Intent;

  model_used?: string;

  recommendation_id?: string;

  response?: RecommendGetRecommendationsResponse.Response;

  session_id?: string;

  tokens_used?: number;
}

export namespace RecommendGetRecommendationsResponse {
  export interface DecisionFactors {
    highlighted?: Array<string>;

    reasoning?: string;
  }

  export interface Intent {
    category?: string;

    goal?: Array<string>;

    intent_match_score?: number;

    known_mentions?: Array<string>;

    type?: string;
  }

  export interface Response {
    final_verdict?: string;

    followup_suggestions?: Array<string>;

    recommendations?: Array<Response.Recommendation>;

    summary?: string;
  }

  export namespace Response {
    export interface Recommendation {
      ad_id: string;

      admesh_link: string;

      admesh_trust_score: number;

      product_id: string;

      reason: string;

      title: string;

      features?: Array<string>;

      has_free_tier?: boolean;

      integrations?: Array<string>;

      pricing?: string;

      product_match_score?: number;

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

  followup_suggestions?: string | null;

  intent_summary?: string | null;

  model?: string | null;

  previous_query?: string | null;

  session_id?: string | null;

  summary?: string | null;

  user_id?: string | null;
}

export declare namespace Recommend {
  export {
    type RecommendGetRecommendationsResponse as RecommendGetRecommendationsResponse,
    type RecommendGetRecommendationsParams as RecommendGetRecommendationsParams,
  };
}
