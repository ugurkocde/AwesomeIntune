export const COMMUNITY_COUNT_MAX_AGE = 15 * 60 * 1000;
export function freshCommunityCount(
  data: unknown,
  now = Date.now(),
): { count: number; updatedAt: string } | null {
  if (!data || typeof data !== "object") return null;
  const row = data as { member_count?: unknown; observed_at?: unknown };
  if (
    typeof row.member_count !== "number" ||
    !Number.isSafeInteger(row.member_count) ||
    row.member_count < 1 ||
    row.member_count > 1000000 ||
    typeof row.observed_at !== "string"
  )
    return null;
  const age = now - Date.parse(row.observed_at);
  if (!Number.isFinite(age) || age < -120000 || age >= COMMUNITY_COUNT_MAX_AGE)
    return null;
  return { count: row.member_count, updatedAt: row.observed_at };
}
