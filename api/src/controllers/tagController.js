import { Tag, Detail_account, Detail_budget } from "../models/index.js";


export async function getAllTag(req, res) {
  const tag = await Tag.findAll();
  return res.json(tag);
}

export async function getOneTag(req, res) {
  const tagId = parseInt(req.params.id);
  if (! Number.isInteger(tagId)) {
    return res.status(404).json({ error: "Tag not found." });
  }
  const tag = await Tag.findByPk(tagId);
  if (! tag) {
    return res.status(404).json({ error: "Tag not found." });
  }
  res.json(tag);
}

export async function deleteTag(req, res) {
  const tagId = parseInt(req.params.id);
  if (! Number.isInteger(tagId)) {
    return res.status(404).json({ error: "Tag not found." });
  }

  const tag = await Tag.findByPk(tagId);
  if (! tag) {
    return res.status(404).json({ error: "Tag not found." });
  }

  await tag.destroy();

  res.status(204).end();
}

export async function createTag(req, res) {
  try {
      const { title, detail_account_id, detail_budget_id } = req.body;
      console.log(req.body);
      const createdTag = await Tag.create({title, detail_account_id, detail_budget_id});
      res.status(201).json(createdTag);
  } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateTag(req, res) {
  const tagId = parseInt(req.params.id);
  if (! Number.isInteger(tagId)) {
    return res.status(404).json({ error: "Tag not found." });
  }
  const tag = await Tag.findByPk(tagId);
  if (! tag) {
    return res.status(404).json({ error: "Tag not found." });
  }
  const { title } = req.body;
  const updatedTag = await tag.update({
    title
  });
  res.json(updatedTag);
}



