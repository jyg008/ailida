// 默认快捷方式数据
const defaultShortcuts = [
    { name: 'GitHub', url: 'https://github.com', color: '#FF6B6B' },
    { name: 'Google', url: 'https://google.com', color: '#4ECDC4' },
    { name: 'YouTube', url: 'https://youtube.com', color: '#FF0000' },
    { name: 'Bilibili', url: 'https://bilibili.com', color: '#45B7D1' },
    { name: '知乎', url: 'https://zhihu.com', color: '#0066FF' },
    { name: 'Twitter', url: 'https://twitter.com', color: '#1DA1F2' },
    { name: 'Gmail', url: 'https://gmail.com', color: '#EA4335' },
    { name: 'Dribbble', url: 'https://dribbble.com', color: '#EA4C89' }
];

// 搜索引擎配置
const searchEngines = {
    google: 'https://www.google.com/search?q=',
    baidu: 'https://www.baidu.com/s?wd=',
    bing: 'https://www.bing.com/search?q='
};

const DELETE_PASSWORD = '741852';

let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || defaultShortcuts;
let currentEngine = localStorage.getItem('searchEngine') || 'google';
let editingIndex = null;
let selectedColor = '#FF6B6B';

let draggedItem = null;
let draggedIndex = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    renderShortcuts();
    setupEventListeners();
    setActiveEngine(currentEngine);
    initWidgets();
});

// 初始化小组件
function initWidgets() {
    loadWeather();
    renderCalendar();
    loadQuote();
}

// 加载天气信息
async function loadWeather() {
    const weatherContent = document.getElementById('weatherContent');
    
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchWeatherByCoords(latitude, longitude);
                },
                () => {
                    fetchWeatherByCity('Beijing');
                }
            );
        } else {
            await fetchWeatherByCity('Beijing');
        }
    } catch (error) {
        weatherContent.innerHTML = '<div class="weather-loading">天气加载失败</div>';
    }
}

