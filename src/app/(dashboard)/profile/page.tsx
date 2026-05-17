export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import Image from "next/image";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/common/GlassCard";
import { DbUnavailable } from "@/components/common/DbUnavailable";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const isEmergencyAdmin = session.user.id === "emergency-admin-id";

  if (isEmergencyAdmin) {
    const secret = generateSecret();
    const otpauth = generateURI({ issuer: "Ruby Panel", label: session.user.email ?? "cattech3d@gmail.com", secret });
    const qr = await QRCode.toDataURL(otpauth);
    return (
      <>
        <PageHeader eyebrow="Account" title="Profile and 2FA" description="Manage account security, authenticator setup, and recovery posture." />
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard>
            <h2 className="text-lg font-semibold">{session.user.username ?? "cattech"}</h2>
            <p className="mt-1 text-sm text-white/45">{session.user.email ?? "cattech3d@gmail.com"}</p>
            <p className="mt-4 text-sm text-white/60">Role: SUPERADMIN</p>
            <p className="mt-1 text-sm text-white/60">2FA: Not enabled</p>
            <p className="mt-3 text-xs text-amber-400/80">Emergency admin mode — some profile features require a database connection.</p>
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-semibold">Authenticator setup</h2>
            <p className="mt-2 text-sm text-white/55">Scan this QR code, then verify a 6-digit token through the profile API before enabling 2FA.</p>
            <Image src={qr} alt="TOTP QR code" width={192} height={192} unoptimized className="mt-4 rounded-xl bg-white p-2" />
            <p className="mt-3 break-all font-mono text-xs text-white/45">{secret}</p>
          </GlassCard>
        </div>
      </>
    );
  }

  let user: Awaited<ReturnType<typeof prisma.user.findUniqueOrThrow>> | null = null;
  let dbAvailable = true;

  try {
    user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  } catch {
    dbAvailable = false;
  }

  if (!dbAvailable || !user) {
    return (
      <>
        <PageHeader eyebrow="Account" title="Profile and 2FA" description="Manage account security, authenticator setup, and recovery posture." />
        <DbUnavailable page="Profile" />
      </>
    );
  }

  const secret = user.totpSecret ?? generateSecret();
  const otpauth = generateURI({ issuer: "Ruby Panel", label: user.email, secret });
  const qr = await QRCode.toDataURL(otpauth);

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile and 2FA" description="Manage account security, authenticator setup, and recovery posture." />
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="text-lg font-semibold">{user.username}</h2>
          <p className="mt-1 text-sm text-white/45">{user.email}</p>
          <p className="mt-4 text-sm text-white/60">Role: {user.role}</p>
          <p className="mt-1 text-sm text-white/60">2FA: {user.totpEnabled ? "Enabled" : "Not enabled"}</p>
        </GlassCard>
        <GlassCard>
          <h2 className="text-lg font-semibold">Authenticator setup</h2>
          <p className="mt-2 text-sm text-white/55">Scan this QR code, then verify a 6-digit token through the profile API before enabling 2FA.</p>
          <Image src={qr} alt="TOTP QR code" width={192} height={192} unoptimized className="mt-4 rounded-xl bg-white p-2" />
          <p className="mt-3 break-all font-mono text-xs text-white/45">{secret}</p>
        </GlassCard>
      </div>
    </>
  );
}
