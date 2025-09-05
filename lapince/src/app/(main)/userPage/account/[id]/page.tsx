"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/Authcontext";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import IDetailAccount from "@/@types/detail-account";
import IBudget from "@/@types/budget";
import BudgetList from "@/components/BudgetList";



export default function detailAccount() {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();
  const account = useParams();

 // États pour les détails de comptes
 const [dAccounts, setDAccounts] = useState<IDetailAccount[]>([]);
 const [dAccountsLoading, setDAccountsLoading] = useState(false);
 const [dAccountsError, setDAccountsError] = useState<string | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 // ÉTATS POUR LA GESTION DES BUDGETS
 interface IAccountBudgets {
  [accountId: number]: IBudget[];
}
 const [accountBudgets, setAccountBudgets] = useState<IAccountBudgets>({});
 const [budgetsLoading, setBudgetsLoading] = useState<{[key: number]: boolean}>({});
 const [deleteError, setDeleteError] = useState<string | null>(null);
 
 // État pour le filtrage par mois
 const [selectedMonth, setSelectedMonth] = useState<string>("");
 
 // État pour le titre du compte
 const [accountTitle, setAccountTitle] = useState<string>("");

 // États pour la modal d'ajout
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [newDetailAccountDate, setNewDetailAccountDate] = useState("");
 const [newDetailAccountAmount, setNewDetailAccountAmount] = useState("");
 const [newDetailAccountTitle, setNewDetailAccountTitle] = useState("");
 const [newDetailAccountType, setNewDetailAccountType] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitError, setSubmitError] = useState<string | null>(null);

 // États pour la modal de modification
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [editingAccount, setEditingAccount] = useState<IDetailAccount | null>(null);
 const [editDetailAccountDate, setEditDetailAccountDate] = useState("");
 const [editDetailAccountAmount, setEditDetailAccountAmount] = useState("");
 const [editDetailAccountTitle, setEditDetailAccountTitle] = useState("");
 const [editDetailAccountType, setEditDetailAccountType] = useState("");
 const [isUpdating, setIsUpdating] = useState(false);
 const [updateError, setUpdateError] = useState<string | null>(null);

 // Récupération des comptes de l'utilisateur
 const fetchUserDAccounts = async () => {
   if (!user || !account.id) return;
   
   setDAccountsLoading(true);
   setDAccountsError(null);

   try {
     const url = `http://localhost:3001/api/account/${account.id}`;
     const response = await axios.get(url, { withCredentials: true });
     
     setDAccounts(response.data.detail_account || response.data);
     setAccountTitle(response.data.title || "Compte sans titre");
     
   } catch (error) {
     console.error('❌ Erreur lors de la récupération des comptes:', error);
     
     if (axios.isAxiosError(error)) {
       if (error.response?.status === 401) {
         setDAccountsError('Non authentifié');
       } else if (error.response?.status === 404) {
         setDAccountsError('Aucun compte trouvé');
         setDAccounts([]);
       } else {
         setDAccountsError(error.response?.data?.message || 'Erreur lors de la récupération des comptes');
       }
     } else {
       setDAccountsError('Erreur de connexion');
     }
   } finally {
     setDAccountsLoading(false);
   }
 };

 // Suppression d'un détail de compte
 const deleteDetailAccount = async (detailAccountId: string) => {
   if (!user) return;
   
   setDeletingId(detailAccountId);
 
   try {
     const url = `http://localhost:3001/api/detailaccount/${detailAccountId}`;
     await axios.delete(url, { withCredentials: true });
     
     await fetchUserDAccounts();
   } catch (error) {
     console.error('❌ Erreur lors de la suppression du compte:', error);
   } finally {
     setDeletingId(null);
   }
 };


// ========================================
// ÉTATS POUR LA MODAL DE CREATION DE BUDGET
// ========================================
const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
const [newBudgetTitle, setNewBudgetTitle] = useState("");
const [newBudgetLimit, setNewBudgetLimit] = useState("");
const [newBudgetDate, setNewBudgetDate] = useState("");
const [isBudgetSubmitting, setIsBudgetSubmitting] = useState(false);
const [budgetSubmitError, setBudgetSubmitError] = useState<string | null>(null);

