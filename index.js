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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
