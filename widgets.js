// 组件配置
const widgetTypes = {
    weather: {
        name: '天气',
        icon: '🌤️',
        desc: '实时天气信息',
        defaultSize: 'medium',
        render: renderWeatherWidget
    },
    calendar: {
        name: '日历',
        icon: '📅',
        desc: '当月日历',
        defaultSize: 'medium',
        render: renderCalendarWidget
    },
    quote: {
        name: '每日一言',
        icon: '💬',
        desc: '励志名言/诗词',
        defaultSize: 'medium',
        render: renderQuoteWidget
    },
    calculator: {
        name: '计算器',
        icon: '🔢',
        desc: '简单计算器',
        defaultSize: 'medium',
        render: renderCalculatorWidget
    },
    tomato: {
        name: '番茄钟',
        icon: '🍅',
        desc: '专注计时器',
        defaultSize: 'medium',
        render: renderTomatoWidget
    },
    notepad: {
        name: '记事本',
        icon: '📝',
        desc: '快速记录',
        defaultSize: 'medium',
        render: renderNotepadWidget
    },
    countdown: {
        name: '倒计时',
        icon: '⏱️',
        desc: '事件倒计时',
        defaultSize: 'medium',
        render: renderCountdownWidget
    }
};

let activeWidgets = JSON.parse(localStorage.getItem('activeWidgets')) || [];
let widgetStates = JSON.parse(localStorage.getItem('widgetStates')) || {};

