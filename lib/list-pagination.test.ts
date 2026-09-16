import assert from "node:assert/strict";
import test from "node:test";
import { getPaginationWindow } from "./list-pagination.ts";

test("pagination starts with the first server-side range", () => {
  assert.deepEqual(
    getPaginationWindow({ pageSize: 10, requestedPage: 1, totalItems: 23 }),
    { currentPage: 1, end: 9, start: 0, totalPages: 3 },
  );
});

test("pagination clamps a last page request to the final server-side range", () => {
  assert.deepEqual(
    getPaginationWindow({ pageSize: 10, requestedPage: 99, totalItems: 23 }),
    { currentPage: 3, end: 29, start: 20, totalPages: 3 },
  );
});

test("pagination keeps an empty list on its safe first page", () => {
  assert.deepEqual(
    getPaginationWindow({ pageSize: 10, requestedPage: 5, totalItems: 0 }),
    { currentPage: 1, end: 9, start: 0, totalPages: 1 },
  );
});
