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

app.get("/api/get-release-dates", async (req, res) => {
    const { taxon_id } = req.query;
    if (!taxon_id) return res.status(400).json({ error: "Missing taxon ID" });

    try {
        const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=genome&term=${taxon_id}[Taxonomy ID]&retmode=json`);
        const data = await response.json();

        if (!data.esearchresult || !data.esearchresult.idlist.length) {
            return res.status(404).json({ error: "No genome data found" });
        }

        const genomeIds = data.esearchresult.idlist;

        const genomeDataPromises = genomeIds.map(async (id) => {
            const summaryResponse = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=genome&id=${id}&retmode=json`);
            const summaryData = await summaryResponse.json();

            const genomeInfo = summaryData.result[id];

            return {
                year: genomeInfo?.create_date ? new Date(genomeInfo.create_date).getFullYear() : null,
                count: 1
            };
        });

        const releaseDates = await Promise.all(genomeDataPromises);
        res.json({ release_dates: releaseDates });
    } catch (error) {
        console.error("Error fetching genome data:", error);
        res.status(500).json({ error: "Server error" });
    }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
