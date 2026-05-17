export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center"><LoadingSpinner label="Preparing login" /></main>}>
      <LoginForm />
    </Suspense>
  );
}
