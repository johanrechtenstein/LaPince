// components/BudgetList.js

import React from 'react';
import Link from 'next/link';

const BudgetList = ({
  budgets,
  isLoading,
  openEditBModal,
  deleteBudget,
  deletingId,
  accountId
}) => {
  if (isLoading) {
    return (
      <div className="bg-gray-400 p-2 rounded-full text-white text-center mt-3">
        Chargement des budgets...
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="text-gray-500 italic text-sm mt-3 flex items-center">
        Aucun budget associé.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:grid grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
      {budgets.map((budget) => (
        <div key={budget.id} className="p-4 bg-white rounded-lg border shadow-sm flex flex-col items-start text-gray-800">
          <h4 className="font-semibold mb-2 text-md">
            {budget.title || 'Budget sans titre'}
          </h4>
          <p className="mb-3">Limite: <strong className="font-bold">{parseFloat(budget.limit).toFixed(2)}€</strong></p>
          <div className="flex flex-row justify-center w-full gap-2 mt-auto">
            <Link href={`/userPage/budget/${budget.id}`} className="flex-1">
              <div className="w-full bg-green-700 py-2 px-3 rounded-lg text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-green-600 text-center text-sm">
                Détails
              </div>
            </Link>
            <button
              onClick={() => openEditBModal(budget)}
              className="flex-1 bg-green-700 py-2 px-3 rounded-lg text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-green-500 text-center text-sm"
            >
              Modifier
            </button>
            <button
              onClick={() => deleteBudget(String(budget.id), accountId)}
              disabled={deletingId === String(budget.id)}
              className="bg-red-500 py-2 px-3 rounded-lg text-white transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-red-600 text-center text-sm disabled:opacity-50"
            >
              {deletingId === String(budget.id) ? '...' : 'X'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BudgetList;