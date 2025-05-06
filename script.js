// Timer variables
let timeLeft;
let timerId = null;
let isWorkMode = true;
let completedPomodoros = 0;
let totalFocusTime = 0;
let pomodorosUntilLongBreak = 4;
let currentPomodoroCount = 0;

// Timer settings
const settings = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false
};

// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start-timer');
const pauseButton = document.getElementById('pause-timer');
const resetButton = document.getElementById('reset-timer');
const workModeButton = document.getElementById('work-mode');
const breakModeButton = document.getElementById('break-mode');
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const focusTimeDisplay = document.getElementById('focus-time');
const completedPomodorosDisplay = document.getElementById('completed-pomodoros');
const completionProgress = document.getElementById('completion-progress');
const completionText = document.getElementById('completion-text');
const filterButtons = document.querySelectorAll('.filter-btn');

// Load data from localStorage
let todos = JSON.parse(localStorage.getItem('todos')) || [];
const savedSettings = JSON.parse(localStorage.getItem('timerSettings'));
if (savedSettings) {
    Object.assign(settings, savedSettings);
}
const savedStats = JSON.parse(localStorage.getItem('stats')) || {
    completedPomodoros: 0,
    totalFocusTime: 0
};
completedPomodoros = savedStats.completedPomodoros;
totalFocusTime = savedStats.totalFocusTime;

// Timer variables and DOM elements
const flipUnits = {
    minutesTens: document.querySelector('.minutes-tens'),
    minutesOnes: document.querySelector('.minutes-ones'),
    secondsTens: document.querySelector('.seconds-tens'),
    secondsOnes: document.querySelector('.seconds-ones')
};

// Timer Functions
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const digitalTimer = document.getElementById('digital-timer');
    if (digitalTimer) {
        digitalTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startTimer() {
    if (timerId === null) {
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                playAlarm();
                
                if (isWorkMode) {
                    completedPomodoros++;
                    currentPomodoroCount++;
                    totalFocusTime += settings.workDuration * 60;
                    updateStats();
                    
                    if (currentPomodoroCount >= settings.pomodorosUntilLongBreak) {
                        switchToLongBreak();
                    } else if (settings.autoStartBreaks) {
                        switchToBreak();
                    }
                } else {
                    if (settings.autoStartBreaks) {
                        switchToWork();
                    }
                }
            }
        }, 1000);
        
        startButton.disabled = true;
        pauseButton.disabled = false;
    }
}

function updateStats() {
    localStorage.setItem('stats', JSON.stringify({ completedPomodoros, totalFocusTime }));
    completedPomodorosDisplay.textContent = completedPomodoros;
    const hours = Math.floor(totalFocusTime / 3600);
    const minutes = Math.floor((totalFocusTime % 3600) / 60);
    focusTimeDisplay.textContent = `${hours}h ${minutes}m`;
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = isWorkMode ? settings.workDuration * 60 : settings.breakDuration * 60;
    updateTimerDisplay();
    startButton.disabled = false;
    pauseButton.disabled = true;
}

function switchToWork() {
    isWorkMode = true;
    timeLeft = settings.workDuration * 60;
    updateTimerDisplay();
    workModeButton.classList.add('active');
    breakModeButton.classList.remove('active');
}

function switchToBreak() {
    isWorkMode = false;
    timeLeft = settings.breakDuration * 60;
    updateTimerDisplay();
    workModeButton.classList.remove('active');
    breakModeButton.classList.add('active');
}

function switchToLongBreak() {
    isWorkMode = false;
    timeLeft = settings.longBreakDuration * 60;
    currentPomodoroCount = 0;
    updateTimerDisplay();
    workModeButton.classList.remove('active');
    breakModeButton.classList.add('active');
}

function playAlarm() {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play();
}

// Settings Functions
function showSettings() {
    document.getElementById('work-duration').value = settings.workDuration;
    document.getElementById('break-duration').value = settings.breakDuration;
    document.getElementById('long-break-duration').value = settings.longBreakDuration;
    document.getElementById('pomodoros-until-long-break').value = settings.pomodorosUntilLongBreak;
    document.getElementById('auto-start-breaks').checked = settings.autoStartBreaks;
    settingsModal.classList.add('show');
}

