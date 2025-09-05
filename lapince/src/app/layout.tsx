"use client";
import Image from "next/image";
import Link from "next/link";
import './styles/globals.css';
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/Authcontext";
import { useRouter } from "next/navigation";

function HeaderContent() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Timer pour fermer le menu automatiquement après 10 secondes
  useEffect(() => {
    let timer;
    
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 10000); // 10 secondes
    }

    // Nettoie le timer si le composant se démonte ou si isOpen change
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Fonction pour fermer le menu (utilisée dans les clics)
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="grid grid-cols-2">
      <Image className="m-2" src="/logo.webp" width={100} height={100} alt="logo" />
      <div className="flex flex-col items-end justify-start p-4 fixed right-0 md:relative">
        <button
          type="button"
          id="menu-toggle"
          className="bg-blue-700 p-2 rounded-full text-white mb-4 md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg role="graphics-symbol" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <div id="menu" className={`${isOpen ? 'flex' : 'hidden'} flex-col space-y-4 md:flex md:flex-row md:gap-2`}>
          <Link href="/" onClick={closeMenu}>
            <div className="bg-blue-700 p-2 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center">
              Accueil
            </div>
          </Link>
          <Link href="/contact" onClick={closeMenu}>
            <div className="bg-blue-700 p-2 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center">
              Contact
            </div>
          </Link>
          {!user ? (
            <>
              <Link href="/connexion" onClick={closeMenu}>
                <div className="bg-blue-700 p-2 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center">
                  Connexion
                </div>
              </Link>
              <Link href="/inscription" onClick={closeMenu}>
                <div className="bg-blue-700 p-2 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center">
                  Inscription
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link href="/userPage" onClick={closeMenu}>
                <div className="bg-blue-700 p-2 w-30 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center">
                  Mes comptes
                </div>
              </Link>
              <Link href="/profil" onClick={closeMenu}>
                <div className="bg-blue-700 p-2 md:w-20 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center">
                  Profil
                </div>
              </Link>
              <button 
                type="button"
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="bg-blue-700 px-2 h-10 rounded-full text-white transition delay-150 duration-300 ease-in-out -translate-y-1 hover:scale-110 hover:bg-red-500 text-center"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body cz-shortcut-listen="true" className="flex flex-col min-h-screen">
        <AuthProvider>
          <HeaderContent />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-blue-700 flex flex-col text-white items-center">
            <Link className="p-2" href="/contact">Contact</Link>
            <Link className="p-2" href="/cgu">Condition Générale d'Utilisation</Link>
            <Link className="p-2" href="/mention">Mentions Légales</Link>
            <Link className="p-2" href="/confid">Politique de Confidentialité</Link>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
