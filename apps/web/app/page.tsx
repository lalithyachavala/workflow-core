export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center p-8">
      <h1 className="text-3xl font-bold">Employee Attendance API Backend</h1>
      <p className="mt-4 text-zinc-600">
        This Next.js app is backend-only. Use the Flutter Windows client for all frontend workflows.
      </p>
      <p className="mt-2 text-zinc-600">Health endpoint: /api/health</p>
    </main>
  );
}
