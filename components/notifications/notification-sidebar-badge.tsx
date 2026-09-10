export async function NotificationSidebarBadge({
  unreadCount,
}: {
  unreadCount: number;
}) {
  if (!unreadCount) {
    return null;
  }

  return (
    <span className="notification-sidebar-badge ml-auto grid min-h-[20px] min-w-[20px] place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold leading-none text-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
