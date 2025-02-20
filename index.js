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

app.get("/api/get-release-dates", async (req, res) => {
    const { taxon_id } = req.query;
    if (!taxon_id) return res.status(400).json({ error: "Missing taxon ID" });

    try {
        const response = await fetch(`https://api.ncbi.nlm.nih.gov/datasets/v1/genome/taxon/${taxon_id}`);
        const data = await response.json();

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
