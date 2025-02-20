const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: "https://genomevisualizer-frontend.vercel.app",
  methods: "GET,POST",
  allowedHeaders: "Content-Type",
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/convert-name-to-id", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Missing organism name" });
  }

  try {
    const response = await axios.get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=taxonomy&term=${encodeURIComponent(name)}&retmode=json`
    );
    const data = response.data;

    if (!data.esearchresult || !data.esearchresult.idlist || data.esearchresult.idlist.length === 0) {
      return res.status(404).json({ error: "Organism not found" });
    }

    res.json({ taxon_id: data.esearchresult.idlist[0] });
  } catch (error) {
    console.error("Error fetching taxon ID:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Fetch genome release dates
app.get("/api/get-release-dates", async (req, res) => {
    const { taxon_id } = req.query;
    if (!taxon_id) return res.status(400).json({ error: "Missing taxon ID" });

    try {
        // **Step 1: Fetch genome assembly IDs for the organism**
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=assembly&term=txid${taxon_id}[Organism]&retmode=json&retmax=100`;
        const searchResponse = await axios.get(searchUrl);
        const searchData = searchResponse.data;

        if (!searchData.esearchresult || !searchData.esearchresult.idlist.length) {
            return res.status(404).json({ error: "No genome assemblies found" });
        }

        // **Step 2: Get summaries of those genome assemblies**
        const idList = searchData.esearchresult.idlist.join(",");
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=assembly&id=${idList}&retmode=json`;
        const summaryResponse = await axios.get(summaryUrl);
        const summaryData = summaryResponse.data;

        // **Step 3: Extract release dates**
        const releaseDates = Object.values(summaryData.result)
            .filter(entry => entry.create_date) // Ensure there's a valid date
            .map(entry => ({
                year: new Date(entry.create_date).getFullYear(),
                count: 1,
            }));

        res.json({ release_dates: releaseDates });
    } catch (error) {
        console.error("Error fetching genome data:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
