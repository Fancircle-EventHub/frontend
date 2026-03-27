import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-3xl font-semibold">Fancircle EventHub</h1>
      <p className="text-zinc-300">MVP foundation for organization + guest event link flow.</p>
      <div className="flex flex-wrap gap-3">
        <Link className="rounded bg-blue-600 px-4 py-2" href="/organization/auth/register">Organization Register</Link>
        <Link className="rounded bg-zinc-700 px-4 py-2" href="/organization/auth/login">Organization Login</Link>
      </div>
    </div>
  );
}
