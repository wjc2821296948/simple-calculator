// State Management
let display = document.getElementById('display');
let history = [];
let lastCalculation = null;
let isDarkMode = false;
let isScientificMode = false;
let angleMode = 'deg'; // 'deg' or 'rad'
let soundEnabled = true; // Sound toggle

// Undo/Redo stacks
let undoStack = [''];
let redoStack = [];
let currentIndex = 0;

// Audio context for sound effects
let audioContext = null;

// Initialize
loadHistory();
loadTheme();
loadSoundSetting();

// ============ Sound Effects ============
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(frequency = 800, duration = 50) {
    if (!soundEnabled) return;
    
    try {
        initAudioContext();
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
        
        osc.start(now);
        osc.stop(now + duration / 1000);
    } catch (e) {
        console.error('Error playing sound:', e);
    }
}

function playSuccessSound() {
    if (!soundEnabled) return;
    
    try {
        initAudioContext();
        const now = audioContext.currentTime;
        const notes = [800, 1000, 1200];
        
        notes.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = freq;
            const startTime = now + (index * 0.05);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
            
            osc.start(startTime);
            osc.stop(startTime + 0.1);
        });
    } catch (e) {
        console.error('Error playing success sound:', e);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('calculatorSound', soundEnabled);
    const btn = document.getElementById('soundToggle');
    if (btn) {
        btn.textContent = soundEnabled ? '🔊' : '🔇';
    }
}

function loadSoundSetting() {
    const saved = localStorage.getItem('calculatorSound');
    if (saved === 'false') {
        soundEnabled = false;
    }
    const btn = document.getElementById('soundToggle');
    if (btn) {
        btn.textContent = soundEnabled ? '🔊' : '🔇';
    }
}

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
    saveState();
    animateDisplay();
    playBeep(600, 30);
}

function appendOperator(operator) {
    if (display.value === '') return;
    if (isOperator(display.value[display.value.length - 1])) {
        display.value = display.value.slice(0, -1) + operator;
    } else {
        display.value += operator;
    }
    saveState();
    animateDisplay();
    playBeep(700, 30);
}

function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

function deleteLast() {
    display.value = display.value.toString().slice(0, -1);
    updateHistoryIndicator();
    saveState();
    animateDisplay();
    playBeep(500, 25);
}

function clearDisplay() {
    display.value = '';
    updateHistoryIndicator();
    saveState();
    animateDisplay();
    playBeep(400, 40);
}

// ============ Animation Functions ============
function animateDisplay() {
    display.style.animation = 'none';
    setTimeout(() => {
        display.style.animation = 'displayPulse 0.3s ease';
    }, 10);
}

function animateResult() {
    display.classList.remove('result-animation');
    setTimeout(() => {
        display.classList.add('result-animation');
    }, 10);
}

// ============ Undo/Redo Functionality ============
function saveState() {
    // Remove any states after current index
    undoStack = undoStack.slice(0, currentIndex + 1);
    redoStack = [];
    
    // Add new state
    undoStack.push(display.value);
    currentIndex = undoStack.length - 1;
    
    // Limit history to 50 states
    if (undoStack.length > 50) {
        undoStack.shift();
        currentIndex--;
    }
    
    updateUndoRedoButtons();
}

function undo() {
    if (currentIndex > 0) {
        currentIndex--;
        display.value = undoStack[currentIndex];
        updateHistoryIndicator();
        updateUndoRedoButtons();
        animateDisplay();
        playBeep(650, 30);
    }
}

function redo() {
    if (currentIndex < undoStack.length - 1) {
        currentIndex++;
        display.value = undoStack[currentIndex];
        updateHistoryIndicator();
        updateUndoRedoButtons();
        animateDisplay();
        playBeep(750, 30);
    }
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) undoBtn.disabled = currentIndex <= 0;
    if (redoBtn) redoBtn.disabled = currentIndex >= undoStack.length - 1;
}

// ============ Advanced Functions ============
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function toggleSign() {
    if (display.value === '' || display.value === '0') return;
    if (display.value.startsWith('-')) {
        display.value = display.value.slice(1);
    } else {
        display.value = '-' + display.value;
    }
    saveState();
    animateDisplay();
    playBeep(600, 30);
}

