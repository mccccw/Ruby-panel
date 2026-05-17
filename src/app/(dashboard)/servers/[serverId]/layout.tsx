import { ServerSubnav } from "@/components/server/ServerSubnav";

export default async function ServerLayout({ children, params }: { children: React.ReactNode; params: Promise<{ serverId: string }> }) {
  const { serverId } = await params;
  return (
    <div>
      <ServerSubnav serverId={serverId} />
      {children}
    </div>
  );
}
