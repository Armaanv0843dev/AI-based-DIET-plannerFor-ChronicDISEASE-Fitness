import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const plan = await req.json();

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4-ish
  let { width, height } = page.getSize();

    // embed fallback standard font, optionally override with a TTF in public/fonts
    let font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    try {
      const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Inter-Regular.ttf');
      if (fs.existsSync(fontPath)) {
        const fontBytes = fs.readFileSync(fontPath);
        font = await pdfDoc.embedFont(fontBytes);
      }
    } catch (e) {
      // ignore and use standard font
    }

    const headingFont = font;
    const normalFont = font;

    let y = height - 50;
  const marginLeft = 50;
  const marginRight = 45;
  const getUsableWidth = () => page.getSize().width - marginLeft - marginRight;

    // simple text-wrapping helper
    const wrapText = (text: string, fontToUse: any, size: number, maxWidth: number) => {
      const words = String(text).split(/\s+/);
      const lines: string[] = [];
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        const textWidth = fontToUse.widthOfTextAtSize(test, size);
        if (textWidth <= maxWidth) {
          line = test;
        } else {
          if (line) lines.push(line);
          line = w;
        }
      }
      if (line) lines.push(line);
      return lines;
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number, color = rgb(0.8, 0.8, 0.8), thickness = 1) => {
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
    };

    // Try to load a logo image; if not present draw a placeholder rectangle + text
    let drewLogo = false;
    try {
      const logoPng = path.join(process.cwd(), 'public', 'logo.png');
      const logoJpg = path.join(process.cwd(), 'public', 'logo.jpg');
      let imgBytes: Uint8Array | null = null;
      let imgType: 'png' | 'jpg' | null = null;
      if (fs.existsSync(logoPng)) { imgBytes = fs.readFileSync(logoPng); imgType = 'png'; }
      else if (fs.existsSync(logoJpg)) { imgBytes = fs.readFileSync(logoJpg); imgType = 'jpg'; }
      if (imgBytes && imgType) {
        const img = imgType === 'png' ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes as Uint8Array);
        const maxLogoHeight = 40;
        const ratio = img.width / img.height || 1;
        const w = Math.min(120, maxLogoHeight * ratio);
        const h = Math.min(maxLogoHeight, maxLogoHeight);
        page.drawImage(img, { x: marginLeft, y: height - h - 20, width: w, height: h });
        drewLogo = true;
      }
    } catch (e) {
      // ignore
    }

    if (!drewLogo) {
      // draw fallback logo box
      const lw = 80;
      const lh = 36;
      const lx = marginLeft;
      const ly = height - lh - 24;
      page.drawRectangle({ x: lx, y: ly, width: lw, height: lh, color: rgb(0.95, 0.95, 0.95) });
      page.drawText('LOGO', { x: lx + 10, y: ly + 10, size: 12, font: headingFont, color: rgb(0.3, 0.3, 0.3) });
    }

    // Title
    page.drawText('Personalized Diet Plan', { x: marginLeft + 120, y: y - 8, size: 18, font: headingFont, color: rgb(0, 0, 0) });
    y -= 38;

    // Profile and calorie info
    if (plan.profile) {
      const profileLine = `Age: ${plan.profile.age || '-'}   Gender: ${plan.profile.gender || '-'}   Region: ${plan.profile.region || '-'} `;
      page.drawText(profileLine, { x: marginLeft, y, size: 11, font: normalFont, color: rgb(0.2, 0.2, 0.2) });
      y -= 18;
    }

    if (plan.calorieBreakdown) {
      page.drawText(`Estimated daily calories: ${plan.calorieBreakdown}`, { x: marginLeft, y, size: 11, font: normalFont });
      y -= 16;
      const m = plan.macronutrientBreakdown;
      if (m) {
        page.drawText(`Protein: ${m.protein || '-'}g   Carbs: ${m.carbs || '-'}g   Fat: ${m.fat || '-'}g`, { x: marginLeft, y, size: 11, font: normalFont });
        y -= 18;
      }
    }

    // Table-like layout per section
    const sections = ['breakfast', 'lunch', 'dinner', 'snacks'];

    for (const section of sections) {
      const items = plan.dietPlan?.[section];
      if (items && items.length) {
        // recompute dimensions in case we've added pages
        width = page.getSize().width;
        height = page.getSize().height;
        const usableWidth = getUsableWidth();
        const colX = {
          item: marginLeft,
          calories: marginLeft + Math.floor(usableWidth * 0.65),
          protein: marginLeft + Math.floor(usableWidth * 0.78),
          carbs: marginLeft + Math.floor(usableWidth * 0.88),
          fat: marginLeft + Math.floor(usableWidth * 0.96),
        };

        // section header
        page.drawText(section.charAt(0).toUpperCase() + section.slice(1) + ':', { x: marginLeft, y, size: 13, font: headingFont });
        y -= 18;

        // table header
        page.drawText('Item', { x: colX.item, y, size: 11, font: headingFont });
        page.drawText('kcal', { x: colX.calories, y, size: 11, font: headingFont });
        page.drawText('P', { x: colX.protein, y, size: 11, font: headingFont });
        page.drawText('C', { x: colX.carbs, y, size: 11, font: headingFont });
        page.drawText('F', { x: colX.fat, y, size: 11, font: headingFont });
        y -= 12;
        drawLine(marginLeft, y + 6, width - marginRight, y + 6);
        y -= 6;

        for (const meal of items) {
          // estimate heights for this item block
          const name = `${meal.name || ''}`;
          const desc = meal.description ? `${meal.description}` : '';
          const nameLines = wrapText(name, normalFont, 11, Math.floor(usableWidth * 0.62));
          const descLines = desc ? wrapText(desc, normalFont, 9, Math.floor(usableWidth * 0.62)) : [];
          const nameHeight = nameLines.length * 14;
          const descHeight = descLines.length * 12;
          const blockHeight = nameHeight + descHeight + 6; // padding

          // ensure there's room, otherwise create a new page and recompute coords
          if (y - blockHeight < 80) {
            page = pdfDoc.addPage([595, 842]);
            width = page.getSize().width;
            height = page.getSize().height;
            y = height - 50;
            // recompute usableWidth and col positions for new page
            const newUsable = getUsableWidth();
          }

          // draw the textual part starting from current y (top of block)
          const topY = y;
          for (let i = 0; i < nameLines.length; i++) {
            page.drawText(nameLines[i], { x: colX.item, y: y, size: 11, font: normalFont });
            y -= 14;
          }
          for (let i = 0; i < descLines.length; i++) {
            page.drawText(descLines[i], { x: colX.item + 6, y: y, size: 9, font: normalFont, color: rgb(0.3, 0.3, 0.3) });
            y -= 12;
          }

          // numeric columns aligned to the top of the block
          const kcal = meal.calories != null ? String(meal.calories) : '-';
          const prot = meal.protein != null ? String(meal.protein) : '-';
          const carbs = meal.carbs != null ? String(meal.carbs) : '-';
          const fat = meal.fat != null ? String(meal.fat) : '-';
          const numbersY = topY - 2;
          page.drawText(kcal, { x: colX.calories, y: numbersY, size: 11, font: normalFont });
          page.drawText(prot, { x: colX.protein, y: numbersY, size: 11, font: normalFont });
          page.drawText(carbs, { x: colX.carbs, y: numbersY, size: 11, font: normalFont });
          page.drawText(fat, { x: colX.fat, y: numbersY, size: 11, font: normalFont });

          y -= 8; // gap after each item
        }

        y -= 8;
      }
    }

    // Important notes (array or string)
    if (plan.importantNotes) {
      page.drawText('Important Notes:', { x: marginLeft, y, size: 13, font: headingFont });
      y -= 16;
      const notesArr: string[] = Array.isArray(plan.importantNotes)
        ? plan.importantNotes
        : String(plan.importantNotes).split(/\n+/).filter(Boolean);
      for (const n of notesArr) {
        if (y < 80) {
          const newPage = pdfDoc.addPage([595, 842]);
          page = newPage as any;
          const dims = page.getSize();
          width = dims.width; height = dims.height;
          y = height - 50;
        }
        let usableWidth = getUsableWidth();
        const lines = wrapText(`• ${n}`, normalFont, 11, usableWidth);
        for (const l of lines) {
          page.drawText(l, { x: marginLeft, y, size: 11, font: normalFont });
          y -= 14;
          if (y < 80) break;
        }
        y -= 6;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="diet-plan.pdf"',
      },
    });
  } catch (e) {
    console.error('pdf generation error', e);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
