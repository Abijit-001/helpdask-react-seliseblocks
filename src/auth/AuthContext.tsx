import { useAuthStore } from '@/state/store/auth';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';
import { useMemo } from 'react';

export const useAuthDetails = () => {
  const { user, isAuthenticated, accessToken, logout } = useAuthStore();

  const roles = useMemo(() => {
    if (!user?.memberships?.length || !accessToken) return [];

    try {
      const decoded = decodeJWT(accessToken);
      const currentOrgId = decoded?.org_id;

      if (!currentOrgId) return [];

      const membership = user.memberships.find((m: any) => m.organizationId === currentOrgId);
      return membership?.roles ?? [];
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return [];
    }
  }, [user, accessToken]);

  const isRequester = roles.includes('requester');
  const isAgent = roles.includes('agent');

  return {
    user,
    isAuthenticated,
    roles,
    isRequester,
    isAgent,
    logout,
  };
};
