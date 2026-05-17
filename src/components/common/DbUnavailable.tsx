export function DbUnavailable({ page }: { page: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-ruby-600/20 border border-ruby-600/30 mb-6">
        <span className="text-ruby-400 text-3xl font-bold">!</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Database Unavailable</h2>
      <p className="text-sm text-white/50 max-w-sm">
        The <span className="text-white/75 font-medium">{page}</span> page requires a database connection.
        PostgreSQL is not reachable at <code className="text-ruby-200 font-mono">127.0.0.1:5432</code>.
      </p>
      <p className="mt-4 text-xs text-white/35">Start PostgreSQL and refresh to load this page.</p>
    </div>
  );
}
