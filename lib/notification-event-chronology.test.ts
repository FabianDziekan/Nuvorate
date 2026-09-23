import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { getDashboardNotifications } from "./dashboard-notifications-core.ts";

const source = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const migration = source("docs/database/040_notification_event_chronology.sql");
const page = source("app/(dashboard)/notifications/page.tsx");
const dropdown = source("components/notifications/notification-dropdown.tsx");

test("backfill reads the legacy JSON reviewId and falls back for invalid or missing reviews", () => {
  assert.match(migration, /notification_row\.message::jsonb ->> 'reviewId'/);
  assert.match(migration, /exception when others then\s+review_id := null/);
  assert.match(migration, /review\.business_id = notification_row\.business_id/);
  assert.match(migration, /set occurred_at = review\.created_at/);
  assert.match(migration, /set occurred_at = created_at\s+where occurred_at is null/);
  assert.match(migration, /alter column occurred_at set default now\(\)/);
  assert.match(migration, /alter column occurred_at set not null/);
});

test("new review event time comes from review creation; updates do not create notifications", () => {
  assert.match(migration, /'contentPreview', left\(normalized_content, 120\)[\s\S]*new\.created_at/);
  assert.match(source("docs/database/012_fix_new_review_notification_payload.sql"), /after insert on public\.reviews/);
  assert.doesNotMatch(migration, /after update on public\.reviews/);
});

test("history, unread, and page ranges use database event order before pagination", () => {
  const order = /\.order\("occurred_at", \{ ascending: false \}\)\s*\.order\("created_at", \{ ascending: false \}\)\s*\.order\("id", \{ ascending: false \}\)/g;
  assert.equal([...page.matchAll(order)].length, 2);
  assert.match(page, /\.eq\("is_read", false\)/);
  assert.match(page, /\.order\("id", \{ ascending: false \}\)\s*\.range\(requestedPagination\.start, requestedPagination\.end\)/);
  assert.match(page, /\.order\("id", \{ ascending: false \}\)\s*\.range\(pagination\.start, pagination\.end\)/);
  assert.match(page, /formatRelativeNotificationTime\(notification\.occurred_at\)/);
  assert.match(dropdown, /formatRelativeNotificationTime\(notification\.occurred_at\)/);
});

test("bell orders historical imports by event date with stable tie breakers", async () => {
  const records = [
    { id: "b", occurred_at: "2026-08-01", created_at: "2026-09-23T11:00:00Z" },
    { id: "a", occurred_at: "2026-09-23", created_at: "2026-09-23T11:01:00Z" },
    { id: "c", occurred_at: "2026-09-20", created_at: "2026-09-23T11:02:00Z" },
  ];
  const calls: string[][] = [];
  const client = {
    from(table: string) {
      assert.equal(table, "notifications");
      const orders: string[] = [];
      let isCount = false;
      const query = {
        select(_columns: string, options?: { head?: boolean }) { isCount = options?.head === true; return query; },
        eq() { return query; },
        order(column: string, options: { ascending: boolean }) {
          assert.equal(options.ascending, false);
          orders.push(column);
          return query;
        },
        limit() { return query; },
        then(resolve: (value: unknown) => void) {
          calls.push(orders);
          resolve(isCount
            ? { count: 3, error: null }
            : { data: [...records].sort((left, right) =>
                orders.map((column) => String(right[column as keyof typeof right]).localeCompare(String(left[column as keyof typeof left])))
                  .find((difference) => difference !== 0) ?? 0), error: null });
        },
      };
      return query;
    },
  };
  const result = await getDashboardNotifications(client, "business");
  assert.deepEqual(calls[0], ["occurred_at", "created_at", "id"]);
  assert.deepEqual(result.latest.map((record) => record.id), ["a", "c", "b"]);
});

test("same event timestamp has deterministic created_at then id ordering", () => {
  const rows = [
    { id: "a", occurred_at: "2026-09-23", created_at: "2026-09-23T10:00:00Z" },
    { id: "c", occurred_at: "2026-09-23", created_at: "2026-09-23T11:00:00Z" },
    { id: "b", occurred_at: "2026-09-23", created_at: "2026-09-23T11:00:00Z" },
  ];
  rows.sort((left, right) =>
    right.occurred_at.localeCompare(left.occurred_at) ||
    right.created_at.localeCompare(left.created_at) ||
    right.id.localeCompare(left.id));
  assert.deepEqual(rows.map((row) => row.id), ["c", "b", "a"]);
  assert.deepEqual(rows.slice(0, 2).map((row) => row.id), ["c", "b"]);
  assert.deepEqual(rows.slice(2, 4).map((row) => row.id), ["a"]);
});
