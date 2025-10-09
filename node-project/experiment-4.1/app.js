const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// In-memory storage
let cards = [];
let nextId = 1;

// GET - List all cards
app.get("/cards", (req, res) => {
  res.json(cards);
});

// POST - Add a new card
app.post("/cards", (req, res) => {
  const { suit, value } = req.body;
  if (!suit || !value) {
    return res.status(400).json({ error: "Suit and value are required" });
  }
  const newCard = { id: nextId++, suit, value };
  cards.push(newCard);
  res.status(201).json(newCard);
});

// GET - Retrieve card by ID
app.get("/cards/:id", (req, res) => {
  const cardId = parseInt(req.params.id);
  const card = cards.find((c) => c.id === cardId);
  if (!card) {
    return res.status(404).json({ error: "Card not found" });
  }
  res.json(card);
});

// DELETE - Remove card by ID
app.delete("/cards/:id", (req, res) => {
  const cardId = parseInt(req.params.id);
  const index = cards.findIndex((c) => c.id === cardId);
  if (index === -1) {
    return res.status(404).json({ error: "Card not found" });
  }
  const deletedCard = cards.splice(index, 1);
  res.json({ message: "Card deleted successfully", card: deletedCard[0] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
