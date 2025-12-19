const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const dataDir = path.join(__dirname, 'questions');
const dataPath = path.join(dataDir, 'data.json');
const outputDir = path.join(dataDir, 'exports');
const outputPath = path.join(outputDir, 'pytania-i-odpowiedzi.pdf');

function loadData() {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function formatAnswers(answers = []) {
  return answers
    .filter(Boolean)
    .sort((a, b) => a.lp - b.lp);
}

function renderPdf(doc, questions, fonts) {
  doc.font(fonts.bold).fontSize(22).text('Familiada — pytania i odpowiedzi', {
    align: 'center'
  });
  doc.moveDown(1.5);

  Object.entries(questions).forEach(([question, answers], index) => {
    doc.font(fonts.bold).fontSize(14).fillColor('#000000').text(`${index + 1}. ${question}`);
    doc.moveDown(0.3);

    const normalizedAnswers = formatAnswers(answers);
    if (normalizedAnswers.length === 0) {
      doc.font(fonts.regular).fontSize(12).text('Brak odpowiedzi.');
    } else {
      normalizedAnswers.forEach(answer => {
        doc.font(fonts.regular).fontSize(12).text(`${answer.lp}. ${answer.ans} — ${answer.points} pkt`);
      });
    }

    doc.moveDown(0.8);
  });
}

function main() {
  ensureDir(outputDir);

  const data = loadData();
  const fonts = {
    regular: path.join(__dirname, 'public', 'assets', 'fonts', 'NotoSans-Regular.ttf'),
    bold: path.join(__dirname, 'public', 'assets', 'fonts', 'NotoSans-Regular.ttf'),
  };

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  doc.registerFont('CustomRegular', fonts.regular);
  doc.registerFont('CustomBold', fonts.bold);

  renderPdf(doc, data.questions || {}, {
    regular: 'CustomRegular',
    bold: 'CustomBold',
  });

  doc.end();
  writeStream.on('finish', () => {
    console.log(`PDF zapisany do: ${outputPath}`);
  });
}

main();