async function fetchWeatherByCoords(lat, lon) {
    const weatherContent = document.getElementById('weatherContent');
    
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        );
        const data = await response.json();
        
        const temp = Math.round(data.current_weather.temperature);
        const weatherCode = data.current_weather.weathercode;
        const weatherDesc = getWeatherDescription(weatherCode);
        const weatherIcon = getWeatherIcon(weatherCode);
        
        weatherContent.innerHTML = `
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
        weatherContent.innerHTML = '<div class="weather-loading">天气加载失败</div>';
    }
}

async function fetchWeatherByCity(city) {
    const weatherContent = document.getElementById('weatherContent');
    
    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );
        const geoData = await geoResponse.json();
        
        if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude, name } = geoData.results[0];
            await fetchWeatherByCoords(latitude, longitude);
            
            const cityElement = document.querySelector('.weather-city');
            if (cityElement) {
                cityElement.textContent = name;
            }
        }
    } catch (error) {
        weatherContent.innerHTML = '<div class="weather-loading">天气加载失败</div>';
    }
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: '晴朗',
        1: '大部晴朗', 2: '多云', 3: '阴天',
        45: '雾', 48: '雾凇',
        51: '小雨', 53: '中雨', 55: '大雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        71: '小雪', 73: '中雪', 75: '大雪',
        80: '阵雨', 81: '中阵雨', 82: '大阵雨',
        95: '雷暴', 96: '雷暴冰雹', 99: '强雷暴'
    };
    return weatherCodes[code] || '未知';
}

function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 55) return '🌧️';
    if (code <= 65) return '🌧️';
    if (code <= 75) return '❄️';
    if (code <= 82) return '🌦️';
    if (code <= 99) return '⛈️';
    return '🌤️';
}

// 渲染日历
function renderCalendar() {
    const calendarContent = document.getElementById('calendarContent');
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
    
    dayNames.forEach(day => {
        html += `<div class="calendar-day-name">${day}</div>`;
    });
    
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
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
    calendarContent.innerHTML = html;
}

// 加载每日一言
async function loadQuote() {
    const quoteContent = document.getElementById('quoteContent');
    const quoteTitle = document.getElementById('quoteTitle');
    
    const quotes = [
        { text: '人生就像一场旅行，不必在乎目的地，在乎的是沿途的风景以及看风景的心情。', author: '匿名', type: '一言' },
        { text: '成功不是终点，失败也不是终结，唯有继续前行的勇气才是最重要的。', author: '丘吉尔', type: '一言' },
        { text: '生活不是等待风暴过去，而是学会在雨中翩翩起舞。', author: '维维安·格林', type: '一言' },
        { text: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', author: '孟浩然', type: '一诗' },
        { text: '人生若只如初见，何事秋风悲画扇。', author: '纳兰性德', type: '一诗' },
        { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游', type: '一诗' },
        { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原', type: '一诗' },
        { text: '不识庐山真面目，只缘身在此山中。', author: '苏轼', type: '一诗' },
        { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '佚名', type: '一诗' },
        { text: '天行健，君子以自强不息。', author: '周易', type: '一言' },
        { text: '千里之行，始于足下。', author: '老子', type: '一言' },
        { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白', type: '一诗' },
        { text: '会当凌绝顶，一览众山小。', author: '杜甫', type: '一诗' },
        { text: '海纳百川，有容乃大；壁立千仞，无欲则刚。', author: '林则徐', type: '一言' },
        { text: '书山有路勤为径，学海无涯苦作舟。', author: '韩愈', type: '一言' }
    ];
    
    const today = new Date();
    const index = today.getDate() % quotes.length;
    const quote = quotes[index];
    
    quoteTitle.textContent = `每日${quote.type}`;
    
    quoteContent.innerHTML = `
        <div class="quote-content">
            <div class="quote-text">${quote.text}</div>
            <div class="quote-author">${quote.author}</div>
        </div>
    `;
}

// 更新时间
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
    
    document.getElementById('time').textContent = `${hours}:${minutes}`;
    document.getElementById('date').textContent = dateStr;
    
    const hour = now.getHours();
    let greeting = '你好';
    if (hour >= 5 && hour < 12) greeting = '早上好';
    else if (hour >= 12 && hour < 14) greeting = '中午好';
    else if (hour >= 14 && hour < 18) greeting = '下午好';
    else if (hour >= 18 && hour < 22) greeting = '晚上好';
    else greeting = '夜深了';
    
    document.getElementById('greeting').textContent = greeting;
}

// 渲染快捷方式
function renderShortcuts() {
    const grid = document.getElementById('shortcutsGrid');
    grid.innerHTML = '';
    
    shortcuts.forEach((shortcut, index) => {
        const card = document.createElement('div');
        card.className = 'shortcut-card';
        card.dataset.index = index;
        card.draggable = true;
        
        const icon = document.createElement('div');
        icon.className = 'shortcut-icon';
        icon.style.background = shortcut.color;
        
        const domain = new URL(shortcut.url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        const faviconImg = new Image();
        faviconImg.onload = () => {
            icon.innerHTML = '';
            icon.style.background = shortcut.color;
            const img = document.createElement('img');
            img.src = faviconUrl;
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.borderRadius = '8px';
            icon.appendChild(img);
        };
        faviconImg.onerror = () => {
            icon.textContent = shortcut.name.charAt(0).toUpperCase();
        };
        faviconImg.src = faviconUrl;
        
        const name = document.createElement('div');
        name.className = 'shortcut-name';
        name.textContent = shortcut.name;
        
        card.appendChild(icon);
        card.appendChild(name);
        
        card.addEventListener('click', (e) => {
            if (!card.classList.contains('dragging')) {
                window.open(shortcut.url, '_blank');
            }
        });
        
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, index);
        });
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);
        
        grid.appendChild(card);
    });
}

// 设置事件监听
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const engineBtns = document.querySelectorAll('.engine-btn');
    const addBtn = document.getElementById('addShortcutBtn');
    const modal = document.getElementById('shortcutModal');
    const modalClose = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    const colorBtns = document.querySelectorAll('.color-btn');
    const contextMenu = document.getElementById('contextMenu');
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                if (query.startsWith('http://') || query.startsWith('https://')) {
                    window.open(query, '_blank');
                } else {
                    window.open(searchEngines[currentEngine] + encodeURIComponent(query), '_blank');
                }
                searchInput.value = '';
            }
        }
    });
    
    engineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentEngine = btn.dataset.engine;
            localStorage.setItem('searchEngine', currentEngine);
            setActiveEngine(currentEngine);
        });
    });
    
    addBtn.addEventListener('click', () => {
        editingIndex = null;
        document.getElementById('modalTitle').textContent = '添加快捷方式';
        document.getElementById('shortcutName').value = '';
        document.getElementById('shortcutUrl').value = '';
        selectedColor = '#FF6B6B';
        updateColorSelection();
        modal.classList.add('active');
    });
    
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    saveBtn.addEventListener('click', saveShortcut);
    
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedColor = btn.dataset.color;
            updateColorSelection();
        });
    });
    
    document.getElementById('editShortcut').addEventListener('click', () => {
        if (editingIndex !== null) {
            const shortcut = shortcuts[editingIndex];
            document.getElementById('modalTitle').textContent = '编辑快捷方式';
            document.getElementById('shortcutName').value = shortcut.name;
            document.getElementById('shortcutUrl').value = shortcut.url;
            selectedColor = shortcut.color;
            updateColorSelection();
            contextMenu.classList.remove('active');
            modal.classList.add('active');
        }
    });
    
    document.getElementById('deleteShortcut').addEventListener('click', () => {
        if (editingIndex !== null) {
            contextMenu.classList.remove('active');
            showPasswordModal();
        }
    });
    
    setupPasswordModal();
    
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.classList.remove('active');
        }
    });
}

function setActiveEngine(engine) {
    document.querySelectorAll('.engine-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.engine === engine);
    });
}

function showContextMenu(e, index) {
    const contextMenu = document.getElementById('contextMenu');
    editingIndex = index;
    
    const x = e.clientX;
    const y = e.clientY;
    
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
    contextMenu.classList.add('active');
}

function closeModal() {
    document.getElementById('shortcutModal').classList.remove('active');
}

function saveShortcut() {
    const name = document.getElementById('shortcutName').value.trim();
    let url = document.getElementById('shortcutUrl').value.trim();
    
    if (!name || !url) {
        alert('请填写完整信息');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        new URL(url);
    } catch {
        alert('请输入有效的网址');
        return;
    }
    
    const shortcut = { name, url, color: selectedColor };
    
    if (editingIndex !== null) {
        shortcuts[editingIndex] = shortcut;
    } else {
        shortcuts.push(shortcut);
    }
    
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
    closeModal();
}

function updateColorSelection() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === selectedColor);
    });
}

function setupPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const passwordModalClose = document.getElementById('passwordModalClose');
    const passwordCancelBtn = document.getElementById('passwordCancelBtn');
    const passwordConfirmBtn = document.getElementById('passwordConfirmBtn');
    
    passwordModalClose.addEventListener('click', closePasswordModal);
    passwordCancelBtn.addEventListener('click', closePasswordModal);
    
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) closePasswordModal();
    });
    
    passwordConfirmBtn.addEventListener('click', verifyPassword);
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
}

function showPasswordModal() {
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    passwordInput.value = '';
    passwordModal.classList.add('active');
    setTimeout(() => passwordInput.focus(), 100);
}

function closePasswordModal() {
    document.getElementById('passwordModal').classList.remove('active');
}

function verifyPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    
    if (password === DELETE_PASSWORD) {
        if (editingIndex !== null) {
            shortcuts.splice(editingIndex, 1);
            localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
            renderShortcuts();
            closePasswordModal();
            editingIndex = null;
        }
    } else {
        passwordInput.value = '';
        passwordInput.focus();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = '密码错误，请重试';
        errorMsg.style.cssText = 'color: #FF6B6B; font-size: 14px; margin-top: 8px;';
        
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        passwordInput.parentElement.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 2000);
    }
}

function handleDragStart(e) {
    draggedItem = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const targetIndex = parseInt(this.dataset.index);
    if (draggedIndex !== targetIndex) {
        this.classList.add('drag-over');
    }
    
    return false;
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const targetIndex = parseInt(this.dataset.index);
    
    if (draggedIndex !== targetIndex) {
        const draggedShortcut = shortcuts[draggedIndex];
        shortcuts.splice(draggedIndex, 1);
        shortcuts.splice(targetIndex, 0, draggedShortcut);
        
        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
        renderShortcuts();
    }
    
    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.shortcut-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}
