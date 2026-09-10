import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import type { AppNotification } from "@/lib/notifications";

export function NotificationBell({
  initialNotifications,
}: {
  initialNotifications: AppNotification[];
}) {
  return (
    <NotificationDropdown
      initialNotifications={initialNotifications}
    />
  );
}