function appendFunction(func) {
    const currentValue = parseFloat(display.value);
    
    if (isNaN(currentValue)) return;
    
    let result;
    let expression;
    
    switch(func) {
        case '%':
            result = currentValue / 100;
            expression = `${currentValue}%`;
            break;
        case 'sqrt':
            if (currentValue < 0) {
                display.value = 'Error';
                playBeep(300, 100);
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = Math.sqrt(currentValue);
            expression = `√${currentValue}`;
            break;
        case 'x²':
            result = currentValue * currentValue;
            expression = `${currentValue}²`;
            break;
        case '1/x':
            if (currentValue === 0) {
                display.value = 'Error';
                playBeep(300, 100);
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = 1 / currentValue;
            expression = `1/${currentValue}`;
            break;
        case 'x³':
            result = currentValue * currentValue * currentValue;
            expression = `${currentValue}³`;
            break;
        case '|x|':
            result = Math.abs(currentValue);
            expression = `|${currentValue}|`;
            break;
        case 'n!':
            if (currentValue < 0 || currentValue !== Math.floor(currentValue)) {
                display.value = 'Error';
                playBeep(300, 100);
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = factorial(currentValue);
            expression = `${currentValue}!`;
            break;
        case 'sin':
            const sinVal = angleMode === 'deg' ? currentValue * Math.PI / 180 : currentValue;
            result = Math.sin(sinVal);
            expression = `sin(${currentValue}°)`;
            break;
        case 'cos':
            const cosVal = angleMode === 'deg' ? currentValue * Math.PI / 180 : currentValue;
            result = Math.cos(cosVal);
            expression = `cos(${currentValue}°)`;
            break;
        case 'tan':
            const tanVal = angleMode === 'deg' ? currentValue * Math.PI / 180 : currentValue;
            result = Math.tan(tanVal);
            expression = `tan(${currentValue}°)`;
            break;
        case 'log':
            if (currentValue <= 0) {
                display.value = 'Error';
                playBeep(300, 100);
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = Math.log10(currentValue);
            expression = `log(${currentValue})`;
            break;
        case 'ln':
            if (currentValue <= 0) {
                display.value = 'Error';
                playBeep(300, 100);
                setTimeout(() => display.value = '', 1500);
                return;
            }
            result = Math.log(currentValue);
            expression = `ln(${currentValue})`;
            break;
        case 'e':
            result = Math.E;
            expression = 'e';
            break;
        case 'π':
            result = Math.PI;
            expression = 'π';
            break;
        default:
            return;
    }
    
    result = Math.round(result * 100000000) / 100000000;
    display.value = result;
    addToHistory(expression, result);
    saveState();
    animateResult();
    playSuccessSound();
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
        saveState();
        animateResult();
        playSuccessSound();
    } catch (error) {
        display.value = 'Error';
        playBeep(300, 100);
        animateDisplay();
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
    if (history.length > 50) history.pop();
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
            <div class="history-item-content">
                <div class="expression">${escapeHtml(item.expression)}</div>
                <div class="result">= ${item.result}</div>
            </div>
            <button class="history-item-copy" onclick="copyToClipboard('${item.result}')" title="复制结果">📋</button>
        `;
        div.querySelector('.history-item-content').onclick = () => {
            display.value = item.result;
            saveState();
            animateDisplay();
            playBeep(750, 30);
        };
        historyList.appendChild(div);
    });
}

function clearHistory() {
    if (confirm('确认清除所有历史记录吗？')) {
        history = [];
        saveHistory();
        renderHistory();
        updateHistoryIndicator();
        playBeep(500, 50);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const original = btn.textContent;
        btn.textContent = '✓';
        btn.style.background = '#90EE90';
        playBeep(1000, 30);
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('复制失败，请重试');
        playBeep(300, 100);
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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
        try {
            history = JSON.parse(saved);
            renderHistory();
            updateHistoryIndicator();
        } catch (e) {
            console.error('Error loading history:', e);
        }
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
    playBeep(800, 50);
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
if (document.getElementById('soundToggle')) {
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
}

// ============ Scientific Mode Toggle ============
function toggleScientificMode() {
    isScientificMode = !isScientificMode;
    const scientificBtns = document.querySelectorAll('.scientific-btn');
    const toggle = document.getElementById('scientificToggle');
    
    if (isScientificMode) {
        scientificBtns.forEach(btn => btn.classList.add('show'));
        toggle.classList.add('active');
        localStorage.setItem('scientificMode', 'true');
    } else {
        scientificBtns.forEach(btn => btn.classList.remove('show'));
        toggle.classList.remove('active');
        localStorage.setItem('scientificMode', 'false');
    }
    playBeep(900, 50);
}

function loadScientificMode() {
    const saved = localStorage.getItem('scientificMode');
    if (saved === 'true') {
        toggleScientificMode();
    }
}

document.getElementById('scientificToggle').addEventListener('click', toggleScientificMode);
loadScientificMode();

// Initialize undo/redo buttons
window.addEventListener('load', updateUndoRedoButtons);

// ============ Keyboard Support ============
document.addEventListener('keydown', function(event) {
    if (event.key >= '0' && event.key <= '9') {
        appendNumber(event.key);
    } else if (event.key === '.') {
        appendNumber('.');
    } else if (event.key === '+' || event.key === '*' || event.key === '/') {
        event.preventDefault();
        appendOperator(event.key);
    } else if (event.key === '-' && !event.ctrlKey) {
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
    } else if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undo();
    } else if ((event.ctrlKey && event.key === 'y') || (event.ctrlKey && event.shiftKey && event.key === 'z')) {
        event.preventDefault();
        redo();
    } else if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        toggleScientificMode();
    }
});

// Copy to clipboard on Ctrl+C
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === 'c' && display.value) {
        event.preventDefault();
        copyToClipboard(display.value);
    }
});