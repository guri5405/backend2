export function extractCount(rows: { count: string }[]): number {
  const row = rows[0];
  return parseInt(row?.count ?? '0', 10);
}

export default extractCount;
