const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express(); // <-- FIXED: Initialize Express

const corsOptions = {
  origin: "https://genomevisualizer-frontend.vercel.app", // Allow only your frontend
  methods: "GET,POST",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ✅ FIXED: Convert organism name to Taxon ID
app.get("/api/convert-name-to-id", async (req, res) => {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: "Missing organism name" });

    try {
        const response = await axios.get(`https://api.ncbi.nlm.nih.gov/datasets/v1/taxon/name/${name}`);
        const data = response.data;

        if (!data.taxon_id) return res.status(404).json({ error: "Organism not found" });

        res.json({ taxon_id: data.taxon_id });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ FIXED: Fetch genome release dates
app.get("/api/get-release-dates", async (req, res) => {
    const { taxon_id } = req.query;
    if (!taxon_id) return res.status(400).json({ error: "Missing taxon ID" });

    try {
        const response = await axios.get(`https://api.ncbi.nlm.nih.gov/datasets/v1/genome/taxon/${taxon_id}`);
        const data = response.data;

        if (!data || !data.reports) return res.status(404).json({ error: "No genome data found" });

        const releaseDates = data.reports.map((r) => ({
            year: new Date(r.assembly_info.release_date).getFullYear(),
            count: 1,
        }));

        res.json({ release_dates: releaseDates });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
