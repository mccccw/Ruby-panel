export const dynamic = "force-dynamic";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function WebHostingPage() {
  const sites = await prisma.website.findMany({ orderBy: { updatedAt: "desc" }, include: { domains: true } });
  return (
    <>
      <PageHeader eyebrow="Web" title="Web hosting" description="Static, Node.js, and PHP sites with domains, SSL, environments, Git deploys, and per-site databases." actions={<Button asChild><Link href="/web-hosting/new"><Plus className="h-4 w-4" />New site</Link></Button>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sites.length === 0 ? <p className="glass-card p-8 text-white/45">No websites yet.</p> : null}
        {sites.map((site) => (
          <Link key={site.id} href={`/web-hosting/${site.id}`} className="glass-card p-5 transition-transform hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div><h3 className="font-semibold">{site.name}</h3><p className="mt-1 text-sm text-white/45">{site.type} · port {site.port}</p></div>
              <StatusBadge status={site.status} />
            </div>
            <p className="mt-5 text-sm text-white/50">{site.domains[0]?.domain ?? "No domain attached"}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