function closeSettings() {
    settingsModal.classList.remove('show');
}

function saveSettings() {
    settings.workDuration = parseInt(document.getElementById('work-duration').value);
    settings.breakDuration = parseInt(document.getElementById('break-duration').value);
    settings.longBreakDuration = parseInt(document.getElementById('long-break-duration').value);
    settings.pomodorosUntilLongBreak = parseInt(document.getElementById('pomodoros-until-long-break').value);
    settings.autoStartBreaks = document.getElementById('auto-start-breaks').checked;
    
    localStorage.setItem('timerSettings', JSON.stringify(settings));
    resetTimer();
    closeSettings();
}

// Todo List Functions
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
    updateProgress();
}

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText) {
        const todo = {
            id: Date.now(),
            text: todoText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(todo);
        renderTodo(todo);
        saveTodos();
        todoInput.value = '';
    }
}

function renderTodo(todo) {
    const todoItem = document.createElement('div');
    todoItem.classList.add('todo-item');
    if (todo.completed) todoItem.classList.add('completed');
    
    todoItem.innerHTML = `
        <span class="todo-text">${todo.text}</span>
        <div class="todo-actions">
            <button class="complete-btn" onclick="toggleTodo(${todo.id})">
                <i class="fas ${todo.completed ? 'fa-undo' : 'fa-check'}"></i>
            </button>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    todoList.appendChild(todoItem);
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';
    const currentFilter = document.querySelector('.filter-btn.active').dataset.filter;
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    filteredTodos.forEach(renderTodo);
}

function updateProgress() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    completionProgress.style.width = `${percentage}%`;
    completionText.textContent = `${percentage}% completed`;
}

// Event Listeners
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
workModeButton.addEventListener('click', switchToWork);
breakModeButton.addEventListener('click', switchToBreak);
addButton.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});
settingsBtn.addEventListener('click', showSettings);
saveSettingsBtn.addEventListener('click', saveSettings);
closeSettingsBtn.addEventListener('click', closeSettings);

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        button.classList.add('active');
        renderTodos();
    });
});

// Initial setup
if (isNaN(settings.workDuration) || !settings.workDuration) settings.workDuration = 25;
if (isNaN(settings.breakDuration) || !settings.breakDuration) settings.breakDuration = 5;
if (isNaN(settings.longBreakDuration) || !settings.longBreakDuration) settings.longBreakDuration = 15;
if (typeof timeLeft === 'undefined' || isNaN(timeLeft)) timeLeft = settings.workDuration * 60;
updateTimerDisplay();
updateStats();
renderTodos();

// Space Background Animation
function createStars() {
    const spaceBackground = document.getElementById('space-background');
    const numberOfStars = {
        small: 300,
        medium: 100,
        large: 50
    };
    const numberOfShootingStars = 3;

    // Create stars of different sizes
    Object.entries(numberOfStars).forEach(([size, count]) => {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = `star ${size}`;
            
            // Random position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Random twinkle animation
            const duration = 2 + Math.random() * 3;
            star.style.animation = `twinkle ${duration}s ease-in-out infinite`;
            star.style.animationDelay = `${Math.random() * duration}s`;
            
            spaceBackground.appendChild(star);
        }
    });

    // Create shooting stars
    function createShootingStar() {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        
        // Random starting position
        const startX = -100 + Math.random() * 50; // Start slightly off-screen
        const startY = Math.random() * 50;
        star.style.left = `${startX}px`;
        star.style.top = `${startY}%`;
        
        // Random rotation
        const rotation = 15 + Math.random() * 60;
        star.style.transform = `rotate(${rotation}deg)`;
        
        spaceBackground.appendChild(star);
        
        // Remove the shooting star after animation
        setTimeout(() => {
            star.remove();
            createShootingStar();
        }, 2000);
    }

    // Initialize shooting stars with random delays
    for (let i = 0; i < numberOfShootingStars; i++) {
        setTimeout(() => createShootingStar(), i * 2000 + Math.random() * 3000);
    }
}

// Initialize space background
createStars();
