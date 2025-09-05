import { Budget, Detail_budget } from "../models/index.js";
import { detailBudgetSchema, updateDetailBudgetSchema} from "../schemas/detail_budget.js";

export async function createDetailBudget(req, res) {
  try {
    const { amount, title, date, budget_id } = detailBudgetSchema.parse(req.body);

    const budget = await Budget.findByPk(budget_id);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found. Please verify the provided 'budget_id' property." });
    }

    const createdDetailBudget = await Detail_budget.create({ amount, title, date, budget_id });
    res.status(201).json(createdDetailBudget);
  } catch (error) {
    console.error('Error creating detail budget:', error);
    res.status(500).json({ error: 'An error occurred while creating the detail budget.' });
  }
}

export async function getAllDetailBudget(req, res) {
  try {
    const detailBudget = await Detail_budget.findAll({ include: "tag" });
    res.json(detailBudget);
  } catch (error) {
    console.error('Error fetching detail budgets:', error);
    res.status(500).json({ error: 'An error occurred while fetching the detail budgets.' });
  }
}

export async function getOneDetailBudget(req, res) {
  try {
    const detailBudget = await Detail_budget.findByPk(req.params.id,{ include: "tag" });
    if (!detailBudget) {
      return res.status(404).json({ error: "Detail budget not found." });
    }
    res.json(detailBudget);
  } catch (error) {
    console.error('Error fetching detail budget:', error);
    res.status(500).json({ error: 'An error occurred while fetching the detail budget.' });
  }
}

export async function updateDetailBudget(req, res) {
  try {
    const detailBudgetId = parseInt(req.params.id);
    if (!Number.isInteger(detailBudgetId)) {
      return res.status(400).json({ error: "Invalid detail budget ID." });
    }

    const { amount, title, date, budget_id } = (updateDetailBudgetSchema.safeParse(req.body)).data;
    const detailBudget = await Detail_budget.findByPk(detailBudgetId);
    if (!detailBudget) {
      return res.status(404).json({ error: "Detail budget not found." });
    }

    if (budget_id) {
      const budget = await Budget.findByPk(budget_id);
      if (!budget) {
        return res.status(404).json({ error: "Budget not found." });
      }
    }

    const [updated] = await Detail_budget.update(
      { amount, title, date, budget_id },
      { where: { id: detailBudgetId } }
    );

    if (updated) {
      const updatedDetailBudget = await Detail_budget.findByPk(detailBudgetId);
      res.json(updatedDetailBudget);
    } else {
      res.status(404).json({ error: "Detail budget not found." });
    }
  } catch (error) {
    console.error('Error updating detail budget:', error);
    res.status(500).json({ error: 'An error occurred while updating the detail budget.' });
  }
}

export async function deleteDetailBudget(req, res) {
  try {
    const detailBudgetId = parseInt(req.params.id);
    if (!Number.isInteger(detailBudgetId)) {
      return res.status(400).json({ error: "Invalid detail budget ID." });
    }

    const detailBudget = await Detail_budget.findByPk(detailBudgetId);
    if (!detailBudget) {
      return res.status(404).json({ error: "Detail budget not found." });
    }

    await detailBudget.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting detail budget:', error);
    res.status(500).json({ error: 'An error occurred while deleting the detail budget.' });
  }
}

export async function getAllDetailBudgetOfMember(req, res) {
  try {
    const budgetId = parseInt(req.params.budgetId);
    if (!Number.isInteger(budgetId)) {
      return res.status(400).json({ error: "Invalid budget ID." });
    }

    const budget = await Budget.findByPk(budgetId);
    if (!budget) {
      return res.status(404).json({ error: "Budget not found." });
    }

    const detailBudget = await Detail_budget.findAll({ where: { budget_id: budgetId } });
    res.json(detailBudget);
  } catch (error) {
    console.error('Error fetching detail budgets of member:', error);
    res.status(500).json({ error: 'An error occurred while fetching the detail budgets of the member.' });
  }
}
