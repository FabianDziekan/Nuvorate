import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const source = (path: string) =>
  readFileSync(join(process.cwd(), path), "utf8");

const reviewsPage = source("app/(dashboard)/reviews/page.tsx");
const responsesPage = source("app/(dashboard)/responses/page.tsx");
const notificationsPage = source("app/(dashboard)/notifications/page.tsx");
const dashboardPage = source("app/(dashboard)/dashboard/page.tsx");
const mobileReviewList = source("components/reviews/mobile-review-list.tsx");

test("reviews use business-scoped server filtering, counting and ranges", () => {
  assert.match(reviewsPage, /\.eq\("business_id", business\.id\)/);
  assert.match(reviewsPage, /\.eq\("rating", Number\(selectedRating\)\)/);
  assert.match(reviewsPage, /count: "exact", head: true/);
  assert.match(reviewsPage, /\.range\(pagination\.start, pagination\.end\)/);
  assert.doesNotMatch(reviewsPage, /allReviews\.filter/);
});

test("responses apply response-state and rating filters before pagination", () => {
  assert.match(responsesPage, /response_status\.eq\.pending,response_status\.is\.null/);
  assert.match(responsesPage, /\.in\("response_status", \["ready", "responded"\]\)/);
  assert.match(responsesPage, /\.eq\("rating", Number\(selectedFilter\)\)/);
  assert.match(responsesPage, /\.range\(pagination\.start, pagination\.end\)/);
  assert.doesNotMatch(responsesPage, /function filterReviews/);
});

test("notifications use the shared unread snapshot and page only requested records", () => {
  assert.match(notificationsPage, /notifications\.unreadCount/);
  assert.match(notificationsPage, /count: "exact", head: true/);
  assert.match(notificationsPage, /\.range\(pagination\.start, pagination\.end\)/);
  assert.doesNotMatch(notificationsPage, /notificationItems\.filter/);
});

test("dashboard limits latest reviews and only nests their AI responses", () => {
  assert.match(dashboardPage, /ai_review_responses\(response_text\)/);
  assert.match(dashboardPage, /\.limit\(3\)/);
  assert.doesNotMatch(dashboardPage, /\.from\("ai_review_responses"\)/);
});

test("reviews pass a serialized next-page URL to the mobile client list", () => {
  assert.match(
    reviewsPage,
    /nextPageHref=\{buildReviewsHref\(selectedRating, currentPage \+ 1\)\}/,
  );
  assert.doesNotMatch(reviewsPage, /getNextPageHref=\{\(\) =>/);
  assert.match(mobileReviewList, /nextPageHref: string;/);
  assert.match(mobileReviewList, /href=\{nextPageHref\}/);
  assert.doesNotMatch(mobileReviewList, /getNextPageHref/);
});
