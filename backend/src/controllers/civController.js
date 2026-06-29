const { listCivilizations } = require("../models/Civilization");

async function getCivilizations(req, res) {
  const civs = await listCivilizations();
  const sorted = civs.sort((a, b) => b.power - a.power);
  res.json(sorted);
}

module.exports = { getCivilizations };
