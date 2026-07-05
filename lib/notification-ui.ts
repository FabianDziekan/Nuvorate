export type NotificationPreview = {
  authorName?: string;
  content?: string;
  contentPreview?: string;
  rating?: number;
  reviewId?: string;
};

export type NotificationView = {
  href: string;
  preview: NotificationPreview | null;
};

function truncate(value: string, length = 110) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= length) {
    return normalized;
  }

  return `${normalized.slice(0, length).trim()}...`;
}

export function parseNotificationPreview(message: string | null) {
  if (!message) {
    return null;
  }

  try {
    const parsed = JSON.parse(message) as NotificationPreview;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      authorName:
        typeof parsed.authorName === "string" ? parsed.authorName : undefined,
      content:
        typeof parsed.contentPreview === "string"
          ? truncate(parsed.contentPreview)
          : typeof parsed.content === "string"
            ? truncate(parsed.content)
            : undefined,
      contentPreview:
        typeof parsed.contentPreview === "string"
          ? truncate(parsed.contentPreview)
          : undefined,
      rating:
        typeof parsed.rating === "number" && Number.isFinite(parsed.rating)
          ? parsed.rating
          : undefined,
      reviewId:
        typeof parsed.reviewId === "string" ? parsed.reviewId : undefined,
    };
  } catch {
    return null;
  }
}

export function getNotificationView(type: string, message: string | null): NotificationView {
  const preview = parseNotificationPreview(message);

  if (type === "new_review") {
    return {
      href: preview?.reviewId
        ? `/reviews?highlight=${preview.reviewId}#review-${preview.reviewId}`
        : "/reviews",
      preview,
    };
  }

  if (type === "analysis_ready") {
    return { href: "/analysis", preview: null };
  }

  if (type === "response_generated") {
    return { href: "/responses", preview: null };
  }

  if (type === "limit_warning" || type === "subscription") {
    return { href: "/settings", preview: null };
  }

  return { href: "/notifications", preview: null };
}

export function formatRelativeNotificationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return "przed chwilą";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min temu`;
  }

  if (diffHours < 24) {
    return `${diffHours} godz. temu`;
  }

  if (diffDays === 1) {
    return "Wczoraj";
  }

  return `${diffDays} dni temu`;
}

export function formatNotificationMessage(type: string, message: string | null) {
  const preview = parseNotificationPreview(message);

  if (type === "new_review" && preview) {
    return {
      meta:
        preview.authorName && typeof preview.rating === "number"
          ? `${preview.authorName} • ${preview.rating.toFixed(1).replace(".", ",")}★`
          : preview.authorName,
      text: preview.content ? `"${preview.content}"` : null,
    };
  }

  return {
    meta: null,
    text: message,
  };
}
