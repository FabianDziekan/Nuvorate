import { MobileBottomNavigationClient } from "./mobile-bottom-navigation-client";

type MobileBottomNavigationProps = {
  unreadCount: number;
};

export async function MobileBottomNavigation({
  unreadCount,
}: MobileBottomNavigationProps) {
  return <MobileBottomNavigationClient unreadCount={unreadCount} />;
}
