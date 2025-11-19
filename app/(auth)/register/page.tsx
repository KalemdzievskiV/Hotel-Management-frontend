'use client';

import Link from 'next/link';
import { MultiStepSignUp } from '@/components/auth/MultiStepSignUp';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🏨</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Join Hotel Manager
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create an account to start booking your perfect stay
          </p>
        </div>

        {/* Multi-Step Form */}
        <MultiStepSignUp />

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
