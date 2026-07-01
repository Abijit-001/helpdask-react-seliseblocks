import { useAuthDetails } from '@/auth/AuthContext';

export const AgentDashboard = () => {
  const { user } = useAuthDetails();

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Agent Dashboard</h1>
      <p>Welcome Agent, <strong>{user?.firstName} {user?.lastName}</strong>!</p>
      <p>Your Email: {user?.email}</p>
      <p>Your Roles: agent, user</p>
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginTop: '20px', backgroundColor: '#f9f9f9' }}>
        <h3>[Placeholder] Support Queue</h3>
        <p>This is where you will see all support tickets in Phase 3.</p>
      </div>
    </div>
  );
};
