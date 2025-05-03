import { User } from '@/types';

interface UserSidebarProps {
  user: User | null;
  isDatabaseConnected: boolean;
}

export const UserSidebar = ({ user, isDatabaseConnected }: UserSidebarProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Account Information
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.username}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account created</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(user?.created_at || '').toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Database status</dt>
            <dd className="mt-1 text-sm">
              {isDatabaseConnected ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  Connected
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                  Not connected
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};