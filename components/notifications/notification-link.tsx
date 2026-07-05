"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
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

    event.preventDefault();

    if (!isRead) {
      onRead?.(notificationId);

      try {
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: "PATCH",
        });
      } catch (error) {
        console.error("Notification read update failed", error);
      }
    }

    router.push(href);
    router.refresh();
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
