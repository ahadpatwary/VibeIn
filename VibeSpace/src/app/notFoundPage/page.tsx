// app/not-found.tsx (Next.js App Router) বা pages/404.tsx (Pages Router)
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  px-4">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </Link>
      </div>

      {/* Illustration or decoration */}
      <div className="mt-12">
        <svg
          className="w-64 h-64 text-gray-300 dark:text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 500 500"
        >
          <circle cx="250" cy="250" r="200" stroke="currentColor" strokeWidth="20" />
          <line x1="150" y1="150" x2="350" y2="350" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
          <line x1="350" y1="150" x2="150" y2="350" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
