// --- ESTRUCTURA DE DATOS (Símbolos en SVG vectorial directo) ---
// --- SÍMBOLOS SELECCIONADOS DE LAS TABLAS ---
const dataIEC = [
  { id: 'contactoNA', name: 'Contacto N.A.', image: 'img/iec_contactoNA.png' },
  { id: 'pulsador_cerrado', name: 'Boton Pulsador Cerrado', image: 'img/iec_pulsador_cerrado.png' },
  { id: 'int_seccionador', name: 'Interruptor Seccionador', image: 'img/iec_interruptor_seccionador.png' },
  { id: 'transfo_tension', name: 'Tranformador de Tension', image: 'img/iec_transfo_tension.png' },
  { id: 'contactor_tri', name: 'Contractor Trifasico', image: 'img/iec_contactor_tri.png' },
  { id: 'transfo_estrella', name: 'Transformador Estrella-Estrella', image: 'img/iec_transfo_estrella.png' }
];

const dataNEMA = [
  { id: 'motor_3f', name: 'Motor Trifásico', image: 'img/nema_motor_3f.png' },
  { id: 'AL', name: 'Corriente Alterna', image: 'img/nema_alterna.png' },
  { id: 'transfo_delta', name: 'Transformador Delta-Delta', image: 'img/nema_transfo_delta.png' },
  { id: 'tranfo_tension', name: 'Transformador de Tension', image: 'img/nema_tranfo_tension.png' },
  { id: 'pulsador abierto', name: 'Boton Pulsador Abierto', image: 'img/nema_pulsador_abierto.png' },
  { id: 'relevador_sobrecarga', name: 'Relevador de Sobrecarga', image: 'img/nema_relevador_sobrecarga.png' }
];

// --- VARIABLES DE ESTADO ---
let currentData = [];
let timerInterval = null;
let timeLeft = 120;

// --- ELEMENTOS DEL DOM ---
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

const btnIEC = document.getElementById('btn-iec');
const btnNEMA = document.getElementById('btn-nema');
const btnRestart = document.getElementById('btn-restart');

const normTitle = document.getElementById('norm-title');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');

const symbolsContainer = document.getElementById('symbols-container');
const targetsContainer = document.getElementById('targets-container');

const finalScore = document.getElementById('final-score');
const maxScore = document.getElementById('max-score');
const finalHits = document.getElementById('final-hits');
const totalItems = document.getElementById('total-items');
const starRating = document.getElementById('star-rating');

// --- EVENTOS ---
btnIEC.addEventListener('click', () => startGame('IEC'));
btnNEMA.addEventListener('click', () => startGame('NEMA'));
btnRestart.addEventListener('click', resetToHome);

function startGame(norm) {
  currentData = norm === 'IEC' ? [...dataIEC] : [...dataNEMA];
  normTitle.textContent = `Norma: ${norm}`;
  
  timeLeft = 120;
  scoreDisplay.textContent = '0';
  
  showScreen(gameScreen);
  renderBoard();
  startTimer();
}

function showScreen(screenToShow) {
  [startScreen, gameScreen, endScreen].forEach(screen => screen.classList.remove('active'));
  screenToShow.classList.add('active');
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function renderBoard() {
  symbolsContainer.innerHTML = '';
  targetsContainer.innerHTML = '';

  const shuffledSymbols = [...currentData].sort(() => Math.random() - 0.5);
  const shuffledTargets = [...currentData].sort(() => Math.random() - 0.5);

  shuffledSymbols.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('symbol-card');
    card.setAttribute('draggable', 'true');
    card.dataset.id = item.id;

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;

    card.appendChild(img);
    symbolsContainer.appendChild(card);

    card.addEventListener('dragstart', handleDragStart);
  });

  shuffledTargets.forEach(item => {
    const zone = document.createElement('div');
    zone.classList.add('drop-zone');
    zone.dataset.id = item.id;

    const title = document.createElement('span');
    title.classList.add('zone-title');
    title.textContent = item.name;

    zone.appendChild(title);
    targetsContainer.appendChild(zone);

    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
  });
}

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragOver(e) {
  e.preventDefault();
  if (!this.classList.contains('filled')) {
    this.classList.add('hovered');
  }
}

function handleDragLeave() {
  this.classList.remove('hovered');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('hovered');

  // Si la zona ya tiene un símbolo, no permite colocar otro
  if (this.querySelector('.symbol-card')) return;

  // Insertar la tarjeta al costado sin agregar clases de color verde/rojo
  this.appendChild(draggedElement);

  // Verificar si todas las casillas del tablero ya fueron ocupadas
  const placedCards = document.querySelectorAll('.targets-container .symbol-card');
  if (placedCards.length === currentData.length) {
    clearInterval(timerInterval);
    setTimeout(endGame, 600);
  }
}

function endGame() {
  clearInterval(timerInterval);
  
  let hits = 0;
  const dropZones = document.querySelectorAll('.drop-zone');

  // Evaluar respuestas solo al finalizar
  dropZones.forEach(zone => {
    const targetId = zone.dataset.id;
    const symbolCard = zone.querySelector('.symbol-card');
    
    if (symbolCard && symbolCard.dataset.id === targetId) {
      hits++;
    }
  });

  const finalScoreValue = hits * 10;
  const maxPossibleScore = currentData.length * 10;
  
  finalScore.textContent = finalScoreValue;
  maxScore.textContent = maxPossibleScore;
  finalHits.textContent = hits;
  totalItems.textContent = currentData.length;

  // Valoración con estrellas según los aciertos totales
  const percentage = (hits / currentData.length) * 100;
  if (percentage === 100) {
    starRating.textContent = '⭐⭐⭐ (¡Excelente nivel!)';
  } else if (percentage >= 60) {
    starRating.textContent = '⭐⭐ (Buen nivel)';
  } else {
    starRating.textContent = '⭐ (Debes repasar)';
  }

  showScreen(endScreen);
}

function resetToHome() {
  clearInterval(timerInterval);
  showScreen(startScreen);
}