import { prisma } from "../lib/prisma.js";


export const getDownloads = async (req, res) => {

  try {

    const files = await prisma.downloads.findMany({
      orderBy: { created_at: "desc" }
    });

    res.json(files);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "failed to fetch downloads" });

  }

};



export const getDownloadsByAudience = async (req, res) => {

  try {

    const { audience } = req.params;

    const files = await prisma.downloads.findMany({
      where: { audience },
      orderBy: [
        { category: "asc" },
        { created_at: "desc" }
      ]
    });

    res.json(files);

  } catch (error) {

    console.error("DOWNLOAD ERROR:", error);

    res.status(500).json({
      error: "failed to fetch downloads",
      message: error.message
    });

  }

};