// 渲染所有活动组件
function renderWidgets() {
    const section = document.getElementById('widgetsSection');
    section.innerHTML = '';
    
    if (activeWidgets.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'grid';
    
    activeWidgets.forEach((widgetId, index) => {
        const widgetConfig = widgetTypes[widgetId];
        if (!widgetConfig) return;
        
        const state = widgetStates[widgetId] || { size: widgetConfig.defaultSize };
        
        const widget = document.createElement('div');
        widget.className = `widget ${widgetId}-widget size-${state.size}`;
        widget.dataset.widgetId = widgetId;
        widget.dataset.index = index;
        widget.draggable = true;
        widget.style.position = 'relative';
        
        const header = document.createElement('div');
        header.className = 'widget-header';
        header.innerHTML = `
            <span>${widgetConfig.icon} ${widgetConfig.name}</span>
        `;
        
        const controls = document.createElement('div');
        controls.className = 'widget-controls';
        controls.innerHTML = `
            <button class="widget-control-btn" onclick="changeWidgetSize('${widgetId}')" title="调整大小">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
            </button>
            <button class="widget-control-btn" onclick="removeWidget('${widgetId}')" title="删除">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        const content = document.createElement('div');
        content.className = 'widget-content';
        content.id = `${widgetId}Content`;
        
        widget.appendChild(header);
        widget.appendChild(controls);
        widget.appendChild(content);
        
        widget.addEventListener('dragstart', handleWidgetDragStart);
        widget.addEventListener('dragover', handleWidgetDragOver);
        widget.addEventListener('drop', handleWidgetDrop);
        widget.addEventListener('dragend', handleWidgetDragEnd);
        
        section.appendChild(widget);
        
        widgetConfig.render(content);
    });
}

// 渲染组件选择列表
function renderWidgetList() {
    const list = document.getElementById('widgetList');
    list.innerHTML = '';
    
    Object.keys(widgetTypes).forEach(widgetId => {
        const config = widgetTypes[widgetId];
        const isActive = activeWidgets.includes(widgetId);
        
        const item = document.createElement('div');
        item.className = `widget-item ${isActive ? 'disabled' : ''}`;
        item.innerHTML = `
            <div class="widget-item-icon">${config.icon}</div>
            <div class="widget-item-name">${config.name}</div>
            <div class="widget-item-desc">${config.desc}</div>
        `;
        
        if (!isActive) {
            item.addEventListener('click', () => addWidget(widgetId));
        }
        
        list.appendChild(item);
    });
}

// 添加组件
function addWidget(widgetId) {
    if (activeWidgets.includes(widgetId)) return;
    
    activeWidgets.push(widgetId);
    widgetStates[widgetId] = { size: widgetTypes[widgetId].defaultSize };
    
    saveWidgetData();
    renderWidgets();
    closeWidgetModal();
}

// 删除组件
function removeWidget(widgetId) {
    const index = activeWidgets.indexOf(widgetId);
    if (index > -1) {
        activeWidgets.splice(index, 1);
        delete widgetStates[widgetId];
        saveWidgetData();
        renderWidgets();
    }
}

// 改变组件大小
function changeWidgetSize(widgetId) {
    const sizes = ['small', 'medium', 'large'];
    const currentState = widgetStates[widgetId] || { size: 'medium' };
    const currentIndex = sizes.indexOf(currentState.size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    
    widgetStates[widgetId] = { size: sizes[nextIndex] };
    saveWidgetData();
    renderWidgets();
}

// 保存组件数据
function saveWidgetData() {
    localStorage.setItem('activeWidgets', JSON.stringify(activeWidgets));
    localStorage.setItem('widgetStates', JSON.stringify(widgetStates));
}

// 组件拖拽排序
let draggedWidget = null;
let draggedWidgetIndex = null;

function handleWidgetDragStart(e) {
    draggedWidget = this;
    draggedWidgetIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleWidgetDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetIndex = parseInt(this.dataset.index);
    if (draggedWidgetIndex !== targetIndex) {
        this.classList.add('drag-over');
    }
}

function handleWidgetDrop(e) {
    e.preventDefault();
    const targetIndex = parseInt(this.dataset.index);
    
    if (draggedWidgetIndex !== targetIndex) {
        const widgetId = activeWidgets[draggedWidgetIndex];
        activeWidgets.splice(draggedWidgetIndex, 1);
        activeWidgets.splice(targetIndex, 0, widgetId);
        saveWidgetData();
        renderWidgets();
    }
}

function handleWidgetDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.widget').forEach(w => {
        w.classList.remove('drag-over');
    });
}

// 组件模态框
function openWidgetModal() {
    renderWidgetList();
    document.getElementById('widgetModal').classList.add('active');
}

function closeWidgetModal() {
    document.getElementById('widgetModal').classList.remove('active');
}

// 天气组件
function renderWeatherWidget(container) {
    container.innerHTML = '<div class="weather-loading">加载中...</div>';
    loadWeatherData(container);
}

async function loadWeatherData(container) {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, container);
                },
                () => fetchWeatherByCity('Beijing', container)
            );
        } else {
            await fetchWeatherByCity('Beijing', container);
        }
    } catch (error) {
        container.innerHTML = '<div class="weather-loading">天气加载失败</div>';
    }
}

async function fetchWeatherByCoords(lat, lon, container) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        );
        const data = await response.json();
        
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        const weatherDesc = getWeatherDescription(weatherCode);
        const weatherIcon = getWeatherIcon(weatherCode);
        
        container.innerHTML = `
            <div class="weather-info">
                <div class="weather-main">
                    <div class="weather-icon">${weatherIcon}</div>
                    <div class="weather-temp">${temp}°C</div>
                </div>
                <div class="weather-details">
                    <div class="weather-city">当前位置</div>
                    <div class="weather-desc">${weatherDesc}</div>
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<div class="weather-loading">天气加载失败</div>';
    }
}

async function fetchWeatherByCity(city, container) {
    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        const geoData = await geoResponse.json();
        
        if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude } = geoData.results[0];
            await fetchWeatherByCoords(latitude, longitude, container);
        }
    } catch (error) {
        container.innerHTML = '<div class="weather-loading">天气加载失败</div>';
    }
}

function getWeatherDescription(code) {
    const codes = {
        0: '晴朗', 1: '大部晴朗', 2: '多云', 3: '阴天',
        45: '雾', 48: '雾凇',
        51: '小雨', 53: '中雨', 55: '大雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        71: '小雪', 73: '中雪', 75: '大雪',
        80: '阵雨', 81: '中阵雨', 82: '大阵雨',
        95: '雷暴', 96: '雷暴冰雹', 99: '强雷暴'
    };
    return codes[code] || '未知';
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 65) return '🌧️';
    if (code <= 75) return '❄️';
    if (code <= 82) return '🌦️';
    if (code <= 99) return '⛈️';
    return '🌤️';
}

