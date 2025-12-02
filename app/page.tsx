import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to a default view - we'll fetch the first list on the client
  redirect('/dashboard');
}
