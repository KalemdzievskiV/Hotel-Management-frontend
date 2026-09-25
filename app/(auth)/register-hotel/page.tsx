'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ApiError {
  response?: { data?: { message?: string; errors?: Record<string, string[]> | string[] } };
}

/** The API's validation messages as one list */
function errorMessages(error: unknown): string[] {
  const data = (error as ApiError)?.response?.data;
  if (!data) return ['Sign-up failed. Please try again.'];
  if (Array.isArray(data.errors)) return data.errors;
  if (data.errors) return Object.values(data.errors).flat();
  return [data.message ?? 'Sign-up failed. Please try again.'];
}

const inputClass =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm';

/**
 * A hotel owner signs up: they get a 30-day trial of every feature, then add their first hotel
 */
export default function RegisterHotelPage() {
  const router = useRouter();
  const { registerOwner, isLoading } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phoneNumber: '', country: '' });
  const [errors, setErrors] = useState<string[]>([]);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrors(["The passwords don't match"]);
      return;
    }
    setErrors([]);
    try {
      await registerOwner({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber || undefined,
        country: form.country || undefined,
      });
      router.push('/dashboard/hotels/new?welcome=1');
    } catch (error) {
      setErrors(errorMessages(error));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-2xl" aria-hidden="true">🏨</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Register your hotel</h1>
          <p className="mt-2 text-sm text-gray-600">Every feature free for 30 days. No card needed.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={submit}>
          {errors.length > 0 && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <ul className="list-inside list-disc space-y-1">
                {errors.map(error => <li key={error}>{error}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">First name</label>
              <input id="firstName" required autoComplete="given-name" className={inputClass} value={form.firstName} onChange={update('firstName')} />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">Last name</label>
              <input id="lastName" required autoComplete="family-name" className={inputClass} value={form.lastName} onChange={update('lastName')} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input id="email" type="email" required autoComplete="email" className={inputClass} value={form.email} onChange={update('email')} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} value={form.password} onChange={update('password')} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
              <input id="confirmPassword" type="password" required autoComplete="new-password" className={inputClass} value={form.confirmPassword} onChange={update('confirmPassword')} />
            </div>
          </div>
          <p className="text-xs text-gray-500">At least 6 characters, with an uppercase letter, a lowercase letter and a number.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">Phone <span className="font-normal text-gray-400">(optional)</span></label>
              <input id="phoneNumber" type="tel" autoComplete="tel" className={inputClass} value={form.phoneNumber} onChange={update('phoneNumber')} />
            </div>
            <div>
              <label htmlFor="country" className="mb-1 block text-sm font-medium text-gray-700">Country <span className="font-normal text-gray-400">(optional)</span></label>
              <input id="country" autoComplete="country-name" className={inputClass} value={form.country} onChange={update('country')} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Creating your account…' : 'Start free trial'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          {' · '}
          <Link href="/pricing" className="font-medium text-blue-600 hover:text-blue-500">See plans</Link>
        </p>
      </div>
    </div>
  );
}
