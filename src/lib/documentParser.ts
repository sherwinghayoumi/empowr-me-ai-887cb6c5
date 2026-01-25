import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// PDF.js Worker Setup - Worker direkt aus npm-Paket laden
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// Text aus DOCX extrahieren
export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// Text aus PDF extrahieren
export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(' ');
    fullText += text + '\n\n';
  }
  return fullText;
}

// Automatische Erkennung und Extraktion
export async function extractText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return extractTextFromPdf(file);
  if (name.endsWith('.docx')) return extractTextFromDocx(file);
  if (name.endsWith('.txt')) return file.text();
  throw new Error('Nicht unterstütztes Format. Erlaubt: PDF, DOCX, TXT');
}

// Alle 3 Dokumente verarbeiten
export async function parseAllDocuments(files: {
  cv: File | null;
  selfAssessment: File | null;
  managerAssessment: File | null;
}) {
  const [cvText, selfText, managerText] = await Promise.all([
    files.cv ? extractText(files.cv) : Promise.resolve('[NICHT VORHANDEN]'),
    files.selfAssessment ? extractText(files.selfAssessment) : Promise.resolve('[NICHT VORHANDEN]'),
    files.managerAssessment ? extractText(files.managerAssessment) : Promise.resolve('[NICHT VORHANDEN]')
  ]);
  return { cvText, selfText, managerText };
}
