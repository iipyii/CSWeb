// Normalizes courses.pdf_path for every row where it still carries the
// literal "uploads\..." Windows path (from import_courses.js's
// fullPath.replace("uploads/", "") never matching a backslash-separated
// path on Windows, so the prefix was silently left in place). Confirmed
// via real browser navigation that this causes an actual 404 — not just a
// cosmetic issue — because CourseSectionContent.jsx builds the download
// link as `http://localhost:5000/uploads/${pdf_path}`, producing a
// doubled "uploads/uploads/" that Chrome's own backslash normalization
// doesn't fix.
//
// Target format matches the csb import, which was done correctly from the
// start: forward slashes, no "uploads/" prefix (courses/bachelor/...).
import { prisma } from "../src/lib/prisma.js";

function normalize(pdfPath) {
  const forwardSlashed = pdfPath.replace(/\\/g, "/");
  return forwardSlashed.replace(/^uploads\//i, "");
}

async function main() {
  const rows = await prisma.courses.findMany({
    where: { pdf_path: { not: null } },
  });

  let fixed = 0;
  let skipped = 0;

  for (const row of rows) {
    const normalized = normalize(row.pdf_path);
    if (normalized === row.pdf_path) {
      skipped++;
      continue;
    }
    await prisma.courses.update({
      where: { id: row.id },
      data: { pdf_path: normalized },
    });
    console.log(`fixed: id=${row.id} "${row.pdf_path}" -> "${normalized}"`);
    fixed++;
  }

  console.log(`\ndone: fixed ${fixed}, already-normalized/skipped ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
