import { PasswordResetForm } from '@/components/auth/PasswordResetForm';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              return to sign in
            </Link>
          </p>
        </div>
        <PasswordResetForm />
      </div>
    </div>
  );
}
