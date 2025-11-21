// export type UsersStatsPayload = {
//   total_users: number;
//   active_last_7_days?: number;
//   active_last_30_days?: number;
//   active_last_90_days?: number;
//   by_location?: Record<string, number>;
//   by_language?: Record<string, number>;
// };

// Types for analytics API responses

export interface UsersStatsPayload {
  total_users: number;
  active_in_range: number;
  by_location: Record<string, number>;
  by_language: Record<string, number>;
  by_age_group?: Record<string, number>;
  by_gender?: Record<string, number>;
  by_region?: Record<string, number>;
}

export interface ActiveUserPoint {
  date: string;
  value: number;
}

export interface Distribution {
  label: string;
  value: number;
}

export interface RegionDatum {
  label: string;
  value: number;
}

export interface AgeGroup {
  group: string;
  value: number;
}