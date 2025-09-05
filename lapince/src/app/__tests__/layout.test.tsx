// app/__tests__/layout.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type IUser from '@/@types/user';

// ============================================
// 1. D'ABORD, ON MOCK (= ON REMPLACE) LES DÉPENDANCES
// ============================================

// Mock Next.js router (on fait semblant qu'il existe)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Next.js Image (on remplace par une simple balise img)
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock Next.js Link (on remplace par une simple balise a)
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, onClick }: any) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}));

// Mock Axios (on fait semblant qu'il marche)
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  isAxiosError: jest.fn().mockReturnValue(false),
}));

// ============================================
// 2. ON MOCK LE CONTEXTE D'AUTHENTIFICATION
// ============================================

// On crée un faux utilisateur pour les tests
const fakeUser: IUser = {
  id: 1,
  pseudo: 'TestUser',
  email: 'test@example.com',
  account: [],
  budget: [],
};

// On crée un faux contexte qu'on peut contrôler
let mockUser: IUser | null = null;
const mockLogout = jest.fn();

jest.mock('@/contexts/Authcontext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: mockUser,
    loading: false,
    error: null,
    logout: mockLogout,
    fetchUser: jest.fn(),
  }),
}));

// ============================================
// 3. ON IMPORTE NOTRE COMPOSANT À TESTER
// ============================================
import RootLayout from '@/app/layout';

// ============================================
// 4. LES TESTS COMMENCENT ICI !
// ============================================

describe('Menu Burger - Tests simples', () => {
  // Avant chaque test, on remet tout à zéro
  beforeEach(() => {
    mockUser = null; // Pas d'utilisateur connecté par défaut
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1 : Le bouton menu existe-t-il ?
  // ============================================
  test('le bouton menu burger existe', () => {
    // On "rend" (affiche) notre composant
    render(
      <RootLayout>
        <div>Contenu test</div>
      </RootLayout>
    );

    // On cherche le bouton
    const boutonMenu = screen.getByRole('button');
    
    // On vérifie qu'il existe
    expect(boutonMenu).toBeInTheDocument();
  });

  // ============================================
  // TEST 2 : Le menu s'ouvre-t-il quand on clique ?
  // ============================================
  test('cliquer sur le bouton ouvre le menu', () => {
    render(
      <RootLayout>
        <div>Contenu test</div>
      </RootLayout>
    );

    // On trouve le bouton
    const boutonMenu = screen.getByRole('button');
    
    // On trouve le container du menu (l'élément juste après le bouton)
    const menuContainer = boutonMenu.nextElementSibling as HTMLElement;

    // Au début, le menu doit être fermé (classe "hidden")
    expect(menuContainer).toHaveClass('hidden');

    // On clique sur le bouton
    fireEvent.click(boutonMenu);

    // Maintenant le menu doit être ouvert (classe "flex")
    expect(menuContainer).toHaveClass('flex');
  });

  // ============================================
  // TEST 3 : Les liens pour utilisateur non connecté
  // ============================================
  test('utilisateur non connecté voit les bons liens', () => {
    // mockUser reste null (pas connecté)
    
    render(
      <RootLayout>
        <div>Contenu test</div>
      </RootLayout>
    );

    // On vérifie que les liens pour non-connectés sont là
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
    
    // On vérifie que les liens pour connectés ne sont PAS là
    expect(screen.queryByText('Mes comptes')).not.toBeInTheDocument();
    expect(screen.queryByText('Déconnexion')).not.toBeInTheDocument();
  });

  // ============================================
  // TEST 4 : Les liens pour utilisateur connecté
  // ============================================
  test('utilisateur connecté voit les bons liens', () => {
    // On connecte un utilisateur
    mockUser = fakeUser;
    
    render(
      <RootLayout>
        <div>Contenu test</div>
      </RootLayout>
    );

    // On vérifie que les liens pour connectés sont là
    expect(screen.getByText('Mes comptes')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    
    // On vérifie que les liens pour non-connectés ne sont PAS là
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
    expect(screen.queryByText('Inscription')).not.toBeInTheDocument();
  });

  // ============================================
  // TEST 5 : La déconnexion fonctionne-t-elle ?
  // ============================================
  test('cliquer sur déconnexion appelle la fonction logout', () => {
    // On connecte un utilisateur
    mockUser = fakeUser;
    
    render(
      <RootLayout>
        <div>Contenu test</div>
      </RootLayout>
    );

    // On trouve et clique sur le bouton de déconnexion
    const boutonDeconnexion = screen.getByText('Déconnexion');
    fireEvent.click(boutonDeconnexion);

    // On vérifie que la fonction logout a été appelée
    expect(mockLogout).toHaveBeenCalled();
  });
});

// ============================================
// 6. EXPLICATION DE CE QU'ON FAIT
// ============================================

/*
RÉSUMÉ DE CE QU'ON TESTE :

1. Le bouton menu existe ✅
2. Cliquer ouvre le menu ✅  
3. Utilisateur non connecté voit "Connexion" ✅
4. Utilisateur connecté voit "Déconnexion" ✅
5. Cliquer sur déconnexion marche ✅

COMMENT ÇA MARCHE :

- render() : affiche le composant
- screen.getByText() : trouve un élément par son texte
- fireEvent.click() : simule un clic
- expect().toBeInTheDocument() : vérifie qu'un élément existe
- jest.fn() : crée une fonction fake qu'on peut surveiller

LES MOCKS (fausses dépendances) :
- On remplace axios par une fausse version
- On remplace le router Next.js par une fausse version
- On remplace le contexte auth par un faux qu'on contrôle

POURQUOI ?
Parce qu'on veut tester SEULEMENT le menu burger, 
pas la vraie API ni le vrai router !
*/