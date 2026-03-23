let pdfParse;
try {
  pdfParse = require("pdf-parse");
} catch (e) {
  // Fallback for some environments where require("pdf-parse") might fail or behave weirdly
  pdfParse = require("pdf-parse/lib/pdf-parse.js");
}

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text.trim();
  } catch (error) {
    throw new Error("Failed to parse PDF: " + error.message);
  }
}

module.exports = { extractTextFromPDF };