// ========================================
// ÉTATS POUR LA MODAL DE MODIFICATION DE BUDGET
// ========================================
const [isEditBModalOpen, setIsEditBModalOpen] = useState(false);
const [editingBudget, setEditingBudget] = useState<IBudget | null>(null);
const [editBudgetTitle, setEditBudgetTitle] = useState("");
const [editBudgetLimit, setEditBudgetLimit] = useState("");
const [editBudgetDate, setEditBudgetDate] = useState("");

// ========================================
// RÉCUPÉRER LES BUDGETS D'UN COMPTE
// ========================================
const fetchAccountBudgets = async (accountId: number) => {
  setBudgetsLoading(prev => ({...prev, [accountId]: true}));
    
  try {
    const url = `http://localhost:3001/api/account/${accountId}/budget`;
    const response = await axios.get(url, {
      withCredentials: true,
    });
      
    setAccountBudgets(prev => ({
      ...prev, 
      [accountId]: response.data.budgets || response.data || []
    }));
      
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des budgets pour le compte ${accountId}:`, error);
    setAccountBudgets(prev => ({...prev, [accountId]: []}));
    } finally {
    setBudgetsLoading(prev => ({...prev, [accountId]: false}));
    }
  };



 // Création d'un nouveau détail de compte
 const createDetailAccount = async () => {
   if (!user || !newDetailAccountTitle.trim() || !newDetailAccountDate || !newDetailAccountAmount) {
     setSubmitError('Tous les champs obligatoires doivent être remplis');
     return;
   }
   
   setIsSubmitting(true);
   setSubmitError(null);

   try {
     const parsedAmount = parseFloat(newDetailAccountAmount);
     if (isNaN(parsedAmount)) {
       setSubmitError('Le montant doit être un nombre valide');
       return;
     }

     const accountId = Number(account.id);
     if (isNaN(accountId)) {
       setSubmitError('ID de compte invalide');
       return;
     }

     const url = `http://localhost:3001/api/detailaccount`;
     const payload = {
       date: newDetailAccountDate,
       amount: parsedAmount,
       title: newDetailAccountTitle.trim().substring(0, 255),
       type: newDetailAccountType.trim().substring(0, 255),
       account_id: accountId
     };

     await axios.post(url, payload, { withCredentials: true });
     
     // Réinitialisation et rafraîchissement
     await fetchUserDAccounts();
     setNewDetailAccountDate("");
     setNewDetailAccountAmount("");
     setNewDetailAccountTitle("");
     setNewDetailAccountType("");
     setIsModalOpen(false);
     
   } catch (error) {
     console.error('❌ Erreur lors de la création de la ligne:', error);
     
     if (axios.isAxiosError(error)) {
       if (error.response?.status === 400) {
         setSubmitError('Données invalides. Vérifiez vos saisies.');
       } else if (error.response?.status === 404) {
         setSubmitError('Compte non trouvé.');
       } else if (error.response?.status === 500) {
         setSubmitError('Erreur serveur. Vérifiez le format des données.');
       } else {
         setSubmitError(`Erreur ${error.response?.status}: ${error.response?.data?.message || 'Erreur inconnue'}`);
       }
     } else {
       setSubmitError('Erreur de connexion au serveur');
     }
   } finally {
     setIsSubmitting(false);
   }
 };

 // Ouverture de la modal de création de compte
 const openDetailModal = (accountId: number) => {
   setIsModalOpen(true);
   
   // Pré-remplir avec la date courante
   const currentDate = new Date();
   const currentDay = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
   setNewDetailAccountDate(currentDay);
 };

 // Ouverture de la modal de modification de compte
 const openEditModal = (detailAccount: IDetailAccount) => {
   setEditingAccount(detailAccount);
   setEditDetailAccountDate(detailAccount.date || "");
   setEditDetailAccountAmount(detailAccount.amount.toString());
   setEditDetailAccountTitle(detailAccount.title || "");
   setEditDetailAccountType(detailAccount.type || "");
   setUpdateError(null);
   setIsEditModalOpen(true);
 };

 // Fermeture de la modal de modification de compte
 const closeEditModal = () => {
   setIsEditModalOpen(false);
   setEditingAccount(null);
   setEditDetailAccountDate("");
   setEditDetailAccountAmount("");
   setEditDetailAccountTitle("");
   setEditDetailAccountType("");
   setUpdateError(null);
 };

 // Modification d'un détail de compte
 const updateDetailAccount = async () => {
   if (!user || !editingAccount || !editDetailAccountDate || !editDetailAccountAmount.trim() || !editDetailAccountTitle || !editDetailAccountType) {
     setUpdateError('Tous les champs obligatoires doivent être remplis');
     return;
   }

   if (!editingAccount.id) {
     setUpdateError('ID du détail d\'account manquant');
     return;
   }

   setIsUpdating(true);
   setUpdateError(null);

   try {
     const parsedAmount = parseFloat(editDetailAccountAmount);
     if (isNaN(parsedAmount)) {
       setUpdateError('Le montant doit être un nombre valide');
       return;
     }

     const accountId = Number(account.id);
     if (isNaN(accountId)) {
       setUpdateError('ID d\'account invalide');
       return;
     }

     const detailAccountId = Number(editingAccount.id);
     if (isNaN(detailAccountId)) {
       setUpdateError('ID du détail d\'account invalide');
       return;
     }

     const url = `http://localhost:3001/api/detailaccount/${detailAccountId}`;
     const payload = {
       date: editDetailAccountDate,
       amount: parsedAmount,
       title: editDetailAccountTitle.trim().substring(0, 255),
       type: editDetailAccountType.trim().substring(0, 255),
       account_id: accountId
     };

     await axios.put(url, payload, { withCredentials: true });
     
     await fetchUserDAccounts();
     closeEditModal();
     
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
  // SUPPRIMER UN BUDGET
  // ========================================
  const deleteBudget = async (budgetId: string, accountId: number) => {
    if (!user) return;
    setDeletingId(budgetId);
    setDeleteError(null);

    try {
      const url = `http://localhost:3001/api/budget/${budgetId}`;
      await axios.delete(url, {
        withCredentials: true,
      });
      await fetchAccountBudgets(accountId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du budget:', error);
      setDeleteError('Erreur lors de la suppression du budget');
    } finally {
      setDeletingId(null);
    }
  };

  // ========================================
  // CRÉER UN BUDGET
  // ========================================
  const createBudget = async () => {
    if (!user || !selectedAccountId || !newBudgetTitle.trim() || !newBudgetLimit || !newBudgetDate) return;
    
    setIsBudgetSubmitting(true);
    setBudgetSubmitError(null);

    try {
      // Fonction pour obtenir le mois courant au format YYYY-MM
    //  const getCurrentMonth = () => {
    //   const now = new Date();
    //   const year = now.getFullYear();
    //   const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 car getMonth() retourne 0-11
    //   return `${year}-${month}`;
    // };
      const url = `http://localhost:3001/api/budget`;
      await axios.post(url, {
        title: newBudgetTitle,
        user_id: Number(user.id),
        account_id: selectedAccountId,
        limit: parseFloat(newBudgetLimit),
        date: selectedMonth
      }, {
        withCredentials: true,
      });
      
      await fetchAccountBudgets(selectedAccountId);
      
      // Réinitialiser la modal
      setNewBudgetTitle("");
      setNewBudgetLimit("");
      setNewBudgetDate("");
      setSelectedAccountId(null);
      setIsBudgetModalOpen(false);
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du budget:', error);
      setBudgetSubmitError('Erreur lors de la création du budget');
    } finally {
      setIsBudgetSubmitting(false);
    }
  };

  // ========================================
  // OUVRIR LA MODAL DE CRÉATION DE BUDGET
  // ========================================
  const openBudgetModal = (accountId: number) => {
    setSelectedAccountId(accountId);
    setIsBudgetModalOpen(true);
    
     // Utiliser directement selectedMonth
  if (selectedMonth) {
    setNewBudgetDate(selectedMonth);
  } else {
    // Fallback si selectedMonth n'est pas défini
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setNewBudgetDate(currentMonth);
  }
};


  // ========================================
  // MODIFIER UN BUDGET
  // ========================================

   // Fonction pour ouvrir la modal de modification
  // 🔧 CORRECTION SUPPLÉMENTAIRE : Améliorer openEditModal pour debug
  const openEditBModal = (budget: IBudget) => {
    console.log('🔍 Debug - budget reçu dans openEditModal:', budget);
    console.log('🔍 Debug - budget.id:', budget.id);
  
    setEditingBudget(budget);
    setEditBudgetTitle(budget.title || "");
    setEditBudgetLimit(budget.limit.toString());
    setEditBudgetDate(budget.date || "");
    setUpdateError(null);
    setIsEditBModalOpen(true);
  };

  // Fonction pour fermer la modal de modification
  const closeEditBModal = () => {
    setIsEditBModalOpen(false);
    setEditingBudget(null);
    setEditBudgetTitle("");
    setEditBudgetLimit("");
    setEditBudgetDate("");
    setUpdateError(null);
  };

  // Fonction pour modifier un budget
  const updateBudget = async () => {
    if (!user || !editingBudget || !editBudgetDate || !editBudgetLimit.trim() || !editBudgetTitle) {
      setUpdateError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    // 🔍 VÉRIFICATION AJOUTÉE : S'assurer que l'ID existe
  if (!editingBudget.id) {
    setUpdateError('ID du budget manquant');
    console.error('❌ editingBudget.id est undefined:', editingBudget);
    return;
  }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      
      const formatDateForDB = (dateString:string) => {
        if (!dateString) return null;
        
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateString.substring(0,7);
        }
        
        const parts = dateString.split('/');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}`;
        }
        
        return dateString;
      };
      
      const parsedLimit = parseFloat(editBudgetLimit);
      if (isNaN(parsedLimit)) {
        setUpdateError('La limite doit être un nombre valide');
        return;
      }

      const accountId =editingBudget.account_id; // 👈 récupéré automatiquement
      if (accountId === undefined) {
        setUpdateError('ID de l\'account manquant');
        return;
    }
      if (isNaN(accountId)) {
        setUpdateError('ID de l\'account invalide');
        return;
      }


      // S'assurer que l'ID est bien formaté
    const budgetId = editingBudget.id;
    if (isNaN(budgetId)) {
      setUpdateError('ID du budget invalide');
      return;
    }


      const url = `http://localhost:3001/api/budget/${budgetId}`;
      console.log('🌐 URL de modification:', url);
      const payload = {
        title: editBudgetTitle.trim().substring(0, 255),
        user_id:user.id,
        limit: parsedLimit,
        date: formatDateForDB(editBudgetDate),
        account_id: accountId
      };

    

      const response = await axios.put(url, payload, {
        withCredentials: true,
      });
      
   
      
      await fetchAccountBudgets(accountId);
      closeEditBModal();
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);



      
      
      if (axios.isAxiosError(error)) {
        console.log('🔍 Debug - Status:', error.response?.status);
        console.log('🔍 Debug - URL appelée:', error.config?.url);
        console.log('🔍 Debug - Méthode:', error.config?.method);
        console.log('🔍 Debug - Data envoyée:', error.config?.data);
        console.log('🔍 Debug - Response data:', error.response?.data);

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



 // Redirection si non authentifié
 useEffect(() => {
   if (!user && !loading) {
     router.push("/connexion");
   }
 }, [user, loading, router]);

 // Récupération des comptes au chargement
 useEffect(() => {
   if (user && !loading) {
     fetchUserDAccounts();
     // Vérifier si account.id existe et est un nombre valide
    const accountId = Number(account.id); // Convertit en nombre, peut résulter en NaN

    if (!isNaN(accountId)) {
      fetchAccountBudgets(accountId);
    } else {
      // Gérer le cas où l'ID est manquant ou invalide,
      // par exemple, rediriger l'utilisateur ou afficher une erreur.
      console.error('ID de compte invalide ou manquant.');
    }
     
     // Initialiser avec le mois courant
     const currentDate = new Date();
     const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
     setSelectedMonth(currentMonth);
   }
 }, [user, loading]);

 // Fonction pour grouper les comptes par mois
 const groupAccountsByMonth = (accounts: IDetailAccount[]) => {
   const grouped: { [key: string]: IDetailAccount[] } = {};
   
   accounts.forEach((account) => {
     if (account.date) {
       // Extraire l'année-mois de la date (YYYY-MM)
       const monthKey = account.date.substring(0, 7);
       if (!grouped[monthKey]) {
         grouped[monthKey] = [];
       }
       grouped[monthKey].push(account);
     }
   });
   
   // Trier les mois par ordre décroissant (plus récent en premier)
   return Object.keys(grouped)
     .sort((a, b) => b.localeCompare(a))
     .reduce((acc, key) => {
       acc[key] = grouped[key].sort((a, b) => b.date.localeCompare(a.date));
       return acc;
     }, {} as { [key: string]: IDetailAccount[] });
 };

 // Fonction pour calculer le total d'un mois
 const calculateMonthTotal = (accounts: IDetailAccount[]) => {
   return accounts.reduce((total, account) => {
     const amount = parseFloat(account.amount.toString());
     return total + (isNaN(amount) ? 0 : amount);
   }, 0);
 };


// Fonction pour calculer le total des limites de budget pour un mois donné
const calculateTotalBudgetLimit = (budgets:IBudget[], month:string) => {
  if (!budgets || !month) return 0;
  
  return budgets
    .filter(budget => budget.date.substring(0, 7) === month)
    .reduce((total, budget) => total + parseFloat(budget.limit || '0'), 0);
};


 // Fonction pour formater l'affichage du mois
 const formatMonthDisplay = (monthKey: string) => {
   const [year, month] = monthKey.split('-');
   const monthNames = [
     'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
     'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
   ];
   return `${monthNames[parseInt(month) - 1]} ${year}`;
 };

 // Grouper les comptes par mois
 const groupedAccounts = groupAccountsByMonth(dAccounts);
 const availableMonths = Object.keys(groupedAccounts);

 // Fonctions pour naviguer entre les mois
 const goToPreviousMonth = () => {
   if (!selectedMonth) return;
   
   const currentIndex = availableMonths.indexOf(selectedMonth);
   if (currentIndex < availableMonths.length - 1) {
     setSelectedMonth(availableMonths[currentIndex + 1]);
   }
 };

 const goToNextMonth = () => {
   if (!selectedMonth) return;
   
   const currentIndex = availableMonths.indexOf(selectedMonth);
   if (currentIndex > 0) {
     setSelectedMonth(availableMonths[currentIndex - 1]);
   }
 };

 // Filtrer les comptes selon le mois sélectionné
 const filteredAccounts = selectedMonth ? groupedAccounts[selectedMonth] || [] : dAccounts;

 // Affichage du chargement
 if (loading) {
   return (
     <p className="min-h-screen flex items-center justify-center">
       Chargement en cours...
     </p>
   );
 }

 // Vérification de l'authentification
 if (!user) {
   return (
     <p className="min-h-screen flex items-center justify-center text-red-500">
       Vous n'êtes pas connecté. Redirection...
     </p>
   );
 }

 return (
  <div className="gr-container p-2">
    <div className="flex flex-col md:flex-row gap-8 my-10">
      {/* Section des comptes */}
      <section className="flex-1">
        <div className="flex flex-col justify-between items-center mb-4">
          <h3 className="text-xl my-2 font-semibold">Détails du Compte de {accountTitle}</h3>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchUserDAccounts}
              className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 text-sm"
              disabled={dAccountsLoading}
            >
              {dAccountsLoading ? 'Actualisation...' : 'Actualiser'}
            </button>

            <button
              type="button"
              onClick={() => {
                // 1. Convert the ID to a number
                const accountId = Number(account.id);
            
                // 2. Check if the converted ID is a valid number
                if (!isNaN(accountId)) {
                  openDetailModal(accountId);
                } else {
                  // Handle the case where the ID is invalid (e.g., show an error)
                  console.error("ID de compte invalide ou manquant.");
                }
              }}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Ajouter
            </button>

            <button
              type="button"
              onClick={() => {
                // 1. Convert the ID to a number
                const accountId = Number(account.id);
            
                // 2. Check if the converted ID is a valid number
                if (!isNaN(accountId)) {
                  openBudgetModal(accountId);
                } else {
                  // Handle the case where the ID is invalid (e.g., show an error)
                  console.error("ID de compte invalide ou manquant.");
                }
              }}
              className="ml-2 px-3 py-1 bg-orange-700 text-white rounded-md text-xs hover:bg-orange-600"
              >
              Créer budget
              </button>
          </div>
        </div>
        {/* Navigation par mois */}
        {availableMonths.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
              <button
                onClick={goToPreviousMonth}
                disabled={!selectedMonth || availableMonths.indexOf(selectedMonth) >= availableMonths.length - 1}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-800">
                  {formatMonthDisplay(selectedMonth)}
                </h4>                 
                {selectedMonth && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">      
                      <div className="text-right">
                        {(() => {
                        const totalExpenses = calculateMonthTotal(filteredAccounts) || 0;
                        // Assurez-vous que l'ID est une chaîne de caractères ou un nombre simple
                        const accountId = Number(Array.isArray(account.id) ? account.id[0] : account.id);

                        // Vérifiez que l'ID n'est ni null ni undefined, puis accédez à l'objet
                        const totalBudgetLimit = calculateTotalBudgetLimit(
                        (accountBudgets && accountId && accountBudgets[accountId]) || [], 
                        selectedMonth
                        );
                        const difference = totalExpenses - totalBudgetLimit;
          
                        return (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              Compte: <span className="font-medium">{totalExpenses.toFixed(2)}€</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Budget: <span className="font-medium">{totalBudgetLimit.toFixed(2)}€</span>
                            </p>
                            <p className={`text-lg font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference >= 0 ? 'Reste: ' : 'Dépassement: '}
                              {Math.abs(difference).toFixed(2)}€
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
                
              </div>
              <button
                onClick={goToNextMonth}
                disabled={!selectedMonth || availableMonths.indexOf(selectedMonth) <= 0}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* Chargement */}
        {dAccountsLoading && (
          <p className="text-gray-600 italic">Chargement des comptes...</p>
        )}
        {/* Erreurs */}
        {dAccountsError && (
          <p className="text-red-500 bg-red-50 p-3 rounded border">
            {dAccountsError}
          </p>
        )}
        {/* Liste des comptes */}
        {!dAccountsLoading && !dAccountsError && (
          <div className="space-y-6">
            {selectedMonth ? (
              // Affichage pour un mois spécifique
              <div>
                <div className="space-y-3">
                  {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((detail_account) => {
                      
                      const accountBudgetList = accountBudgets[Number(account.id)] || [];
                      const isLoadingBudgets = budgetsLoading[Number(account.id)];
                      return (
                        <div
                          key={detail_account.id}
                          className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          <div className="grid grid-cols-4 gap-4 items-center">
                            <span className="font-medium text-gray-800">{detail_account.date}</span>
                            <span className="font-medium text-gray-800">{parseFloat(detail_account.amount.toString()).toFixed(2)}€</span>
                            <span className="font-medium text-gray-800">{detail_account.type}</span>
                            <span className="font-medium text-gray-800">{detail_account.title}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => openEditModal(detail_account)}
                              className="bg-blue-500 px-3 py-1 rounded text-white text-sm hover:bg-blue-600 transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteDetailAccount(String(detail_account.id))}
                              disabled={!!deletingId}
                              className="bg-red-500 px-3 py-1 rounded text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {deletingId === String(detail_account.id) ? 'Suppression...' : 'Supprimer'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg">
                      Aucune transaction trouvée pour ce mois.
                    </p>
                  )}
                </div>
                {/* AJOUTEZ LE COMPOSANT D'AFFICHAGE DES BUDGETS ICI, EN DEHORS DE LA BOUCLE */}
                <h4 className="m-4 font-bold">Mes Budgets</h4>
                {selectedMonth&&(
                 <div className="mt-4">
                    <BudgetList
                    budgets={
                      accountBudgets[Number(account.id)]?.filter(
                        (budget) => {
                          const budgetMonth = budget.date.substring(0, 7);
                          return budgetMonth === selectedMonth;
                        }
                      ) || []
                    }
                    isLoading={budgetsLoading[Number(account.id)]}
                    openEditBModal={openEditBModal}
                    deleteBudget={deleteBudget}
                    deletingId={deletingId}
                    accountId={account.id}
                    />
                 </div>)}
              </div>
            ) : (
              <div>
                {Object.keys(groupedAccounts).length > 0 ? (
                  Object.keys(groupedAccounts).map((monthKey) => {
                    const monthAccounts = groupedAccounts[monthKey];
                    const monthTotal = calculateMonthTotal(monthAccounts);
                    return (
                      <div key={monthKey} className="mb-8">
                        <div className="bg-gray-100 p-4 rounded-lg border mb-4">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-800">
                              {formatMonthDisplay(monthKey)}
                            </h4>
                            <div className="text-right">
                              <p className="text-gray-700 font-medium">
                                Total : <strong>{monthTotal}€</strong>
                              </p>
                              <p className="text-sm text-gray-600">
                                {monthAccounts.length} transaction{monthAccounts.length > 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {monthAccounts.slice(0, 5).map((detail_account) => (
                            <div
                              key={detail_account.id}
                              className="p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
                            >
                              <div className="grid grid-cols-4 gap-4 items-center text-sm">
                                <span className="text-gray-700">{detail_account.date}</span>
                                <span className="font-medium">{detail_account.amount.toFixed(2)}€</span>
                                <span className="text-gray-600">{detail_account.type}</span>
                                <span className="text-gray-800">{detail_account.title}</span>
                              </div>
                            </div>
                          ))}
                          {monthAccounts.length > 5 && (
                            <button
                              onClick={() => setSelectedMonth(monthKey)}
                              className="w-full p-2 text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                            >
                              Voir les {monthAccounts.length - 5} autres transactions...
                            </button>
                          )}
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
          </div>
        )}
      </section>
    </div>
    {/* ========================================
          MODAL DE CRÉATION DE BUDGET
      ======================================== */}
    {isBudgetModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Nouveau budget</h3>
          {/* Titre du budget */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du budget
            </label>
            <input
              type="text"
              value={newBudgetTitle}
              onChange={(e) => setNewBudgetTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: Budget alimentaire"
            />
          </div>
          {/* Limite en euros */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newBudgetLimit}
              onChange={(e) => setNewBudgetLimit(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: 500.00"
            />
          </div>
          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date (Année-Mois)
            </label>
            <input
              type="month"
              value={newBudgetDate}
              onChange={(e) => setNewBudgetDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          {/* Erreurs */}
          {budgetSubmitError && (
            <p className="text-red-500 text-sm mb-4">{budgetSubmitError}</p>
          )}
          {/* Boutons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsBudgetModalOpen(false);
                setNewBudgetTitle("");
                setNewBudgetLimit("");
                setNewBudgetDate("");
                setSelectedAccountId(null);
                setBudgetSubmitError(null);
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={createBudget}
              disabled={isBudgetSubmitting || !newBudgetTitle.trim() || !newBudgetLimit || !newBudgetDate}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isBudgetSubmitting ? 'Création...' : 'Créer Budget'}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* ========================================
          MODAL DE MODIFICATION DE BUDGET
      ======================================== */}
    {isEditBModalOpen && editingBudget && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Modifier le budget</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              titre
            </label>
            <input
              type="text"
              value={editBudgetTitle}
              onChange={(e) => setEditBudgetTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: Nourriture"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite
            </label>
            <input
              type="number"
              value={editBudgetLimit}
              onChange={(e) => setEditBudgetLimit(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ex: 1000"
            />
          </div>
        
          {updateError && (
            <p className="text-red-500 text-sm mb-4">{updateError}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditBModal}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={updateBudget}
              disabled={isUpdating || !editBudgetTitle.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isUpdating ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* Modal d'ajout */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Ajouter une ligne</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newDetailAccountDate}
                onChange={(e) => setNewDetailAccountDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                step="0.01"
                value={newDetailAccountAmount}
                onChange={(e) => setNewDetailAccountAmount(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé
              </label>
              <input
                type="text"
                value={newDetailAccountTitle}
                onChange={(e) => setNewDetailAccountTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: Nourriture"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={newDetailAccountType}
                onChange={(e) => setNewDetailAccountType(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: CB"
              />
            </div>
          </div>
          {submitError && (
            <p className="text-red-500 text-sm mt-4">{submitError}</p>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setNewDetailAccountDate("");
                setNewDetailAccountAmount("");
                setNewDetailAccountTitle("");
                setNewDetailAccountType("");
                setSubmitError(null);
              }}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={createDetailAccount}
              disabled={isSubmitting || !newDetailAccountTitle.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    )}
    {/* Modal de modification */}
    {isEditModalOpen && editingAccount && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Modifier le détail du compte</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={editDetailAccountDate}
                onChange={(e) => setEditDetailAccountDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                step="0.01"
                value={editDetailAccountAmount}
                onChange={(e) => setEditDetailAccountAmount(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé
              </label>
              <input
                type="text"
                value={editDetailAccountTitle}
                onChange={(e) => setEditDetailAccountTitle(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={editDetailAccountType}
                onChange={(e) => setEditDetailAccountType(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          {updateError && (
            <p className="text-red-500 text-sm mt-4">{updateError}</p>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={closeEditModal}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={updateDetailAccount}
              disabled={isUpdating || !editDetailAccountTitle.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isUpdating ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}