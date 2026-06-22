import PDFDocument from 'pdfkit';
import { storage } from '../../lib/storage';
import { logger } from '../../utils/logger';

export interface InspectionPhoto {
  key: string;
  lat?: number;
  lng?: number;
  takenAt?: string;
}

interface PdfInput {
  orderId: string;
  travelerName: string | null;
  requestTitle: string;
  checklist: Record<string, boolean>;
  photos: InspectionPhoto[];
}

const CHECKLIST_LABELS: Record<string, string> = {
  inspected: 'Inspected the package in the sender’s presence',
  contentsMatch: 'Contents match the declaration',
  noProhibited: 'No prohibited items found',
  sealed: 'Package properly sealed after inspection',
};

/** Render the inspection record to a PDF buffer (with embedded photos where possible). */
async function render(input: PdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  doc.fontSize(20).fillColor('#0F1629').text('CarryMate — Open-Box Inspection', { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#5E6878').text(`Generated ${new Date().toISOString()}`);
  doc.moveDown(1);

  doc.fontSize(11).fillColor('#1C2330');
  doc.text(`Order ID: ${input.orderId}`);
  doc.text(`Item: ${input.requestTitle}`);
  doc.text(`Traveler: ${input.travelerName ?? '—'}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor('#0F1629').text('Declaration');
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#1C2330');
  for (const [key, label] of Object.entries(CHECKLIST_LABELS)) {
    const ok = input.checklist[key] === true;
    doc.text(`${ok ? '[x]' : '[ ]'}  ${label}`);
  }
  doc.moveDown(1);

  doc.fontSize(13).fillColor('#0F1629').text(`Photos (${input.photos.length})`);
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#1C2330');

  for (let i = 0; i < input.photos.length; i++) {
    const p = input.photos[i]!;
    const gps = p.lat != null && p.lng != null ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : 'no GPS';
    doc.text(`#${i + 1}  ·  ${p.takenAt ?? 'no timestamp'}  ·  GPS: ${gps}`);
    // Best-effort thumbnail embed; failures must not break the PDF.
    try {
      const url = await storage().createDownloadUrl(p.key, 300);
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const img = Buffer.from(await res.arrayBuffer());
        doc.image(img, { fit: [220, 220] });
      }
    } catch (err) {
      logger.warn(`[inspection-pdf] could not embed photo ${p.key}: ${(err as Error).message}`);
    }
    doc.moveDown(0.6);
  }

  doc.end();
  return done;
}

/**
 * Generate the inspection summary PDF and upload it to storage; returns the key.
 * Non-fatal: returns null on any failure (the inspection record still stands).
 */
export async function generateInspectionPdf(input: PdfInput): Promise<string | null> {
  try {
    const buffer = await render(input);
    const key = `inspections/${input.orderId}/summary.pdf`;
    await storage().upload(key, buffer, 'application/pdf');
    logger.info(`[inspection-pdf] generated for order ${input.orderId}`);
    return key;
  } catch (err) {
    logger.error(`[inspection-pdf] failed for order ${input.orderId}: ${(err as Error).message}`);
    return null;
  }
}
