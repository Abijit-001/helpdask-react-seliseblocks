import { useAuthStore } from '@/state/store/auth';
import { decodeJWT } from '@/lib/utils/decode-jwt-utils';
import { useMemo } from 'react';

/**
 * useAuthDetails Hook
 * 
 * A custom React hook that provides detailed authentication state of the user.
 * It reads the current user profile, decodes the current access token to identify
 * the active organization, and filters the user's roles for that organization.
 * 
 * Exposes:
 * - user: The current logged-in user profile
 * - isAuthenticated: Boolean indicating if the user is authenticated
 * - roles: Array of role slugs active for the current organization (e.g. ['requester'])
 * - isRequester: Helper boolean if user is a Requester
 * - isAgent: Helper boolean if user is an Agent
 * - logout: Function to sign out
 */
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
