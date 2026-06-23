const fs = require("fs");
const path = require("path");

const submissionsDir = path.join(process.cwd(), "submissions");
const outputFile = path.join(process.cwd(), "data", "grades.json");

function findJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return findJsonFiles(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      return [fullPath];
    }

    return [];
  });
}

function normalizeSubmission(raw, filePath) {
  const required = [
    "labId",
    "studentName",
    "githubUser",
    "score",
    "status",
    "date",
    "feedback",
    "details"
  ];

  for (const field of required) {
    if (!(field in raw)) {
      throw new Error(`${filePath} no tiene el campo requerido: ${field}`);
    }
  }

  const score = Number(raw.score);

  if (Number.isNaN(score) || score < 0 || score > 100) {
    throw new Error(`${filePath} tiene una nota inválida: ${raw.score}`);
  }

  return {
    labId: String(raw.labId),
    labTitle: String(raw.labTitle || ""),
    studentName: String(raw.studentName),
    githubUser: String(raw.githubUser),
    score,
    status: String(raw.status),
    date: String(raw.date),
    feedback: String(raw.feedback),
    details: Array.isArray(raw.details) ? raw.details : [],
    sourceFile: path.relative(process.cwd(), filePath).replaceAll("\\", "/")
  };
}

function main() {
  const files = findJsonFiles(submissionsDir);
  const grades = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const raw = JSON.parse(content);
    grades.push(normalizeSubmission(raw, file));
  }

  grades.sort((a, b) => {
    if (a.labId !== b.labId) return a.labId.localeCompare(b.labId);
    return a.studentName.localeCompare(b.studentName);
  });

  fs.writeFileSync(outputFile, JSON.stringify(grades, null, 2) + "\n", "utf8");

  console.log(`Generado ${outputFile} con ${grades.length} entregas.`);
}

main();