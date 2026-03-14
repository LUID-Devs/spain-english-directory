import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm text-slate-600">
            Loading login...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
