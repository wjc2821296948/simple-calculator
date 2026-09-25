import { readFileSync, existsSync } from 'node:fs';

const index = readFileSync('index.html', 'utf8');
const script = readFileSync('script.js', 'utf8');

const requiredFiles = ['index.html', 'styles.css', 'script.js', 'README.md'];
for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error('Missing required file: ' + file);
}

const requiredIds = [
  'display', 'historyIndicator', 'historyList', 'undoBtn', 'redoBtn',
  'soundToggle', 'themeToggle', 'scientificToggle', 'angleToggle'
];

for (const id of requiredIds) {
  if (!index.includes('id="' + id + '"')) {
    throw new Error('Missing required element id: ' + id);
  }
}

for (const asset of ['styles.css', 'script.js']) {
  if (!index.includes('"' + asset + '"')) {
    throw new Error('index.html does not reference ' + asset);
  }
}

for (const name of ['evaluateExpression', 'tokenize', 'appendParenthesis', 'toggleAngleMode']) {
  if (!script.includes('function ' + name)) {
    throw new Error('Missing required function: ' + name);
  }
}

if (script.includes('eval(')) throw new Error('Unsafe eval() call detected');
if (!index.includes('aria-label="计算器"')) throw new Error('Missing calculator aria-label');

const expectedRows = {
  utility: ['%', 'CE', 'C', 'DEL'],
  advanced: ['1/x', 'x²', '√', '÷'],
  'numbers-7': ['7', '8', '9', '×'],
  'numbers-4': ['4', '5', '6', '−'],
  'numbers-1': ['1', '2', '3', '+'],
  'numbers-0': ['+/-', '0', '.', '=']
};

for (const [rowName, labels] of Object.entries(expectedRows)) {
  const marker = '<div class="button-row" data-row="' + rowName + '">';
  const start = index.indexOf(marker);
  if (start === -1) throw new Error('Missing standard keypad row: ' + rowName);
  const end = index.indexOf('</div>', start);
  if (end === -1) throw new Error('Unclosed standard keypad row: ' + rowName);
  const row = index.slice(start, end);
  const buttons = row.match(/<button\b/g) || [];
  if (buttons.length !== 4) throw new Error('Every standard keypad row must contain exactly four buttons');
  for (const label of labels) {
    if (!row.includes('>' + label + '<')) {
      throw new Error('Unexpected standard keypad layout in row ' + rowName + ': missing ' + label);
    }
  }
}

const standardRows = [...index.matchAll(/<div class="button-row" data-row="[^"]+">([\\s\\S]*?)<\\/div>/g)];
if (standardRows.length !== 6) throw new Error('Standard keypad must contain exactly six rows');
for (const row of standardRows) {
  const buttons = row[1].match(/<button\\b/g) || [];
  if (buttons.length !== 4) throw new Error('Every standard keypad row must contain exactly four buttons');
}

const expectedLayout = [
  ['%', 'CE', 'C', 'DEL'],
  ['1/x', 'x²', '√', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['+/-', '0', '.', '=']
];
expectedLayout.forEach((labels, rowIndex) => {
  for (const label of labels) {
    if (!standardRows[rowIndex][1].includes('>' + label + '<')) {
      throw new Error('Unexpected standard keypad layout in row ' + (rowIndex + 1) + ': missing ' + label);
    }
  }
});

console.log('Static project validation passed.');
