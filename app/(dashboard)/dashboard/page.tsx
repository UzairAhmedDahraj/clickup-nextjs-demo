'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, FolderOpen } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAndRedirect() {
      try {
        // Fetch lists
        const response = await fetch('/api/lists');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Redirect to first list
          router.push(`/lists/${data.data[0]._id}`);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
        setLoading(false);
      }
    }

    checkAndRedirect();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <FolderOpen className="mb-4 h-16 w-16 text-gray-400" />
      <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Welcome to Your Workspace
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Create your first list to start managing tasks
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Click the <strong>+</strong> button in the sidebar to create a list
      </p>
    </div>
  );
}
