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
  const rowStart = index.indexOf(marker);
  if (rowStart === -1) throw new Error('Missing standard keypad row: ' + rowName);
  const rowEnd = index.indexOf('</div>', rowStart);
  if (rowEnd === -1) throw new Error('Unclosed standard keypad row: ' + rowName);
  const row = index.slice(rowStart, rowEnd);
  const buttons = row.match(/<button\b/g) || [];
  if (buttons.length !== 4) {
    throw new Error('Every standard keypad row must contain exactly four buttons');
  }
  for (const label of labels) {
    if (!row.includes('>' + label + '<')) {
      throw new Error('Unexpected standard keypad layout in row ' + rowName + ': missing ' + label);
    }
  }
}

console.log('Static project validation passed.');
