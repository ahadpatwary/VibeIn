// app/unauthorized.tsx (App Router) বা pages/unauthorized.tsx
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      {/* Main content */}
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-red-600 dark:text-red-500 mb-4">307</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Unauthorized Access
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          You don’t have permission to access this page. Please login or contact the administrator if you think this is a mistake.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>

      {/* Illustration */}
      <div className="mt-12">
        <svg
          className="w-64 h-64 text-red-200 dark:text-red-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 500 500"
        >
          <circle cx="250" cy="250" r="200" stroke="currentColor" strokeWidth="20" />
          <line x1="175" y1="175" x2="325" y2="325" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
          <line x1="325" y1="175" x2="175" y2="325" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
