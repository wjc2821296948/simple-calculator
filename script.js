// State Management
let display = document.getElementById('display');
let history = [];
let lastCalculation = null;
let isDarkMode = false;

// Initialize
loadHistory();
loadTheme();

// ============ Display Functions ============
function appendNumber(num) {
    if (display.value === '0' && num !== '.') {
        display.value = num;
    } else if (num === '.' && display.value.includes('.')) {
        return;
    } else {
        display.value += num;
    }
    updateHistoryIndicator();
}

function appendOperator(operator) {
    if (display.value === '') return;
    if (isOperator(display.value[display.value.length - 1])) {
        display.value = display.value.slice(0, -1) + operator;
    } else {
        display.value += operator;
    }
}

function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

function deleteLast() {
    display.value = display.value.toString().slice(0, -1);
    updateHistoryIndicator();
}

function clearDisplay() {
    display.value = '';
    updateHistoryIndicator();
}

// ============ Scientific Functions ============
function toggleSign() {
    if (display.value === '' || display.value === '0') return;
    if (display.value.startsWith('-')) {
        display.value = display.value.slice(1);
    } else {
        display.value = '-' + display.value;
    }
}

function appendFunction(func) {
    const currentValue = parseFloat(display.value);
    
    if (isNaN(currentValue)) return;
    
    let result;
    switch(func) {
        case '%':
            result = currentValue / 100;
            break;
        case 'sqrt':
            if (currentValue < 0) {
                display.value = 'Error';
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = Math.sqrt(currentValue);
            break;
        case 'x²':
            result = currentValue * currentValue;
            break;
        case '1/x':
            if (currentValue === 0) {
                display.value = 'Error';
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = 1 / currentValue;
            break;
        default:
            return;
    }
    
    const expression = `${currentValue} ${func}`;
    result = Math.round(result * 100000000) / 100000000;
    display.value = result;
    addToHistory(expression, result);
}

// ============ Calculation ============
function calculate() {
    const expression = display.value;
    try {
        if (!expression) return;
        let result = eval(expression);
        result = Math.round(result * 100000000) / 100000000;
        lastCalculation = { expression, result };
        addToHistory(expression, result);
        display.value = result;
    } catch (error) {
        display.value = 'Error';
        setTimeout(() => {
            display.value = '';
        }, 1500);
    }
}

// ============ History Management ============
function addToHistory(expression, result) {
    const historyItem = {
        id: Date.now(),
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };
    history.unshift(historyItem);
    if (history.length > 20) history.pop();
    saveHistory();
    renderHistory();
    updateHistoryIndicator();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="expression">${item.expression}</div>
            <div class="result">= ${item.result}</div>
        `;
        div.onclick = () => display.value = item.result;
        historyList.appendChild(div);
    });
}

function clearHistory() {
    history = [];
    saveHistory();
    renderHistory();
    updateHistoryIndicator();
}

function updateHistoryIndicator() {
    const indicator = document.getElementById('historyIndicator');
    if (history.length > 0) {
        indicator.textContent = `最后: ${history[0].result}`;
    } else {
        indicator.textContent = '';
    }
}

function saveHistory() {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
}

function loadHistory() {
    const saved = localStorage.getItem('calculatorHistory');
    if (saved) {
        history = JSON.parse(saved);
        renderHistory();
        updateHistoryIndicator();
    }
}

// ============ Theme Management ============
function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('calculatorTheme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('calculatorTheme', 'light');
        document.getElementById('themeToggle').textContent = '🌙';
    }
}

function loadTheme() {
    const saved = localStorage.getItem('calculatorTheme');
    if (saved === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// ============ Keyboard Support ============
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    } else if (event.key === '.') {
        appendNumber('.');
    } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
        event.preventDefault();
        appendOperator(event.key);
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
    } else if (event.key === 'Backspace') {
        event.preventDefault();
        deleteLast();
    } else if (event.key === 'Escape') {
        clearDisplay();
    }
});

// Copy to clipboard on Ctrl+C
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'c' && display.value) {
        event.preventDefault();
        navigator.clipboard.writeText(display.value).then(() => {
            const original = display.style.background;
            display.style.background = '#90EE90';
            setTimeout(() => {
                display.style.background = original;
            }, 300);
        });
    }
});