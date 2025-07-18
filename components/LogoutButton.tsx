'use client';
import { signOut } from '@/lib/auth-actions';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton() {
  const { setUser } = useAuth();

  const handleLogout = async () => {
    setUser(null);
    await signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}