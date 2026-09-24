import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAllPdfPaths() {
  console.log("Fixing all pdf_path in database...");

  const sections = await prisma.program_sections.findMany();
  let updatedCount = 0;

  for (const s of sections) {
    if (!s.pdf_path) continue;

    let normalized = s.pdf_path.replace(/\\/g, "/").trim();
    if (!normalized.startsWith("/")) {
      normalized = "/" + normalized;
    }
    if (!normalized.startsWith("/uploads/")) {
      normalized = "/uploads" + normalized;
    }

    if (normalized !== s.pdf_path) {
      await prisma.program_sections.update({
        where: { id: s.id },
        data: { pdf_path: normalized }
      });
      console.log(`Updated ID ${s.id}: "${s.pdf_path}" -> "${normalized}"`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully normalized ${updatedCount} pdf_paths in database!`);
}

fixAllPdfPaths()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
