import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Task Manager</h1>
      <p className="mb-4">Welcome! Use the links below:</p>
      <Link href="/account/login" className="text-blue-500 underline">Login</Link>
      <br />
      <Link href="/dashboard" className="text-blue-500 underline">Dashboard</Link>
    </div>
  );
}
