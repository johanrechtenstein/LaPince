"use client"
import { useRouter } from 'next/navigation';

export default function Confirmation() {
  const router = useRouter();

  return (
    <div>
      <h1>Inscription confirmée</h1>
      <p>Merci de vous être inscrit !</p>
      <button type="button" onClick={() => router.push('/')}>Retour à l'accueil</button>
    </div>
  );
}
