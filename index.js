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

// Convert organism name to taxon ID
app.get("/api/convert-name-to-id", async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Missing organism name" });

    try {
        const response = await axios.get(`https://api.ncbi.nlm.nih.gov/taxon/v1/search?name=${encodeURIComponent(name)}`);
        const taxonId = response.data.results[0]?.tax_id;
        if (!taxonId) throw new Error("Taxon ID not found");

        res.json({ taxon_id: taxonId });
    } catch (error) {
        res.status(500).json({ error: "Error fetching taxon ID" });
    }
});

// Fetch genome release dates
app.get("/api/get-release-dates", async (req, res) => {
    const { taxon_id } = req.query;
    if (!taxon_id) return res.status(400).json({ error: "Missing taxon ID
