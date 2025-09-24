import { AuthProvider } from "@/contexts/Authcontext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import './styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body cz-shortcut-listen="true" className="flex flex-col min-h-screen">
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}