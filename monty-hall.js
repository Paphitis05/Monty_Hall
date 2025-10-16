// Game state
let doorContents = [];
let selectedDoor = null;
let revealedDoor = null;
let finalChoice = null;
let phase = 'initial'; // initial, selected, revealed, final
let didSwitch = false;
let retryMode = true; // Toggle for retry feature

// Statistics
let stats = {
    switchWins: 0,
    switchLosses: 0,
    stayWins: 0,
    stayLosses: 0,
    retries: 0
};

// Initialize game
function initializeGame() {
    // Shuffle door contents based on retry mode
    if (retryMode) {
        doorContents = ['trophy', 'retry', 'lose'];
    } else {
        doorContents = ['trophy', 'lose', 'lose'];
    }
    for (let i = doorContents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [doorContents[i], doorContents[j]] = [doorContents[j], doorContents[i]];
    }
    
    selectedDoor = null;
    revealedDoor = null;
    finalChoice = null;
    phase = 'initial';
    didSwitch = false;
    
    // Reset UI
    document.getElementById('status').classList.add('hidden');
    document.getElementById('actions').classList.add('hidden');
    document.getElementById('playAgain').classList.add('hidden');
    
    const doors = document.querySelectorAll('.door');
    doors.forEach((door, index) => {
        door.classList.remove('open', 'selected', 'revealed');
        door.querySelector('.door-content').innerHTML = index + 1;
        door.style.pointerEvents = 'auto';
    });
}

// Handle door click
function handleDoorClick(doorIndex) {
    if (phase !== 'initial') return;
    
    selectedDoor = doorIndex;
    phase = 'selected';
    
    // Highlight selected door
    document.querySelectorAll('.door')[doorIndex].classList.add('selected');
    
    // Show status
    const status = document.getElementById('status');
    status.textContent = 'The host is checking the doors...';
    status.classList.remove('hidden');
    
    // Reveal a door after delay
    setTimeout(() => {
        const availableDoors = [0, 1, 2].filter(
            d => d !== doorIndex && doorContents[d] !== 'trophy'
        );
        revealedDoor = availableDoors[Math.floor(Math.random() * availableDoors.length)];
        
        // Open revealed door
        const revealedDoorEl = document.querySelectorAll('.door')[revealedDoor];
        revealedDoorEl.classList.add('open', 'revealed');
        revealedDoorEl.querySelector('.door-content').innerHTML = getDoorIcon(doorContents[revealedDoor]);
        
        // Update status and show actions
        status.textContent = 'Will you switch your choice?';
        document.getElementById('actions').classList.remove('hidden');
        document.getElementById('stayDoorNum').textContent = selectedDoor + 1;
        
        phase = 'revealed';
    }, 800);
}

// Get icon for door content
function getDoorIcon(content) {
    if (content === 'trophy') return '🏆';
    if (content === 'retry') return '🔄';
    return '❌';
}

// Handle switch/stay decision
function handleDecision(switchDoor) {
    if (selectedDoor === null) return;
    
    finalChoice = selectedDoor;
    if (switchDoor) {
        finalChoice = [0, 1, 2].find(d => d !== selectedDoor && d !== revealedDoor);
        didSwitch = true;
    }
    
    const result = doorContents[finalChoice];
    const finalDoorEl = document.querySelectorAll('.door')[finalChoice];
    
    // Hide action buttons
    document.getElementById('actions').classList.add('hidden');
    
    // Open final door
    finalDoorEl.classList.add('open', 'selected');
    finalDoorEl.querySelector('.door-content').innerHTML = getDoorIcon(result);
    
    // Disable all doors
    document.querySelectorAll('.door').forEach(door => {
        door.style.pointerEvents = 'none';
    });
    
    // Handle result
    const status = document.getElementById('status');
    
    if (result === 'retry') {
        stats.retries++;
        updateStats();
        status.innerHTML = '🔄 Free retry! Starting new game...';
        status.className = 'status retry-status';
        setTimeout(() => {
            initializeGame();
        }, 2000);
    } else {
        phase = 'final';
        const won = result === 'trophy';
        
        // Update stats
        if (switchDoor) {
            if (won) stats.switchWins++;
            else stats.switchLosses++;
        } else {
            if (won) stats.stayWins++;
            else stats.stayLosses++;
        }
        updateStats();
        
        // Update status
        if (won) {
            status.innerHTML = `🏆 You won the trophy! ${didSwitch ? '(Switched)' : '(Stayed)'}`;
            status.className = 'status win-status';
        } else {
            status.innerHTML = `❌ You lost! ${didSwitch ? '(Switched)' : '(Stayed)'}`;
            status.className = 'status lose-status';
        }
        
        // Show play again button
        document.getElementById('playAgain').classList.remove('hidden');
    }
}

// Update statistics display
function updateStats() {
    document.getElementById('switchWins').textContent = stats.switchWins;
    document.getElementById('switchLosses').textContent = stats.switchLosses;
    document.getElementById('stayWins').textContent = stats.stayWins;
    document.getElementById('stayLosses').textContent = stats.stayLosses;
    document.getElementById('retryCount').textContent = stats.retries;
    
    const switchTotal = stats.switchWins + stats.switchLosses;
    const stayTotal = stats.stayWins + stats.stayLosses;
    
    const switchRate = switchTotal > 0 ? (stats.switchWins / switchTotal) * 100 : 0;
    const stayRate = stayTotal > 0 ? (stats.stayWins / stayTotal) * 100 : 0;
    
    document.getElementById('switchBar').style.width = switchRate + '%';
    document.getElementById('stayBar').style.width = stayRate + '%';
    document.getElementById('switchPercent').textContent = switchRate.toFixed(1) + '%';
    document.getElementById('stayPercent').textContent = stayRate.toFixed(1) + '%';
}

// Reset statistics
function resetStats() {
    stats = {
        switchWins: 0,
        switchLosses: 0,
        stayWins: 0,
        stayLosses: 0,
        retries: 0
    };
    updateStats();
}

// Toggle retry mode
function toggleRetryMode() {
    retryMode = !retryMode;
    const retryToggle = document.getElementById('retryToggle');
    retryToggle.textContent = retryMode ? 'Retry Mode: ON' : 'Retry Mode: OFF';
    retryToggle.className = retryMode ? 'btn btn-toggle-on' : 'btn btn-toggle-off';
    
    // Update stats note
    const statsNote = document.querySelector('.stats-note');
    const retryCountEl = document.querySelector('.retry-count');
    if (retryMode) {
        statsNote.textContent = 'One door has a trophy (win), one has a retry, and one makes you lose!';
        retryCountEl.style.display = 'block';
    } else {
        statsNote.textContent = 'One door has a trophy (win), two doors make you lose!';
        retryCountEl.style.display = 'none';
    }
    
    // Reset stats when changing mode
    resetStats();
    initializeGame();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    
    // Door clicks
    document.querySelectorAll('.door').forEach(door => {
        door.addEventListener('click', () => {
            const index = parseInt(door.getAttribute('data-index'));
            handleDoorClick(index);
        });
    });
    
    // Action buttons
    document.getElementById('switchBtn').addEventListener('click', () => handleDecision(true));
    document.getElementById('stayBtn').addEventListener('click', () => handleDecision(false));
    document.getElementById('playAgainBtn').addEventListener('click', initializeGame);
    document.getElementById('resetStatsBtn').addEventListener('click', resetStats);
    document.getElementById('retryToggle').addEventListener('click', toggleRetryMode);
});
