export type UsersStatsPayload = {
  total_users: number;
  active_last_7_days?: number;
  active_last_30_days?: number;
  active_last_90_days?: number;
  by_location?: Record<string, number>;
  by_language?: Record<string, number>;
};

