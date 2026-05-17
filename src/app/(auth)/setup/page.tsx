export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { SetupForm } from "@/components/auth/SetupForm";
import { prisma } from "@/lib/prisma";

export default async function SetupPage() {
  let dbAvailable = true;
  let userCount = 0;

  try {
    userCount = await prisma.user.count();
  } catch {
    dbAvailable = false;
  }

  if (dbAvailable && userCount > 0) {
    notFound();
  }

  if (!dbAvailable) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface-1/80 p-10 backdrop-blur-xl shadow-2xl text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-ruby-600/20 border border-ruby-600/30 mx-auto mb-6">
            <span className="text-ruby-400 text-2xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Database Unreachable</h1>
          <p className="text-white/55 text-sm mb-6">
            Ruby Panel cannot connect to PostgreSQL at <code className="text-ruby-200 font-mono">127.0.0.1:5432</code>.
            Start your database server, then refresh this page.
          </p>
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-5 text-left text-sm text-white/60 space-y-2">
            <p className="font-semibold text-white/80">Quick fix:</p>
            <p>1. Make sure PostgreSQL is installed and running</p>
            <p>2. Check your <code className="text-ruby-200">.env.local</code> has a correct <code className="text-ruby-200">DATABASE_URL</code></p>
            <p>3. Run <code className="text-ruby-200 font-mono">npx prisma migrate deploy</code></p>
            <p>4. Refresh this page</p>
          </div>
          <p className="mt-6 text-xs text-white/35">
            Already have an account? Use the emergency admin login:
            <br />
            <span className="text-white/55 font-mono">cattech3d@gmail.com</span>
          </p>
          <a href="/login" className="mt-4 inline-block rounded-xl bg-ruby-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-ruby-500 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <SetupForm />;
}
