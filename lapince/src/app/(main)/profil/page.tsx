"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/Authcontext";
import { useRouter } from "next/navigation";
import axios from "axios";
import IUser from "@/@types/user";
import { API_BASE_URL } from "@/config/api";

export default function ProfilPage() {
  const { user, loading, logout, fetchUser } = useAuth();
  const router = useRouter();

  // ========================================
  // ÉTATS POUR LA MODAL DE MODIFICATION DE USER
  // ========================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [editUserPseudo, setEditUserPseudo] = useState("");
  const [editUserMail, setEditUserMail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ========================================
  // NOUVEAUX ÉTATS POUR LA VÉRIFICATION DE DISPONIBILITÉ
  // ========================================
  const [checkingAvailability, setCheckingAvailability] = useState({
    email: false,
    pseudo: false
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    pseudo: ''
  });

  // ========================================
  // FONCTION DE VÉRIFICATION DE DISPONIBILITÉ
  // ========================================
  const checkFieldAvailability = async (field: 'email' | 'pseudo', value: string) => {
    if (!value.trim()) return;
    
    // Ne pas vérifier si c'est la même valeur que celle actuelle de l'utilisateur
    if ((field === 'email' && value === user?.email) || 
        (field === 'pseudo' && value === user?.pseudo)) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
      return;
    }

    setCheckingAvailability(prev => ({ ...prev, [field]: true }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/check?${field}=${encodeURIComponent(value)}`);
      if (response.data.exists) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: field === 'email' ? 'Cette adresse email est déjà utilisée' : 'Ce pseudo est déjà utilisé'
        }));
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification du ${field}:`, error);
      // Optionnel : afficher une erreur de vérification
      // setFieldErrors(prev => ({ ...prev, [field]: 'Impossible de vérifier la disponibilité' }));
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [field]: false }));
    }
  };

  // ========================================
  // MODIFIER UN USER
  // ========================================

  // Fonction pour ouvrir la modal de modification
  const openEditModal = (user: IUser) => {
    setEditingUser(user);
    setEditUserPseudo(user.pseudo || "");
    setEditUserMail(user.email || "");
    setUpdateError(null);
    // Réinitialiser les erreurs de champs
    setFieldErrors({ email: '', pseudo: '' });
    setIsEditModalOpen(true);
  };

  // Fonction pour fermer la modal de modification
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditUserPseudo("");
    setEditUserMail("");
    setUpdateError(null);
    // Réinitialiser les erreurs de champs
    setFieldErrors({ email: '', pseudo: '' });
  };

  // Fonction pour modifier un user
  const updateUser = async () => {
    if (!user || !editingUser || !editUserPseudo.trim() || !editUserMail.trim()) {
      setUpdateError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    // Vérifier s'il y a des erreurs de disponibilité
    if (fieldErrors.email || fieldErrors.pseudo) {
      setUpdateError('Veuillez corriger les erreurs avant de continuer');
      return;
    }

    // Vérification que l'ID existe
    if (!editingUser.id) {
      setUpdateError('ID du User manquant');
      console.error('❌ editingUser.id est undefined:', editingUser);
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserMail.trim())) {
      setUpdateError('Format d\'email invalide');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const userId = editingUser.id;
      const url = `${API_BASE_URL}/api/user/${userId}`;    
      const payload = {
        pseudo: editUserPseudo.trim().substring(0, 255),
        email: editUserMail.trim().substring(0, 255),
        role: user.role
      };
      const response = await axios.put(url, payload, {
        withCredentials: true,
      });
      
      const updatedUser = response.data;
      closeEditModal();
      
      alert('Profil modifié avec succès ! La modification prendra effet après reconnexion');
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setUpdateError('Données invalides. Vérifiez vos saisies.');
        } else if (error.response?.status === 404) {
          setUpdateError('Utilisateur non trouvé.');
        } else if (error.response?.status === 409) {
          setUpdateError('Cet email est déjà utilisé par un autre compte.');
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

  useEffect(() => {
    if (!user && !loading) {
      router.push("/connexion");
    }
  }, [user, loading, router]);

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

  const deleteUser = async () => {
    if (!user) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }
  
    try {
      const userId = user.id;
      const url = `${API_BASE_URL}/api/user/${userId}`;
      await axios.delete(url, { withCredentials: true });
      logout();
      alert("Compte supprimé avec succès.");
      router.push("/connexion");
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du compte:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Erreur lors de la suppression du compte');
      } else {
        alert('Erreur de connexion');
      }
    }
  };

  return (
    <div className="gr-container m-4">
      <h2 className="page-title">Profil de {user.pseudo}</h2>
      <div className="flex flex-col gap-8 my-10">
        
        <section className="flex-col justify-items-center ">
          <h3 className="text-xl font-semibold mb-4">Mes Informations</h3>
          <div className="space-y-4 text-gray-800">
            <p>
              <strong>Nom :</strong> {user.pseudo}
            </p>
            <p>
              <strong>Email :</strong> {user.email}
            </p>
          
            <p>
             <strong>Inscrit depuis le :</strong>
             {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
            
           <button 
             onClick={() => openEditModal(user)}
             className="bg-green-700 mt-2 p-2 m-2 rounded-full text-white transition delay-150 duration-300 ease-in-out hover:scale-110 hover:bg-green-500 text-center"
           >
             Modifier
           </button>
    
            <button 
              onClick={deleteUser} 
              className="mt-2 px-4 py-2 m-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition "
            >
              Supprimer mon compte
            </button>
            
          </div>
        </section>
      </div>

      {/* ========================================
      MODAL DE MODIFICATION DE USER AVEC VÉRIFICATION
      ======================================== */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Modifier mon profil</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pseudo
              </label>
              <input
                type="text"
                value={editUserPseudo}
                onChange={(e) => setEditUserPseudo(e.target.value)}
                onBlur={(e) => checkFieldAvailability('pseudo', e.target.value)}
                className={`w-full p-2 border rounded ${fieldErrors.pseudo ? 'border-red-500' : ''}`}
                placeholder="Ex: MonPseudo"
                maxLength={255}
              />
              {checkingAvailability.pseudo && (
                <p className="text-blue-500 text-sm mt-1">Vérification en cours...</p>
              )}
              {fieldErrors.pseudo && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.pseudo}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editUserMail}
                onChange={(e) => setEditUserMail(e.target.value)}
                onBlur={(e) => checkFieldAvailability('email', e.target.value)}
                className={`w-full p-2 border rounded ${fieldErrors.email ? 'border-red-500' : ''}`}
                placeholder="Ex: mon.email@exemple.com"
                maxLength={255}
              />
              {checkingAvailability.email && (
                <p className="text-blue-500 text-sm mt-1">Vérification en cours...</p>
              )}
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {updateError && (
              <p className="text-red-500 text-sm mb-4">{updateError}</p>
            )}
          
            <div className="flex justify-end gap-2">
              <button
                type="button" 
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={isUpdating}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={updateUser}
                disabled={
                  isUpdating || 
                  !editUserPseudo.trim() || 
                  !editUserMail.trim() || 
                  checkingAvailability.email || 
                  checkingAvailability.pseudo ||
                  fieldErrors.email !== '' ||
                  fieldErrors.pseudo !== ''
                }
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