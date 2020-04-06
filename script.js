const buttons = ['Start New Game', 'Stop', 'Save', 'Results'];

// game options
const GAME_SIZE = 4;
const GAME_W = 500;
const margin = 1.5;
const KEY_SIZE = Math.round((GAME_W - (GAME_SIZE - 1) * margin) / GAME_SIZE);

// game state
let COUNT_STEPS = 0;
let TIME_ELAPSED = '00:00';
let timer = new Date(0, 0, 0, 0, 0);
let isPaused = false;
let currentPosition = [];
let winPosition = [];
let EMPTY = { x: 0, y: 0 };
let emptyKey = {};
let timerId;
let gameDuration;

const generateStartPosition = () => {
  const arr = [];
  const positionsSet = new Set(Array(GAME_SIZE * GAME_SIZE).fill(1).map((a, i) => i));
  let rndPosition = 0;

  while (positionsSet.size > 0) {
    rndPosition = Math.floor(Math.random() * Math.floor(GAME_SIZE * GAME_SIZE + 1));
    if (positionsSet.has(rndPosition)) {
      arr.push(rndPosition);
      positionsSet.delete(rndPosition);
    }
  }
  // currentPosition = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15];
  currentPosition = arr;
};

const generateWinPosition = () => {
  const arr = new Array(GAME_SIZE * GAME_SIZE);
  for (let i = 0; i < arr.length; i += 1) {
    arr[i] = i + 1;
  }
  arr[arr.length - 1] = 0;
  winPosition = arr;
};

const isWinGame = () => {
  for (let i = 0; i < winPosition.length; i += 1) {
    if (winPosition[i] !== currentPosition[i]) return false;
  }

  return true;
};

const highlightCorrectPosition = (index) => {
  if (index) {
    const key = document.getElementById(`key${index}`);
    if (winPosition[index - 1] === currentPosition[index - 1]) {
      key.classList.add('rigth-position');
    } else key.classList.remove('rigth-position');
    return;
  }

  for (let i = 1; i < winPosition.length; i += 1) {
    const key = document.getElementById(`key${i}`);
    if (winPosition[i - 1] === currentPosition[i - 1]) {
      key.classList.add('rigth-position');
    } else key.classList.remove('rigth-position');
  }
};


const WinGame = () => {
  const congratMsg = `You have won the game by ${COUNT_STEPS} moves. Spend time^${TIME_ELAPSED}`;
  alert(congratMsg);

  clearTimeout(timerId);
};

const startTime = () => {
  TIME_ELAPSED = `${timer.getMinutes().toString().padStart(2, '0')}:${timer.getSeconds().toString().padStart(2, '0')}`;

  gameDuration.textContent = TIME_ELAPSED;

  timerId = setTimeout(() => {
    timer.setSeconds(timer.getSeconds() + 1);
    startTime();
  }, 1000);
};

const cntSteps = (start) => {
  COUNT_STEPS = (start !== 0) ? COUNT_STEPS + 1 : 0;
  document.getElementById('countSteps').textContent = COUNT_STEPS;
};

const getKeyCoordinateByIndex = (index) => ({ x: (index % GAME_SIZE), y: Math.trunc(index / GAME_SIZE) });

const getKeyCoordinateByPosition = (elem) => {
  const left = parseInt(elem.style.left);
  const top = parseInt(elem.style.top);

  const xx = Math.round((left / KEY_SIZE));
  const yy = Math.round((top / KEY_SIZE));

  return { x: xx, y: yy };
};

const createButton = (buttonName) => {
  const container = document.querySelector('.control-container');
  const button = document.createElement('button');
  button.classList.add('control-button');
  button.id = buttonName.split(' ').join('');
  button.innerText = buttonName;
  container.append(button);
};

const createGameState = () => {
  const container = document.querySelector('.game-state');
  container.insertAdjacentHTML('beforeend', '<label>Step: </label>');
  container.insertAdjacentHTML('beforeend', `<label id='countSteps'>${COUNT_STEPS}</label>`);
  container.insertAdjacentHTML('beforeend', '<label>Time: </label>');
  container.insertAdjacentHTML('beforeend', `<label id='timeElapsed'>${TIME_ELAPSED}</label>`);
  gameDuration = document.getElementById('timeElapsed');
};

const getTopPosition = (index) => KEY_SIZE * Math.trunc(index / GAME_SIZE);

const getLeftPosition = (index) => KEY_SIZE * (index % GAME_SIZE);

const getIndexByPosition = (top, left) => Math.round(left / KEY_SIZE + GAME_SIZE * (top / KEY_SIZE));

const savePosition = () => {
  const keys = document.querySelectorAll('[class^=key]');
  const res = new Array(16);

  keys.forEach((key) => {
    const left = parseInt(key.style.left);
    const top = parseInt(key.style.top);
    res[(getIndexByPosition(top, left))] = +key.id.slice(3);
  });

  currentPosition = res;
};

