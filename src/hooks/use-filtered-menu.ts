/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { MenuItem } from '../models/sidebar';
import { useAuthDetails } from '../auth/AuthContext';

export const useFilteredMenu = (menuItems: MenuItem[]): MenuItem[] => {
  const { roles } = useAuthDetails();

  const hasAccess = (item: MenuItem): boolean => {
    // No roles restriction — visible to everyone
    if (!item.roles) return true;

    const required = Array.isArray(item.roles) ? item.roles : [item.roles];
    // Item is visible if the user has at least one of the required roles
    return required.some((role) => roles.includes(role));
  };

  const filterMenuItem = (item: MenuItem): MenuItem | null => {
    if (!hasAccess(item)) return null;

    const filteredChildren = item.children
      ? (item.children.map(filterMenuItem).filter(Boolean) as MenuItem[])
      : undefined;

    return { ...item, children: filteredChildren };
  };

  return useMemo(
    () => menuItems.map(filterMenuItem).filter(Boolean) as MenuItem[],
    [menuItems, roles]
  );
};
