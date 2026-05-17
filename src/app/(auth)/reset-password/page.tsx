export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center"><LoadingSpinner label="Preparing reset flow" /></main>}>
      <PasswordResetForm />
    </Suspense>
  );
}
