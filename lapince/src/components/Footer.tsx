import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-700 flex flex-col text-white items-center">
      <Link className="p-2" href="/contact">Contact</Link>
      <Link className="p-2" href="/cgu">Condition Générale d'Utilisation</Link>
      <Link className="p-2" href="/mention">Mentions Légales</Link>
      <Link className="p-2" href="/confid">Politique de Confidentialité</Link>
    </footer>
  );
}