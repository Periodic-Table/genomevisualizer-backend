const express = require("express");
const axios = require("axios");
const cors = require("cors");

const cors = require("cors");

const corsOptions = {
  origin: "https://genomevisualizer-frontend.vercel.app", // Allow only your frontend
  methods: "GET,POST",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));

app.use(express.json());

const PORT = process.env.PORT || 3001;


app.get("/api/convert-name-to-id", async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: "Missing organism name" });

  try {
    const response = await fetch(`https://api.ncbi.nlm.nih.gov/datasets/v1/taxon/name/${name}`);
    const data = await response.json();

    if (!data.taxon_id) return res.status(404).json({ error: "Organism not found" });

    res.json({ taxon_id: data.taxon_id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Fetch genome release dates
app.get("/api/get-release-dates", async (req, res) => {
    const { taxon_id } = req.query;
    if (!taxon_id) return res.status(400).json({ error: "Missing taxon ID
