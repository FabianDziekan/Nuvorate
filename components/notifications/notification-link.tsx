"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

export function NotificationLink({
  children,
  className,
  href,
  isRead,
  notificationId,
  onRead,
}: {
  children: ReactNode;
  className: string;
  href: string;
  isRead: boolean;
  notificationId: string;
  onRead?: (notificationId: string) => void;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (!isRead) {
      onRead?.(notificationId);

      void fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      }).catch(() => {
        // Stan odczytu jest optymistyczny — kolejna synchronizacja go odświeży.
      });
    }
  }

  return (
    <Link href={href} className={`${className} active:opacity-80`} onClick={handleClick}>
      {children}
    </Link>
  );
}
