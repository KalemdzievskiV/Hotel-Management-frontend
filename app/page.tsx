import { redirect } from 'next/navigation';

// /dashboard routes each role to its own dashboard (and unauthenticated users to /login)
export default function Home() {
  redirect('/dashboard');
}
