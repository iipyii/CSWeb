import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const baseDir = "./uploads/courses";

function getSection(filename) {

  const name = filename.toLowerCase()

  if (
    name.includes("appendix") ||
    name.includes("edit") ||
    name.includes("major")
  ) {
    return null
  }

  // const patterns = [
  //   /(\d+)_/,       // 1_course
  //   /_(\d+)/,       // cs59_1
  //   /-(\d+)/,       // bsc54-5
  //   /(\d+)\.pdf/    // phd1.pdf
  // ]
  const patterns = [
    /_(\d+)\.pdf$/,     // _4.pdf  -> cs59_4.pdf
    /-(\d+)\.pdf$/,     // -5.pdf  -> bsc54-5.pdf
    /(\d+)\.pdf$/       // phd1.pdf
  ]

  for (const p of patterns) {
    const m = name.match(p)
    if (m) return parseInt(m[1])
  }

  return null
}

function cleanText(text) {
  if (!text) return ""

  return text
    .replace(/\x00/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function scan(dir) {

  const items = fs.readdirSync(dir)

  for (const item of items) {

    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      await scan(fullPath)
      continue
    }

    if (!item.endsWith(".pdf")) continue

    console.log("Processing:", fullPath)

    const parts = fullPath.split(path.sep)

    const degreeSlug = parts[2]
    const programSlug = parts[3]
    const year = parseInt(parts[4])

    const sectionNo = getSection(item)

    console.log({
      degreeSlug,
      programSlug,
      year,
      sectionNo
    })

    // extract text
    const output = execSync(
      `python scripts/extract_pdf.py "${fullPath}"`
    ).toString()

    const { content } = JSON.parse(output)
    const cleanContent = cleanText(content)

    // find degree
    const degree = await prisma.degrees.findUnique({
      where: { slug: degreeSlug }
    })

    if (!degree) {
      console.log("degree not found:", degreeSlug)
      continue
    }

    // find program
    const program = await prisma.programs.findFirst({
      where: {
        slug: programSlug,
        degreeId: degree.id
      }
    })

    if (!program) {
      console.log("program not found:", programSlug)
      continue
    }

    // find version
    const version = await prisma.program_versions.upsert({
      where: {
        programId_year: {
          programId: program.id,
          year: year
        }
      },
      update: {},
      create: {
        programId: program.id,
        year: year
      }
    })

    // save section
    await prisma.program_sections.create({
      data: {
        versionId: version.id,
        section_no: sectionNo ?? 0,
        title: item,
        content: cleanContent,
        order_index: sectionNo ?? 999
      }
    })

    console.log("saved")
  }
}

scan(baseDir)