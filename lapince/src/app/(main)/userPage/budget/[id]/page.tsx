"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/Authcontext";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import IDetailBudget from "@/@types/detail-budget";
import { API_BASE_URL } from "@/config/api";


export default function detailBudget() {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();
  const budget = useParams();

  // États pour les détails de budgets
  const [dBudgets, setDBudgets] = useState<IDetailBudget[]>([]);
  const [dBudgetsLoading, setDBudgetsLoading] = useState(false);
  const [dBudgetsError, setDBudgetsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

   
  // État pour le filtrage par mois
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // État pour le titre du budget et la limite
  const [budgetTitle, setBudgetTitle] = useState<string>("");
  const [budgetLimit, setBudgetLimit] = useState<number>(0);


   // États pour la modal d'ajout
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newDetailBudgetAmount, setNewDetailBudgetAmount] = useState("");
   const [newDetailBudgetTitle, setNewDetailBudgetTitle] = useState("");
   const [newDetailBudgetDate, setNewDetailBudgetDate] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);


    // États pour la modal de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<IDetailBudget | null>(null);
  const [editDetailBudgetAmount, setEditDetailBudgetAmount] = useState("");
  const [editDetailBudgetTitle, setEditDetailBudgetTitle] = useState("");
  const [editDetailBudgetDate, setEditDetailBudgetDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  

  // Fonction pour récupérer les budgets de l'utilisateur
  const fetchUserDBudgets = async () => {
    if (!user || !budget.id) return;// Ne pas faire la requête si pas d'utilisateur
    setDBudgetsLoading(true);
    setDBudgetsError(null);

    try {
      const url = `${API_BASE_URL}/api/budget/${budget.id}`;
      const response = await axios.get(url, {
        withCredentials: true,
      });
      setDBudgets(response.data.detail_budget || response.data);
      setBudgetTitle(response.data.title || "Budget sans titre");
      setBudgetLimit(response.data.limit || 0); // Récupération de la limite
      console.log(response.data)
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des budgets:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setDBudgetsError('Non authentifié');
        } else if (error.response?.status === 404) {
          setDBudgetsError('Aucun budget trouvé');
          setDBudgets([]); // Pas d'erreur si pas de budgets
        } else {
          setDBudgetsError(error.response?.data?.message || 'Erreur lors de la récupération des budgets');
        }
      } else {
        setDBudgetsError('Erreur de connexion');
      }
    } finally {
      setDBudgetsLoading(false);
    }
  };

  // Fonction pour supprimer une ligne
  const deleteDetailBudget = async (detailBudgetId: string) => {
    if (!user) return;
    setDeletingId(detailBudgetId);
    setDeleteError(null);

    try {
      const url = `${API_BASE_URL}/api/detailbudget/${detailBudgetId}`;
      await axios.delete(url, {
        withCredentials: true,
      });
      // Rafraîchir la liste après suppression
      await fetchUserDBudgets();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du budget:', error);
      setDeleteError('Erreur lors de la suppression du budget');
    } finally {
      setDeletingId(null);
    }
  };

  // Fonction pour calculer le total actuel
  const calculateTotalAmount = () => {
    return dBudgets.reduce((total, budget) => {
      const amount = parseFloat(budget.amount.toString());
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  // Fonction pour vérifier si l'ajout dépassera la limite
  const willExceedLimit = (newAmount: number) => {
    const currentTotal = calculateTotalAmount();
    return budgetLimit > 0 && (currentTotal + newAmount) > budgetLimit;
  };

  // Fonction pour vérifier si la modification dépassera la limite
  const willExceedLimitOnEdit = (newAmount: number, editingId: number) => {
    const currentTotal = dBudgets
      .filter(budget => budget.id !== editingId)
      .reduce((total, budget) => {
        const amount = parseFloat(budget.amount.toString());
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
    
    return budgetLimit > 0 && (currentTotal + newAmount) > budgetLimit;
  };

      // Fonction pour créer un nouveau détail de budget (avec debug)
const createDetailBudget = async () => {
  if (!user || !newDetailBudgetAmount.trim() || !newDetailBudgetTitle || !newDetailBudgetAmount) {
    setSubmitError('Tous les champs obligatoires doivent être remplis');
    return;
  }
  
  const parsedAmount = parseFloat(newDetailBudgetAmount);
  if (isNaN(parsedAmount)) {
    setSubmitError('Le montant doit être un nombre valide');
    return;
  }

  // Vérification de la limite avant ajout
  if (willExceedLimit(parsedAmount)) {
    const currentTotal = calculateTotalAmount();
    const exceedAmount = (currentTotal + parsedAmount) - budgetLimit;
    setSubmitError(`Ajout impossible : cela dépasserait la limite de ${budgetLimit}€ de ${exceedAmount.toFixed(2)}€`);
    return;
  }
  
  setIsSubmitting(true);
  setSubmitError(null);
  const budgetcreateId = Number(budget.id);

  try {
     // Fonction pour obtenir le mois courant au format YYYY-MM
     const getCurrentMonth = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 car getMonth() retourne 0-11
      return `${year}-${month}`;
    };
  
    
    if (isNaN(budgetcreateId)) {
      setSubmitError('ID de budget invalide');
      return;
    }

    const url = `${API_BASE_URL}/api/detailbudget`;
    const payload = {
      amount: parsedAmount,
      title: newDetailBudgetTitle.trim().substring(0, 255),
      date: getCurrentMonth(),
      budget_id: budgetcreateId
    };

    console.log('🔍 DEBUG - URL appelée:', url);
    console.log('🔍 DEBUG - Payload envoyé:', payload);

    const response = await axios.post(url, payload, {
      withCredentials: true,
    });
    
    console.log('✅ Réponse serveur:', response.data);
    
    // Rafraîchir la liste après création
    await fetchUserDBudgets();
    // Réinitialiser et fermer la modal
    setNewDetailBudgetAmount("");
    setNewDetailBudgetTitle("");
    setNewDetailBudgetDate("");
    setIsModalOpen(false);
  } catch (error) {
    console.error('❌ Erreur complète lors de la création:', error);
    
    if (axios.isAxiosError(error)) {
      console.log('🔍 DEBUG - Status de l\'erreur:', error.response?.status);
      console.log('🔍 DEBUG - Données de l\'erreur:', error.response?.data);
      console.log('🔍 DEBUG - URL appelée:', error.config?.url);
      console.log('🔍 DEBUG - Method:', error.config?.method);
      console.log('🔍 DEBUG - Payload envoyé:', error.config?.data);
      
      if (error.response?.status === 400) {
        setSubmitError('Données invalides. Vérifiez vos saisies.');
      } else if (error.response?.status === 404) {
        // 🔍 Erreur détaillée pour debug
        setSubmitError(`Budget non trouvé (ID: ${budgetcreateId}). Message serveur: ${error.response?.data?.message || 'Aucun message'}`);
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

      // Fonction pour ouvrir la modal de modification
// 🔧 CORRECTION SUPPLÉMENTAIRE : Améliorer openEditModal pour debug
const openEditModal = (detailBudget: IDetailBudget) => {
  console.log('🔍 Debug - detailBudget reçu dans openEditModal:', detailBudget);
  console.log('🔍 Debug - detailBudget.id:', detailBudget.id);
  
  setEditingBudget(detailBudget);
  setEditDetailBudgetAmount(detailBudget.amount.toString());
  setEditDetailBudgetTitle(detailBudget.title || "");
  setEditDetailBudgetDate(detailBudget.date || "");
  setUpdateError(null);
  setIsEditModalOpen(true);
};

  // Fonction pour fermer la modal de modification
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBudget(null);
    setEditDetailBudgetAmount("");
    setEditDetailBudgetTitle("");
    setEditDetailBudgetDate("");
    setUpdateError(null);
  };

  // Fonction pour modifier un détail de budget
  const updateDetailBudget = async () => {
    if (!user || !editingBudget || !editDetailBudgetAmount.trim() || !editDetailBudgetTitle || !editDetailBudgetAmount) {
      setUpdateError('Tous les champs obligatoires doivent être remplis');
      return;
    }

    // 🔍 VÉRIFICATION AJOUTÉE : S'assurer que l'ID existe
    if (!editingBudget.id) {
      setUpdateError('ID du détail de budget manquant');
      console.error('❌ editingBudget.id est undefined:', editingBudget);
      return;
    }

    const parsedAmount = parseFloat(editDetailBudgetAmount);
    if (isNaN(parsedAmount)) {
      setUpdateError('Le montant doit être un nombre valide');
      return;
    }

    // Vérification de la limite avant modification
    if (willExceedLimitOnEdit(parsedAmount, editingBudget.id)) {
      const currentTotalWithoutEdit = dBudgets
        .filter(budget => budget.id !== editingBudget.id)
        .reduce((total, budget) => {
          const amount = parseFloat(budget.amount.toString());
          return total + (isNaN(amount) ? 0 : amount);
        }, 0);
      const exceedAmount = (currentTotalWithoutEdit + parsedAmount) - budgetLimit;
      setUpdateError(`Modification impossible : cela dépasserait la limite de ${budgetLimit}€ de ${exceedAmount.toFixed(2)}€`);
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

      const budgetId = Number(budget.id); // 👈 récupéré automatiquement
      if (isNaN(budgetId)) {
        setUpdateError('ID de budget invalide');
        return;
      }

      // 🔧 CORRECTION : S'assurer que l'ID est bien formaté
      const detailBudgetId = Number(editingBudget.id);
      if (isNaN(detailBudgetId)) {
        setUpdateError('ID du détail de budget invalide');
        return;
      }


      const url = `${API_BASE_URL}/api/detailbudget/${detailBudgetId}`;
      const payload = {
        amount: parsedAmount,
        title: editDetailBudgetTitle.trim().substring(0, 255),
        date: formatDateForDB(editDetailBudgetDate),
        budget_id: budgetId
      };

      const response = await axios.put(url, payload, {
        withCredentials: true,
      });
      
      await fetchUserDBudgets();
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

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté et que le chargement est terminé
    if (!user && !loading) {
      console.log('🔄 Utilisateur non connecté, redirection vers la page de connexion');
      router.push("/connexion");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Récupérer les budgets quand l'utilisateur est chargé
    if (user && !loading) {
      fetchUserDBudgets();
     // Initialiser avec le mois courant
     const currentDate = new Date();
     const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
     setSelectedMonth(currentMonth);
   }
  }, [user, loading]);


  // Fonction pour grouper les budgets par mois
   const groupBudgetsByMonth = (budgets: IDetailBudget[]) => {
     const grouped: { [key: string]: IDetailBudget[] } = {};
     
     budgets.forEach((budget) => {
       if (budget.date) {
         // Extraire l'année-mois de la date (YYYY-MM)
         const monthKey = budget.date.substring(0, 7);
         if (!grouped[monthKey]) {
           grouped[monthKey] = [];
         }
         grouped[monthKey].push(budget);
       }
     });
     
     // Trier les mois par ordre décroissant (plus récent en premier)
        return Object.keys(grouped)
          .sort((a, b) => b.localeCompare(a))
          .reduce((acc, key) => {
            acc[key] = grouped[key].sort((a, b) => b.date.localeCompare(a.date));
            return acc;
          }, {} as { [key: string]: IDetailBudget[] });
      };

       // Fonction pour calculer le total d'un mois
       const calculateMonthTotal = (budgets: IDetailBudget[]) => {
         return budgets.reduce((total, budget) => {
           const amount = parseFloat(budget.amount.toString());
           return total + (isNaN(amount) ? 0 : amount);
         }, 0);
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

       // Grouper les budgets par mois
       const groupedBudgets = groupBudgetsByMonth(dBudgets);
       const availableMonths = Object.keys(groupedBudgets);

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
      const filteredBudgets = selectedMonth ? groupedBudgets[selectedMonth] || [] : dBudgets;

      // Calculer les statistiques pour l'affichage
      const currentTotal = calculateTotalAmount();
      const remainingAmount = budgetLimit > 0 ? budgetLimit - currentTotal : 0;
      const isOverLimit = budgetLimit > 0 && currentTotal > budgetLimit;
      const progressPercentage = budgetLimit > 0 ? Math.min((currentTotal / budgetLimit) * 100, 100) : 0;

  // Afficher le loading pendant le chargement de l'utilisateur
  if (loading) {
    return (
      <p className="min-h-screen flex items-center justify-center">
        Chargement en cours...
      </p>
    );
  }

  // Si pas d'utilisateur après le chargement, ne pas afficher la page
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
        {/* Section des budgets */}
        <section className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Détails du Budget de {budgetTitle}</h3>
            <div className="flex gap-2">
            <button type="button"
              onClick={fetchUserDBudgets}
              className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 text-sm"
              disabled={dBudgetsLoading}
            >
              {dBudgetsLoading ? 'Actualisation...' : 'Actualiser'}
            </button>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={isOverLimit}
                className={`px-3 py-1 text-white rounded text-sm ${
                  isOverLimit 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                }`}
                title={isOverLimit ? "Impossible d'ajouter : limite dépassée" : "Ajouter une nouvelle transaction"}
              >
                Ajouter
              </button>
          </div>
          </div>

          {/* Indicateur de limite et progression */}
          {budgetLimit > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-medium text-gray-800">Suivi du Budget</h4>
                <div className="text-right">
                  <p className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
                    {currentTotal}€ / {budgetLimit}€
                  </p>
                  {isOverLimit && (
                    <p className="text-xs text-red-500">
                      Dépassement de {(currentTotal - budgetLimit)}€
                    </p>
                  )}
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isOverLimit 
                      ? 'bg-red-500' 
                      : progressPercentage > 80 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${progressPercentage}%`,
                    minWidth: progressPercentage > 0 ? '4px' : '0'
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className={`${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
                  {progressPercentage.toFixed(1)}% utilisé
                </span>
                {!isOverLimit && (
                  <span className="text-gray-600">
                    Restant: {remainingAmount.toFixed(2)}€
                  </span>
                )}
              </div>

              {isOverLimit && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ Budget dépassé ! Aucun nouvel ajout possible.
                  </p>
                </div>
              )}
            </div>
          )}
          

          {/* chargement des budgets */}
          {dBudgetsLoading && (
            <p className="text-gray-600 italic">Chargement des budgets...</p>
          )}

          {/* Affichage des erreurs */}
          {dBudgetsError && (
            <p className="text-red-500 bg-red-50 p-3 rounded border">
              {dBudgetsError}
            </p>
          )}

          {/* Liste des budgets */}
          {!dBudgetsLoading && !dBudgetsError && (
            <div className="space-y-6">
              {selectedMonth ? (
                // Affichage pour un mois spécifique
                <div>
                  <div className="space-y-3">
                    {filteredBudgets.length > 0 ? (
                      filteredBudgets.map((detail_budget) => (
                        <div
                          key={detail_budget.id}
                          className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          <div className="grid grid-cols-4 gap-4 items-center">
                            <span className="font-medium text-gray-800">{detail_budget.date}</span>
                            <span className="font-medium text-gray-800">{parseFloat(detail_budget.amount.toString()).toFixed(2)}€</span>
                            <span className="font-medium text-gray-800">{detail_budget.title}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => openEditModal(detail_budget)}
                              className="bg-blue-500 px-3 py-1 rounded text-white text-sm hover:bg-blue-600 transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteDetailBudget(String(detail_budget.id))}
                              disabled={!!deletingId}
                              className="bg-red-500 px-3 py-1 rounded text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {deletingId === String(detail_budget.id) ? 'Suppression...' : 'Supprimer'}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg">
                        Aucune transaction trouvée pour ce mois.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Affichage groupé par mois (vue d'ensemble)
                <div>
                  {Object.keys(groupedBudgets).length > 0 ? (
                    Object.keys(groupedBudgets).map((monthKey) => {
                      const monthBudgets = groupedBudgets[monthKey];
                      const monthTotal = calculateMonthTotal(monthBudgets);
                      return (
                        <div key={monthKey} className="mb-8">
                          <div className="bg-gray-100 p-4 rounded-lg border mb-4">
                            <div className="flex justify-between items-center">
                              <h4 className="text-lg font-semibold text-gray-800">
                                {formatMonthDisplay(monthKey)}
                              </h4>
                              <div className="text-right">
                                <p className="text-gray-700 font-medium">
                                  Total : <strong>{monthTotal.toFixed(2)}€</strong>
                                </p>
                                <p className="text-sm text-gray-600">
                                  {monthBudgets.length} transaction{monthBudgets.length > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {monthBudgets.slice(0, 5).map((detail_budget) => (
                              <div
                                key={detail_budget.id}
                                className="p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
                              >
                                <div className="grid grid-cols-4 gap-4 items-center text-sm">
                                  <span className="text-gray-700">{detail_budget.date}</span>
                                  <span className="font-medium">{parseFloat(detail_budget.amount.toString()).toFixed(2)}€</span>
                                  <span className="text-gray-800">{detail_budget.title}</span>
                                </div>
                              </div>
                            ))}
                            {monthBudgets.length > 5 && (
                              <button
                                onClick={() => setSelectedMonth(monthKey)}
                                className="w-full p-2 text-blue-600 hover:text-blue-800 text-sm font-medium border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                              >
                                Voir les {monthBudgets.length - 5} autres transactions...
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-600 italic bg-gray-50 p-4 rounded-lg">
                      Aucun budget trouvé. Vous n'avez pas encore créé de budgets.
                    </p>
                  )}
                </div>
              )}
             </div>
         )}
         
       </section>
     </div>
       

          {/* Modal d'ajout de budget */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Ajouter un détail de budget</h2>
            
            {/* Affichage de l'état du budget dans la modal */}
            {budgetLimit > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Budget actuel:</span>
                  <span className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-800'}`}>
                    {currentTotal}€ / {budgetLimit}€
                  </span>
                </div>
                {!isOverLimit && (
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Restant:</span>
                    <span className="font-medium text-green-600">
                      {remainingAmount}€
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                value={newDetailBudgetAmount}
                onChange={(e) => {
                  setNewDetailBudgetAmount(e.target.value);
                  // Réinitialiser l'erreur si l'utilisateur modifie le montant
                  if (submitError && submitError.includes('dépasserait la limite')) {
                    setSubmitError(null);
                  }
                }}
                className="w-full p-2 border rounded"
                placeholder="Ex: 100.50"
                step="0.01"
              />
              
              {/* Avertissement en temps réel */}
              {budgetLimit > 0 && newDetailBudgetAmount && !isNaN(parseFloat(newDetailBudgetAmount)) && (
                <div className="mt-2">
                  {willExceedLimit(parseFloat(newDetailBudgetAmount)) ? (
                    <p className="text-red-600 text-sm">
                      ⚠️ Ce montant dépasserait la limite de {((currentTotal + parseFloat(newDetailBudgetAmount)) - budgetLimit).toFixed(2)}€
                    </p>
                  ) : (
                    <p className="text-green-600 text-sm">
                      ✅ Reste après ajout: {(budgetLimit - currentTotal - parseFloat(newDetailBudgetAmount)).toFixed(2)}€
                    </p>
                  )}
                </div>
              )}
              
              {submitError && (
                <p className="text-red-500 text-sm mt-1">{submitError}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé
              </label>
              <input
                type="text"
                value={newDetailBudgetTitle}
                onChange={(e) => setNewDetailBudgetTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Ex: Nourriture"
              />
            </div>

          
            <div className="flex justify-end gap-2">
              <button
                type="button" onClick={() => {
                  setIsModalOpen(false);
                  setNewDetailBudgetAmount("");
                  setNewDetailBudgetTitle("");
                  setNewDetailBudgetDate("");
                  setSubmitError(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={createDetailBudget}
                disabled={
                  !!isSubmitting || 
                  !newDetailBudgetTitle.trim() || 
                  !newDetailBudgetAmount ||
                  (budgetLimit > 0 && !!newDetailBudgetAmount && !!willExceedLimit(parseFloat(newDetailBudgetAmount)))
                }
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification de budget */}
      {isEditModalOpen && editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Modifier le détail de budget</h2>
            
            {/* Affichage de l'état du budget dans la modal de modification */}
            {budgetLimit > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Budget actuel:</span>
                  <span className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-800'}`}>
                    {currentTotal}€ / {budgetLimit}€
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Montant actuel de cette ligne:</span>
                  <span className="font-medium text-blue-600">
                    {parseFloat(editingBudget.amount.toString())}€
                  </span>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                value={editDetailBudgetAmount}
                onChange={(e) => {
                  setEditDetailBudgetAmount(e.target.value);
                  // Réinitialiser l'erreur si l'utilisateur modifie le montant
                  if (updateError && updateError.includes('dépasserait la limite')) {
                    setUpdateError(null);
                  }
                }}
                className="w-full p-2 border rounded"
                placeholder="Ex: 100.50"
                step="0.01"
              />
              
              {/* Avertissement en temps réel pour la modification */}
              {budgetLimit > 0 && editingBudget?.id && editDetailBudgetAmount && !isNaN(parseFloat(editDetailBudgetAmount)) && (
                <div className="mt-2">
                  {willExceedLimitOnEdit(parseFloat(editDetailBudgetAmount ?? '0'), editingBudget.id) ? (
                    <p className="text-red-600 text-sm">
                      ⚠️ Cette modification dépasserait la limite
                    </p>
                  ) : (
                    <p className="text-green-600 text-sm">
                      ✅ Modification autorisée
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intitulé
              </label>
              <input
                type="text"
                value={editDetailBudgetTitle}
                onChange={(e) => setEditDetailBudgetTitle(e.target.value)}
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
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={updateDetailBudget}
                disabled={
                  !!isUpdating || 
                  !editDetailBudgetTitle.trim() || 
                  !editDetailBudgetAmount ||
                  (budgetLimit > 0 && !!editDetailBudgetAmount && !!editingBudget?.id && willExceedLimitOnEdit(parseFloat(editDetailBudgetAmount), editingBudget.id))
                }
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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