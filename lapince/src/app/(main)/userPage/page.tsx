"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/Authcontext";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import IAccount from "@/@types/account";
import { API_BASE_URL } from "@/config/api";

export default function UserPage() {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();
  const budget = useParams();
  
  // ========================================
  // ÉTATS POUR LA GESTION DES COMPTES
  // ========================================
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);



  // ========================================
  // ÉTATS POUR LA MODAL DE CREATION COMPTE
  // ========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountTitle, setNewAccountTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);




  // ========================================
  // ÉTATS POUR LA MODAL DE MODIFICATION DE L'ACCOUNT
  // ========================================
  const [isEditAModalOpen, setIsEditAModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<IAccount | null>(null);
  const [editAccountTitle, setEditAccountTitle] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);



  // ========================================
  // RÉCUPÉRER LES COMPTES DE L'UTILISATEUR
  // ========================================
  const fetchUserAccounts = async () => {
    if (!user) return;
    setAccountsLoading(true);
    setAccountsError(null);

    try {
      const userId = user.id;
      const url = `${API_BASE_URL}/api/user/${userId}/account`;
      const response = await axios.get(url, {
        withCredentials: true,
      });
      
      const fetchedAccounts = response.data.accounts || response.data;
      setAccounts(fetchedAccounts);
      
      
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des comptes:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setAccountsError('Non authentifié');
        } else if (error.response?.status === 404) {
          setAccountsError('Aucun compte trouvé');
          setAccounts([]);
        } else {
          setAccountsError(error.response?.data?.message || 'Erreur lors de la récupération des comptes');
        }
      } else {
        setAccountsError('Erreur de connexion');
      }
    } finally {
      setAccountsLoading(false);
    }
  };

  // ========================================
  // SUPPRIMER UN COMPTE
  // ========================================
  const deleteAccount = async (accountId: string) => {
    if (!user) return;
    setDeletingId(accountId);
    setDeleteError(null);

    try {
      const url = `${API_BASE_URL}/api/account/${accountId}`;
      await axios.delete(url, {
        withCredentials: true,
      });
      await fetchUserAccounts();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du compte:', error);
      setDeleteError('Erreur lors de la suppression du compte');
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // CRÉER UN NOUVEAU COMPTE
  // ========================================
  const createAccount = async () => {
    if (!user || !newAccountTitle.trim()) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const url = `${API_BASE_URL}/api/account`;
      await axios.post(url, {
        title: newAccountTitle,
        user_id: Number(user.id),
      }, {
        withCredentials: true,
      });
      
      await fetchUserAccounts();
      setNewAccountTitle("");
      setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Erreur lors de la création du compte:', error);
      setSubmitError('Erreur lors de la création du compte');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // MODIFIER UN COMPTE
  // ========================================

  // Fonction pour ouvrir la modal de modification
  // 🔧 CORRECTION SUPPLÉMENTAIRE : Améliorer openEditModal pour debug
  const openEditAModal = (account: IAccount) => {
    console.log('🔍 Debug - account reçu dans openEditModal:', account);
    console.log('🔍 Debug - account.id:', account.id);
  
    setEditingAccount(account);
    setEditAccountTitle(account.title || "");
    setUpdateError(null);
    setIsEditAModalOpen(true);
  };

  // Fonction pour fermer la modal de modification
  const closeEditAModal = () => {
    setIsEditAModalOpen(false);
    setEditingAccount(null);
    setEditAccountTitle("");
    setUpdateError(null);
  };

  // Fonction pour modifier un account
  const updateAccount = async () => {
    if (!user || !editingAccount || !editAccountTitle.trim()) {
      setUpdateError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    // 🔍 VÉRIFICATION AJOUTÉE : S'assurer que l'ID existe
  if (!editingAccount.id) {
    setUpdateError('ID de l\'account manquant');
    console.error('❌ editingAccount.id est undefined:', editingAccount);
    return;
  }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      

      const accountId =editingAccount.id; // 👈 récupéré automatiquement
      if (isNaN(accountId)) {
        setUpdateError('ID de l\'account invalide');
        return;
      }


      // 🔧 CORRECTION : S'assurer que l'ID est bien formaté
    const userId = editingAccount.user_id;
    if (isNaN(userId)) {
      setUpdateError('ID du user invalide');
      return;
    }


      const url = `${API_BASE_URL}/api/account/${accountId}`;
      console.log('🌐 URL de modification:', url);
      const payload = {
        account_id: accountId,
        title: editAccountTitle.trim().substring(0, 255),
        user_id:user.id
      };

      console.log('📤 Données de modification envoyées:', payload);

      const response = await axios.put(url, payload, {
        withCredentials: true,
      });
      
      console.log('✅ Réponse serveur (modification):', response.data);
      
      await fetchUserAccounts();
      closeEditAModal();
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);



      
      
      if (axios.isAxiosError(error)) {
        
        if (error.response?.status === 400) {
          setUpdateError('Données invalides. Vérifiez vos saisies.');
        } else if (error.response?.status === 404) {
          setUpdateError('Budget non trouvé.');
        } else if (error.response?.status === 500) {
          setUpdateError('Erreur serveur. Vérifiez le format des données.');
        } else {
          setUpdateError(`Erreur ${error.response?.status}: ${error.response?.data?.message || 'Erreur inconnue'}`);
        }
      } else {
        setUpdateError('Erreur de connexion au serveur');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  






 









  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    if (!user && !loading) {
      router.push("/connexion");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      fetchUserAccounts();
    }
  }, [user, loading]);

  // ========================================
  // RENDERS DE CHARGEMENT ET ERREUR
  // ========================================
  if (loading) {
    return (
      <p className="min-h-screen flex items-center justify-center">
        Chargement en cours...
      </p>
    );
  }

  if (!user) {
    return (
      <p className="min-h-screen flex items-center justify-center text-red-500">
        Vous n'êtes pas connecté. Redirection...
      </p>
    );
  }

  return (
    <div className="gr-container px-2">
      <h2 className="page-title">Profil de {user.pseudo}</h2>
      
      <div className="flex flex-col md:flex-row gap-8 my-10">
        <section className="flex-1">
          {/* ========================================
              EN-TÊTE DE LA SECTION COMPTES
          ======================================== */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Mes Comptes</h3>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={fetchUserAccounts}
                className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 text-sm"
                disabled={accountsLoading}
              >
                {accountsLoading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-green-600 text-sm"
              >
                Ajouter
              </button>
            </div>
          </div>
          
          {/* ========================================
              ÉTATS DE CHARGEMENT ET ERREURS
          ======================================== */}
          {accountsLoading && (
            <p className="text-gray-600 italic">Chargement des comptes...</p>
          )}
          
          {accountsError && (
            <p className="text-red-500 bg-red-50 p-3 rounded border">
              {accountsError}
            </p>
          )}
          
          {/* ========================================
              LISTE DES COMPTES
          ======================================== */}
          {!accountsLoading && !accountsError && (
            <div className="space-y-3 sm:grid grid-cols-2 lg:grid-cols-3">
              {accounts.length > 0 ? (
                accounts.map((account) => {
           
                  
                  return (
                    <div 
                      key={account.id} 
                      className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors m-4">
                      <div className="grid grid-cols-2">
                        
                      <h4 className="font-semibold mb-3">{account.title} :</h4>
                      
                        <div className="justify-self-end">
                         {/* Bouton supprimer compte */}
                         <button type="button"
                          onClick={() => deleteAccount(String(account.id))}
                          disabled={!!deletingId} 
                          className="bg-blue-700 py-1 px-2 m-2 rounded-xs text-white transition delay-150 duration-300 ease-in-out hover:scale-110 hover:bg-red-600 text-center disabled:opacity-50"
                        >
                          {deletingId === String(account.id) ? 'Suppression...' : 'X'}
                        </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-rows justify-center ">
                        {/* Bouton Gestion */}
                        <Link href={`/userPage/account/${account.id}`}>
                          <div className="bg-blue-700 p-2 m-2 rounded-lg text-white transition delay-150 duration-300 ease-in-out hover:scale-110 hover:bg-blue-600 text-center">
                            Gestion
                          </div>
                        </Link>

                        {/* Bouton modifier compte */}
                        <button type="button" onClick={() => openEditAModal(account)}
                          className="bg-blue-700 p-2 m-2 rounded-lg text-white transition delay-150 duration-300 ease-in-out hover:scale-110 hover:bg-blue-600 text-center"
                        >
                          Modifier
                        </button>
                        </div>                
                        </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg">
                  Aucun compte trouvé. Vous n'avez pas encore créé de comptes.
                </p>
              )}
            </div>
          )}
          
        </section>
      </div>

      {/* ========================================
          MODAL D'AJOUT DE COMPTE
      ======================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouveau compte</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du compte
              </label>
              <input
                type="text"
                value={newAccountTitle}
                onChange={(e) => setNewAccountTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: Compte courant"
              />
              {submitError && (
                <p className="text-red-500 text-sm mt-1">{submitError}</p>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewAccountTitle("");
                  setSubmitError(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={createAccount}
                disabled={isSubmitting || !newAccountTitle.trim()}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}



        {/* ========================================
          MODAL DE MODIFICATION DE COMPTE
      ======================================== */}
          {isEditAModalOpen && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Modifier le l'intitulé</h2>


            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé
              </label>
              <input
                type="text"
                value={editAccountTitle}
                onChange={(e) => setEditAccountTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: Nourriture"
              />
            </div>

           

            {updateError && (
              <p className="text-red-500 text-sm mb-4">{updateError}</p>
            )}
          
            <div className="flex justify-end gap-2">
              <button
                type="button" 
                onClick={closeEditAModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={updateAccount}
                disabled={isUpdating || !editAccountTitle.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isUpdating ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}