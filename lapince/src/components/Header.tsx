"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/Authcontext";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Minuteur pour fermer automatiquement le menu après 10 secondes
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;;
    
    if (isOpen) {
      timer = setTimeout(() => {
        setIsOpen(false);
      }, 10000); // 10 secondes
    }

    // Nettoie le minuteur si le composant est démonté ou si la valeur d'isOpen change
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