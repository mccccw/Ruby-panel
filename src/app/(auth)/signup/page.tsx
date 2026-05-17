export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center"><LoadingSpinner label="Preparing signup" /></main>}>
      <SignupForm />
    </Suspense>
  );
}