const moveHorizontal = (direction, elem) => {
  const key = elem;
  const currLeft = parseInt(elem.style.left);
  if (currLeft + direction * KEY_SIZE * 2 > GAME_W || currLeft + direction < 0) return;
  key.style.left = `${parseInt(elem.style.left) + direction * KEY_SIZE}px`;
};

const moveVertical = (direction, elem) => {
  const key = elem;
  const currTop = parseInt(elem.style.top);
  if (currTop + direction * KEY_SIZE * 2 > GAME_W || currTop + direction < 0) return;
  key.style.top = `${parseInt(elem.style.top) + direction * KEY_SIZE}px`;
};


const createKeys = (position) => {
  const field = document.querySelector('.game-field');
  field.innerHTML = '';
  for (let i = 0; i < GAME_SIZE * GAME_SIZE; i += 1) {
    const key = document.createElement('div');
    key.id = `key${position[i]}`;
    key.style.left = `${getLeftPosition(i)}px`;
    key.style.top = `${getTopPosition(i)}px`;
    if (position[i] > 0) {
      key.classList.add('key');
      key.insertAdjacentHTML('beforeend', `<span>${position[i]}</span>`);
    } else {
      key.classList.add('key-empty');
      EMPTY = getKeyCoordinateByIndex(i);
    }
    field.append(key);
  }
  emptyKey = document.querySelector('.key-empty');
};

const createBase = () => {
  const wrapper = document.createElement('div');

  wrapper.classList.add('wrapper');
  wrapper.id = 'wrapper';
  document.body.insertBefore(wrapper, document.querySelector('script'));

  // control panel
  const controlContainer = document.createElement('div');
  controlContainer.classList.add('control-container');
  wrapper.append(controlContainer);
  buttons.forEach((btnName) => createButton(btnName));

  // game state
  const gameState = document.createElement('div');
  gameState.classList.add('game-state');
  wrapper.append(gameState);
  createGameState();

  // game field
  const gameField = document.createElement('div');
  gameField.classList.add('game-field');
  gameField.id = 'gamefield';
  wrapper.append(gameField);
  createKeys(currentPosition);
};

const isMoveEnabled = (key, empty) => ((key.x === empty.x && Math.abs(key.y - empty.y) === 1)
  || (key.y === empty.y && Math.abs(key.x - empty.x) === 1));

const moveKey = (keyCoord, newKeyCoord, elem) => {
  if (keyCoord.x === newKeyCoord.x) {
    moveVertical(-1 * Math.sign(keyCoord.y - newKeyCoord.y), elem);
  }

  if (keyCoord.y === newKeyCoord.y) {
    moveHorizontal(-1 * Math.sign(keyCoord.x - newKeyCoord.x), elem);
  }
};

const moveEmptyKey = (keyCoord, newKeyCoord) => {
  moveKey(keyCoord, newKeyCoord, emptyKey);
  EMPTY = newKeyCoord;
};

const onClickOnField = (event) => {
  const elem = event.target.closest('div');
  const keyId = event.target.closest('div').id;

  if (keyId !== 'gamefield' && keyId !== 'key0') {
    const keyCoord = getKeyCoordinateByPosition(elem);

    if (isMoveEnabled(keyCoord, EMPTY)) {
      moveKey(keyCoord, EMPTY, elem);
      moveEmptyKey(EMPTY, keyCoord, emptyKey);
      cntSteps();
      savePosition();
      highlightCorrectPosition(keyId.slice(3));
      setTimeout(() => {
        if (isWinGame()) WinGame();
      }, 500);
    }
  }
};

const startNewGame = () => {
  clearTimeout(timerId);
  document.getElementById('timeElapsed').textContent = '00:00';
  timer = new Date(0, 0, 0, 0, 0);

  cntSteps(0);
  startTime();
  const stopButton = document.getElementById('Stop');
  stopButton.innerText = 'Stop';
  generateStartPosition();
  createKeys(currentPosition);
  highlightCorrectPosition();
};

const StopGame = () => {
  const stopButton = document.getElementById('Stop');
  if (isPaused) {
    startTime();
    stopButton.innerText = 'Stop';
  } else {
    clearTimeout(timerId);
    stopButton.innerText = 'Continue';
  }

  isPaused = !isPaused;
};

const setHandlers = () => {
  document.querySelector('.game-field').addEventListener('click', onClickOnField);
  document.getElementById('StartNewGame').addEventListener('click', startNewGame);
  document.getElementById('Stop').addEventListener('click', StopGame);
};

window.onload = () => {
  createBase();
  setHandlers();
  generateWinPosition();
  startNewGame();
};
