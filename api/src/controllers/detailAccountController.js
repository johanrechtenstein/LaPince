import { Account, Detail_account } from "../models/index.js";
import { detailAccountSchema, updateDetailAccountSchema} from "../schemas/detail_account.js";


export async function createDetailAccount(req, res) {
  try {
    const { date, amount, title, type, account_id } = detailAccountSchema.parse(req.body);
    const account = await Account.findByPk(account_id);

    if (!account) {
      return res.status(404).json({ error: "Account not found. Please verify the provided 'account_id' property." });
    }

    const createdDetailAccount = await Detail_account.create({ date, amount, title, type, account_id });
    res.status(201).json(createdDetailAccount);
  } catch (error) {
    console.error('Error creating detail account:', error);
    res.status(500).json({ error: 'An error occurred while creating the detail account.' });
  }
}





export async function getAllDetailAccount(req, res) {
  const detailAccount = await Detail_account.findAll({ include: "tag" });
  res.json(detailAccount);
}


export async function getOneDetailAccount(req, res) {
  const detailAccount = await Detail_account.findByPk(req.params.id, { include: "tag" });
  if (!detailAccount) {
    return res.status(404).json({ error: "detail account not found." });
  }
  res.json(detailAccount);
}



export async function updateDetailAccount(req, res) {
  const detailAccountId = parseInt(req.params.id);
  if (!Number.isInteger(detailAccountId)) {
    return res.status(404).json({ error: `Detail account not found` });
  }
  const { date, amount, title, type, account_id } = ((updateDetailAccountSchema.safeParse(req.body)).data);
  const detailAccount = await Detail_account.findByPk(detailAccountId);
  if (!detailAccount) {
    return res.status(404).json({ error: `Detail account not found` });
  }
  if (account_id) {
    const account = await Account.findByPk(account_id);
    if (! account) {
      return res.status(404).json({ error: `Account not found` });
    }
  } 
  const updatedDetailAccount = await Detail_account.update({
    date,
    amount,
    title,
    type,
    account_id
  },{ where: { id: detailAccountId }});
  res.json(updatedDetailAccount);
}



export async function deleteDetailAccount(req, res) {
  const detailAccountId = parseInt(req.params.id);
  if (! Number.isInteger(detailAccountId)) {
    return res.status(404).json({ error: "Detail account not found" });
  }
  const detailAccount = await Detail_account.findByPk(detailAccountId);
  if (!detailAccount) {
    return res.status(404).json({ error: "Detail account not found" });
  }
  await detailAccount.destroy();
  res.status(204).end();
}



export async function getAllDetailAccountOfMember(req, res) {
  const accountId = parseInt(req.params.accountId);
  if (!Number.isInteger(accountId)) { return res.status(404).json({ error: "Invalid accountId." }); }
  const account = await Account.findByPk(accountId);
  if (!account) { return res.status(404).json({ error: "Account not found." });}
  const detailAccount = await Detail_account.findAll({ where: { account_id: accountId }});
  res.json(detailAccount);
}





