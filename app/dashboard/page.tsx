import ProtectedRoute from '../../components/ProtectedRoute';
import LogoutButton from '../../components/LogoutButton';
import { getCurrentUser } from '../../lib/auth-actions';

export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const user = await getCurrentUser();
  

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <LogoutButton />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome!</h2>
              <p className="text-blue-700">
                You are signed in as: <strong>{user?.email}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}