
import { Budget, User, Account } from "../models/index.js";
import { budgetSchema, updateBudgetSchema } from "../schemas/budget.js";

export async function createBudget(req, res) {
  const { title, user_id,limit, date, account_id } = budgetSchema.parse(req.body);
  const user = await User.findByPk(user_id);
  if (!user) {
    return res.status(404).json({ error: "User not found. Please verify the provided 'user_id' property." });
  }
  const account = await Account.findByPk(account_id);
  if (!account) {
    return res.status(404).json({ error: "Account not found. Please verify the provided 'user_id' property." });
  }
  const createdBudget = await Budget.create({ title, user_id, limit, date, account_id });
  res.status(201).json(createdBudget);
}



export async function getAllBudget(req, res) {
  const budget = await Budget.findAll({ include: "detail_budget" });
  res.json(budget);
}

export async function getOneBudget(req, res) {
  const budget = await Budget.findByPk(req.params.id, { include: "detail_budget" });
  if (!budget) {
    return res.status(404).json({ error: "budget not found." });
  }
  res.json(budget);
}


export async function updateBudget(req, res) {
  const budgetId = parseInt(req.params.id);
  if (!Number.isInteger(budgetId)) {
    return res.status(404).json({ error: `Budget is not a number` });
  }

  //Vous essayez de déstructurer directement le résultat de la validation plutôt que les données validées. La méthode .safeParse() de Zod ne renvoie pas un objet contenant directement title, user_id, limit, etc. Elle renvoie un objet de résultat qui a deux propriétés principales : success et soit data, soit error.

  //Pour que la validation avec Zod fonctionne correctement, vous devez d'abord obtenir le résultat de la validation, puis extraire les données du champ data de ce résultat.


  const { title, user_id, limit, date, account_id } = (updateBudgetSchema.safeParse(req.body)).data;
  const budget = await Budget.findByPk(budgetId);
  if (!budget) {
    return res.status(404).json({ error: `Budget not found` });
  }
  if (user_id) {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: `User not found` });
    }
  }
  if (account_id) {
    const account = await Account.findByPk(account_id);
    if (!account) {
      return res.status(404).json({ error: `Account not found` });
    }
  }
  const updatedBudget = await budget.update({
    title,
    user_id,
    limit,
    date,
    account_id
  });
  res.json(updatedBudget);
}


export async function deleteBudget(req, res) {
  const budgetId = parseInt(req.params.id);
  if (!Number.isInteger(budgetId)) {
    return res.status(404).json({ error: "Budget not found" });
  }
  const budget = await Budget.findByPk(budgetId);
  if (!budget) {
    return res.status(404).json({ error: "Budget not found" });
  }
  await budget.destroy();
  res.status(204).end();
}

export async function getAllBudgetOfUser(req, res) {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {return res.status(404).json({ error: "Invalid userId." });}
  const user = await User.findByPk(userId);
  if (!user) {return res.status(404).json({ error: "User not found." });}
  const budget = await Budget.findAll({ where: { user_id: userId } });
  res.json(budget);
}

export const getAllBudgetOfAccount = async (req, res) => {
  try {
    const accountId = parseInt(req.params.accountId);
    if (isNaN(accountId)) {return res.status(404).json({ error: "Invalid userId." });}
    const account = await Account.findByPk(accountId);
    if (!account) {return res.status(404).json({ error: "account not found." });}
    const budget = await Budget.findAll({ where: { account_id: accountId } });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};