// 日历组件
function renderCalendarWidget(container) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    
    let html = '<div class="calendar-grid">';
    dayNames.forEach(day => html += `<div class="calendar-day-name">${day}</div>`);
    
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        html += `<div class="calendar-day other-month">${daysInPrevMonth - i}</div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today;
        html += `<div class="calendar-day${isToday ? ' today' : ''}">${day}</div>`;
    }
    
    const totalCells = startDayOfWeek + daysInMonth;
    const nextMonthDays = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= nextMonthDays; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 每日一言组件
function renderQuoteWidget(container) {
    const quotes = [
        { text: '人生就像一场旅行，不必在乎目的地，在乎的是沿途的风景以及看风景的心情。', author: '匿名' },
        { text: '成功不是终点，失败也不是终结，唯有继续前行的勇气才是最重要的。', author: '丘吉尔' },
        { text: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', author: '维维安·格林' },
        { text: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', author: '孟浩然' },
        { text: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德' },
        { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游' },
        { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
        { text: '不识庐山真面目，只缘身在此山中。', author: '苏轼' },
        { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '佚名' },
        { text: '天行健，君子以自强不息。', author: '周易' }
    ];
    
    const today = new Date();
    const quote = quotes[today.getDate() % quotes.length];
    
    container.innerHTML = `
        <div class="quote-content">
            <div class="quote-text">${quote.text}</div>
            <div class="quote-author">${quote.author}</div>
        </div>
    `;
}

// 计算器组件
let calcDisplay = '0';
let calcOperator = null;
let calcPrevious = null;

function renderCalculatorWidget(container) {
    container.innerHTML = `
        <div class="calculator-display" id="calcDisplay">0</div>
        <div class="calculator-buttons">
            <button class="calc-btn" onclick="calcInput('C')">C</button>
            <button class="calc-btn" onclick="calcInput('±')">±</button>
            <button class="calc-btn" onclick="calcInput('%')">%</button>
            <button class="calc-btn operator" onclick="calcInput('÷')">÷</button>
            <button class="calc-btn" onclick="calcInput('7')">7</button>
            <button class="calc-btn" onclick="calcInput('8')">8</button>
            <button class="calc-btn" onclick="calcInput('9')">9</button>
            <button class="calc-btn operator" onclick="calcInput('×')">×</button>
            <button class="calc-btn" onclick="calcInput('4')">4</button>
            <button class="calc-btn" onclick="calcInput('5')">5</button>
            <button class="calc-btn" onclick="calcInput('6')">6</button>
            <button class="calc-btn operator" onclick="calcInput('-')">−</button>
            <button class="calc-btn" onclick="calcInput('1')">1</button>
            <button class="calc-btn" onclick="calcInput('2')">2</button>
            <button class="calc-btn" onclick="calcInput('3')">3</button>
            <button class="calc-btn operator" onclick="calcInput('+')">+</button>
            <button class="calc-btn" onclick="calcInput('0')" style="grid-column: span 2">0</button>
            <button class="calc-btn" onclick="calcInput('.')">.</button>
            <button class="calc-btn equals" onclick="calcInput('=')">=</button>
        </div>
    `;
}

function calcInput(value) {
    const display = document.getElementById('calcDisplay');
    
    if (value === 'C') {
        calcDisplay = '0';
        calcOperator = null;
        calcPrevious = null;
    } else if (value === '±') {
        calcDisplay = String(-parseFloat(calcDisplay));
    } else if (value === '%') {
        calcDisplay = String(parseFloat(calcDisplay) / 100);
    } else if (['+', '-', '×', '÷'].includes(value)) {
        calcPrevious = parseFloat(calcDisplay);
        calcOperator = value;
        calcDisplay = '0';
    } else if (value === '=') {
        if (calcOperator && calcPrevious !== null) {
            const current = parseFloat(calcDisplay);
            let result;
            switch (calcOperator) {
                case '+': result = calcPrevious + current; break;
                case '-': result = calcPrevious - current; break;
                case '×': result = calcPrevious * current; break;
                case '÷': result = calcPrevious / current; break;
            }
            calcDisplay = String(result);
            calcOperator = null;
            calcPrevious = null;
        }
    } else {
        if (value === '.' && calcDisplay.includes('.')) return;
        if (calcDisplay === '0' && value !== '.') {
            calcDisplay = value;
        } else {
            calcDisplay += value;
        }
    }
    
    if (display) display.textContent = calcDisplay;
}

// 番茄钟组件
let tomatoTime = 25 * 60;
let tomatoInterval = null;
let tomatoRunning = false;
let tomatoMode = 'work';

function renderTomatoWidget(container) {
    const state = widgetStates.tomato || {};
    tomatoTime = state.time || 25 * 60;
    tomatoMode = state.mode || 'work';
    
    container.innerHTML = `
        <div class="tomato-display">
            <div class="tomato-time" id="tomatoTime">${formatTime(tomatoTime)}</div>
            <div class="tomato-status" id="tomatoStatus">${tomatoMode === 'work' ? '工作时间' : '休息时间'}</div>
        </div>
        <div class="tomato-controls">
            <button class="tomato-btn" id="tomatoToggle" onclick="toggleTomato()">${tomatoRunning ? '暂停' : '开始'}</button>
            <button class="tomato-btn secondary" onclick="resetTomato()">重置</button>
        </div>
    `;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function toggleTomato() {
    if (tomatoRunning) {
        clearInterval(tomatoInterval);
        tomatoRunning = false;
    } else {
        tomatoRunning = true;
        tomatoInterval = setInterval(() => {
            tomatoTime--;
            if (tomatoTime <= 0) {
                clearInterval(tomatoInterval);
                tomatoRunning = false;
                tomatoMode = tomatoMode === 'work' ? 'break' : 'work';
                tomatoTime = tomatoMode === 'work' ? 25 * 60 : 5 * 60;
                alert(tomatoMode === 'work' ? '休息结束！开始工作' : '工作时间到！休息一下');
            }
            updateTomatoDisplay();
        }, 1000);
    }
    updateTomatoDisplay();
}

function resetTomato() {
    clearInterval(tomatoInterval);
    tomatoRunning = false;
    tomatoMode = 'work';
    tomatoTime = 25 * 60;
    updateTomatoDisplay();
}

function updateTomatoDisplay() {
    const timeEl = document.getElementById('tomatoTime');
    const statusEl = document.getElementById('tomatoStatus');
    const toggleBtn = document.getElementById('tomatoToggle');
    
    if (timeEl) timeEl.textContent = formatTime(tomatoTime);
    if (statusEl) statusEl.textContent = tomatoMode === 'work' ? '工作时间' : '休息时间';
    if (toggleBtn) toggleBtn.textContent = tomatoRunning ? '暂停' : '开始';
    
    widgetStates.tomato = { ...widgetStates.tomato, time: tomatoTime, mode: tomatoMode };
    saveWidgetData();
}

// 记事本组件
function renderNotepadWidget(container) {
    const savedNote = widgetStates.notepad?.content || '';
    
    container.innerHTML = `
        <textarea class="notepad-content" placeholder="在这里记录想法..." oninput="saveNotepad(this.value)">${savedNote}</textarea>
    `;
}

function saveNotepad(content) {
    widgetStates.notepad = { ...widgetStates.notepad, content };
    saveWidgetData();
}

// 倒计时组件
function renderCountdownWidget(container) {
    const targetDate = widgetStates.countdown?.targetDate || '2026-12-31';
    const eventName = widgetStates.countdown?.eventName || '新年';
    
    const target = new Date(targetDate);
    const now = new Date();
    const diff = target - now;
    
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const minutes = Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 12px;">
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">距离 ${eventName}</div>
            <div style="font-size: 36px; font-weight: 600; color: var(--text-primary);">${days} 天</div>
            <div style="font-size: 16px; color: var(--text-secondary); margin-top: 4px;">${hours} 时 ${minutes} 分</div>
        </div>
        <div style="display: flex; gap: 8px;">
            <input type="text" placeholder="事件名称" value="${eventName}" 
                   onchange="updateCountdown('eventName', this.value)"
                   style="flex: 1; padding: 8px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 13px;">
            <input type="date" value="${targetDate}" 
                   onchange="updateCountdown('targetDate', this.value)"
                   style="padding: 8px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 13px;">
        </div>
    `;
}

function updateCountdown(key, value) {
    widgetStates.countdown = { ...widgetStates.countdown, [key]: value };
    saveWidgetData();
    renderWidgets();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderWidgets();
    
    document.getElementById('addWidgetBtn').addEventListener('click', openWidgetModal);
    document.getElementById('widgetModalClose').addEventListener('click', closeWidgetModal);
    document.getElementById('widgetModal').addEventListener('click', (e) => {
        if (e.target.id === 'widgetModal') closeWidgetModal();
    });
});
