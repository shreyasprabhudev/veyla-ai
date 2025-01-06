import { GoogleLoginButton } from '@/app/components/GoogleLoginButton';
import { LoginForm } from '@/app/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Sign in to VeylaAI
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Start protecting your AI interactions
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <LoginForm />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton />
          
          <div className="text-center">
            <p className="text-sm text-gray-400">
              By signing in, you agree to our{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
