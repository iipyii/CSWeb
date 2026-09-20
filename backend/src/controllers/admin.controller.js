import { prisma } from "../lib/prisma.js";

export const getDashboardOverview = async (req, res) => {
  try {
    const [newsCount, curriculumCount, filesCount, adminCount] = await Promise.all([
      prisma.news.count(),
      prisma.programs.count(),
      prisma.downloads.count(),
      prisma.users.count({ where: { role: "admin" } })
    ]);

    // ดึงกิจกรรมล่าสุดจากข่าวและเอกสาร
    const [latestNews, latestDownloads] = await Promise.all([
      prisma.news.findMany({
        take: 3,
        orderBy: { created_at: "desc" },
        select: { id: true, title: true, created_at: true }
      }),
      prisma.downloads.findMany({
        take: 3,
        orderBy: { created_at: "desc" },
        select: { id: true, title: true, created_at: true }
      })
    ]);

    const activities = [
      ...latestNews.map(item => ({
        id: `news-${item.id}`,
        title: `เพิ่มข่าว: ${item.title}`,
        time: item.created_at,
        type: "news",
        color: "bg-blue-500"
      })),
      ...latestDownloads.map(item => ({
        id: `doc-${item.id}`,
        title: `อัปเดตไฟล์: ${item.title}`,
        time: item.created_at,
        type: "download",
        color: "bg-emerald-500"
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    // Traffic data
    const traffic = [
      { name: 'จ.', v: 420 },
      { name: 'อ.', v: 380 },
      { name: 'พ.', v: 510 },
      { name: 'พฤ.', v: 320 },
      { name: 'ศ.', v: 610 },
      { name: 'ส.', v: 290 },
      { name: 'อา.', v: 230 }
    ];

    res.json({
      stats: {
        newsCount,
        curriculumCount,
        filesCount,
        adminCount
      },
      activities,
      traffic
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
