const buttons = ['Start New Game', 'Stop', 'Save', 'Load', 'Results'];

// game options
let GAME_SIZE = 4;
const GAME_W = 500;
const margin = 1.5;
let KEY_SIZE = Math.round((GAME_W - (GAME_SIZE - 1) * margin) / GAME_SIZE);


// game state
let GAME_FIELD = {};
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
let isDragOn = false;
let draggableKey;

const recalcKeySize = () => {
  KEY_SIZE = Math.round((GAME_W - (GAME_SIZE - 1) * margin) / GAME_SIZE);
};

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
    }
  }
};

const onCloseModal = () => {
  document.querySelector('.modal-overlay').remove();
};

const getResults = () => {
  const results = localStorage.getItem('game-puzzle-results');
  if (!results) return 'no previous games found.';
  const lines = results.split('\n', 10).filter((s) => (s));
  const firstTenResults = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].split('^');
    firstTenResults.push(`<b>${i + 1}</b>. Game size: ${line[0]}: ${line[1]} moves in ${line[2]}.<br>`);
  }
  return firstTenResults.join('');
};

const saveResult = () => {
  const results = localStorage.getItem('game-puzzle-results');
  const lines = (results) ? results.split('\n', 9).filter((s) => (s)) : [];
  const newRecord = `${GAME_SIZE}^${COUNT_STEPS}^${TIME_ELAPSED}\n`;
  const res = (results) ? newRecord + lines.join('\n') : newRecord.slice(0, -1);
  localStorage.setItem('game-puzzle-results', res);
};

const doModal = (type) => {
  // overlay
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  // message
  const message = document.createElement('div');
  message.classList.add('message');

  const headerMsg = document.createElement('h2');
  const bodyMsg = document.createElement('p');
  headerMsg.classList.add('message-header');
  bodyMsg.classList.add('message-body');

  switch (type) {
    case 'Win':
      headerMsg.innerText = 'You Win!';
      bodyMsg.innerText = `Statistics:\nMoves: ${COUNT_STEPS}\nSpend time: ${TIME_ELAPSED}.`;
      break;
    case 'StartGame':
      headerMsg.innerHTML = 'Welcome!';
      bodyMsg.innerHTML = 'Click <b>"Start New Game"</b> to start new game.<br>'
      + 'Or <b>"Load"</b> to continue previous game.';
      break;
    case 'NoSavedGames':
      headerMsg.innerHTML = 'Welcome!';
      bodyMsg.innerHTML = 'No saved game found. Click <b>"Start New Game"</b> to start new game.<br>';
      break;
    case 'Results':
      headerMsg.innerHTML = 'Results previous 10 games:';
      bodyMsg.innerHTML = getResults();
      break;
    default:
      break;
  }

  message.append(headerMsg);
  message.append(bodyMsg);
  overlay.append(message);

  // Ok button
  const okButton = document.createElement('button');
  okButton.classList.add('ok-button');
  okButton.innerText = 'Ok';
  okButton.addEventListener('click', onCloseModal);
  overlay.append(okButton);

  document.body.append(overlay);
};

const startTime = () => {
  TIME_ELAPSED = `${timer.getMinutes().toString().padStart(2, '0')}:${timer.getSeconds().toString().padStart(2, '0')}`;
  gameDuration.textContent = TIME_ELAPSED;
  timerId = setTimeout(() => {
    timer.setSeconds(timer.getSeconds() + 1);
    startTime();
  }, 1000);
};

const setMoves = (moves) => {
  COUNT_STEPS = moves;
  document.getElementById('countSteps').textContent = COUNT_STEPS;
};

const incMoves = (start) => {
  const add = (start !== undefined) ? start : 1;
  setMoves(+COUNT_STEPS + add);
};

const getKeyCoordinateByIndex = (index) => ({ x: (index % GAME_SIZE), y: Math.trunc(index / GAME_SIZE) });

const getKeyCoordinateByPosition = (elem) => {
  const left = parseInt(elem.style.left);
  const top = parseInt(elem.style.top);

  const xx = Math.round((left / KEY_SIZE));
  const yy = Math.round((top / KEY_SIZE));

  return { x: xx, y: yy };
};

const createControlButton = (buttonName) => {
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

const getIndexByKeyId = (keyId) => {
  const keyValue = +keyId.slice(3);
  for (let i = 0; i < currentPosition.length; i += 1) {
    if (currentPosition[i] === keyValue) return i;
  }
  return 0;
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
    key.style.width = `${Math.round((100 - GAME_SIZE * 2) / GAME_SIZE)}%`;
    key.style.height = `${Math.round((100 - GAME_SIZE * 2) / GAME_SIZE)}%`;
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
  controlContainer.id = 'controlcontainer';
  wrapper.append(controlContainer);
  buttons.forEach((btnName) => createControlButton(btnName));

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
  GAME_FIELD = document.getElementById('gamefield');

  // game size
  const sizeContainer = document.createElement('div');
  sizeContainer.classList.add('size-container');
  sizeContainer.id = 'sizecontainer';

  const btnMinus = document.createElement('button');
  btnMinus.classList.add('button-gamesize');
  btnMinus.innerText = '-';
  btnMinus.id = 'sizeminus';

  const gamesize = document.createElement('label');
  gamesize.classList.add('gamesize');
  gamesize.innerText = `${GAME_SIZE} x ${GAME_SIZE}`;
  gamesize.id = 'gamesize';

  const btnPlus = document.createElement('button');
  btnPlus.classList.add('button-gamesize');
  btnPlus.innerText = '+';
  btnPlus.id = 'sizeplus';

  sizeContainer.append(btnMinus);
  sizeContainer.append(gamesize);
  sizeContainer.append(btnPlus);
  wrapper.append(sizeContainer);
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

const moveKeyToStartPosition = (elem, newKeyCoord) => {
  const key = elem;
  key.style.top = `${newKeyCoord.y}px`;
  key.style.left = `${newKeyCoord.x}px`;
};

const moveEmptyKey = (keyCoord, newKeyCoord) => {
  moveKey(keyCoord, newKeyCoord, emptyKey);
  EMPTY = newKeyCoord;
};

const disableSizeKeys = () => {
  document.getElementById('sizeminus').disabled = false;
  document.getElementById('sizeplus').disabled = false;
  if (GAME_SIZE > 7) document.getElementById('sizeplus').disabled = true;
  if (GAME_SIZE < 4) document.getElementById('sizeminus').disabled = true;
};

const startNewGame = (savedGame) => {
  clearTimeout(timerId);
  timer = new Date(0, 0, 0, 0, 0);
  if (savedGame) {
    [GAME_SIZE, COUNT_STEPS, TIME_ELAPSED, ...currentPosition] = savedGame;
    timer.setSeconds(TIME_ELAPSED.slice(3));
    timer.setMinutes(TIME_ELAPSED.slice(0, 2));
  } else {
    TIME_ELAPSED = '00:00';
    COUNT_STEPS = 0;
    generateStartPosition();
  }
  recalcKeySize();
  document.getElementById('timeElapsed').textContent = TIME_ELAPSED;
  document.getElementById('gamesize').innerText = `${GAME_SIZE} x ${GAME_SIZE}`;
  disableSizeKeys();
  setMoves(COUNT_STEPS);
  startTime();
  const stopButton = document.getElementById('Stop');
  stopButton.innerText = 'Stop';
  isPaused = false;
  createKeys(currentPosition);
  highlightCorrectPosition();
};

const WinGame = () => {
  clearTimeout(timerId);
  saveResult();
  doModal('Win');
  startNewGame();
};

const onClickOnField = (event) => {
  if (isDragOn) {
    isDragOn = true;
    return;
  }
  const elem = event.target.closest('div');
  const keyId = event.target.closest('div').id;

  if (keyId !== 'gamefield' && keyId !== 'key0') {
    const keyCoord = getKeyCoordinateByPosition(elem);

    if (isMoveEnabled(keyCoord, EMPTY)) {
      moveKey(keyCoord, EMPTY, elem);
      moveEmptyKey(EMPTY, keyCoord, emptyKey);
      incMoves();
      savePosition();
      highlightCorrectPosition(keyId.slice(3));
      setTimeout(() => {
        if (isWinGame()) WinGame();
      }, 500);
    }
  }
};

const pauseGame = () => {
  const stopButton = document.getElementById('Stop');
  clearTimeout(timerId);
  stopButton.innerText = 'Continue';
  isPaused = true;
};

const resumeGame = () => {
  const stopButton = document.getElementById('Stop');
  startTime();
  stopButton.innerText = 'Stop';
  isPaused = false;
};

const stopGame = () => {
  if (isPaused) {
    resumeGame();
  } else {
    pauseGame();
  }
};

const saveState = (gameState) => {
  localStorage.setItem('game-puzzle-state', gameState);
};

const restoreState = () => {
  const state = localStorage.getItem('game-puzzle-state');
  return (state) || 'none';
};

const saveGame = () => {
  const state = [];
  state.push(GAME_SIZE);
  state.push(COUNT_STEPS);
  state.push(TIME_ELAPSED);
  state.push(...currentPosition);
  saveState(state.join('^'));
};

const loadGame = () => {
  const savedGame = restoreState();
  if (savedGame === 'none') {
    doModal('NoSavedGames');
  } else {
    const state = savedGame.split('^').map((el, i) => (i !== 2 ? +el : el));
    startNewGame(state);
  }
};

const showResults = () => {
  doModal('Results');
};

const onClickControl = (event) => {
  if (!event.target.closest('button')) return;
  const buttonId = event.target.closest('button').id;

  switch (buttonId) {
    case 'StartNewGame':
      startNewGame();
      break;
    case 'Stop':
      stopGame();
      break;
    case 'Save':
      saveGame();
      break;
    case 'Load':
      loadGame();
      break;
    case 'Results':
      showResults();
      pauseGame();
      break;
    default:
      break;
  }
};

const resizeGame = (newSize) => {
  if (GAME_SIZE > 2 && GAME_SIZE < 9) {
    GAME_SIZE += newSize;
    recalcKeySize();
    document.getElementById('gamesize').innerText = `${GAME_SIZE} x ${GAME_SIZE}`;
    generateWinPosition();
    startNewGame();
  }
};

const sizeUp = () => {
  resizeGame(1);
  disableSizeKeys();
};

const sizeDown = () => {
  resizeGame(-1);
  disableSizeKeys();
};

const isKeyOutGameField = (event) => {
  const fieldX = GAME_FIELD.getBoundingClientRect().left;
  const fieldY = GAME_FIELD.getBoundingClientRect().top;

  if (event.pageX < fieldX || event.pageX > fieldX + GAME_W
    || event.pageY < fieldY || event.pageY > fieldY + GAME_W) return true;

  return false;
};

const moveAt = (element, x, y) => {
  const key = element;
  key.style.left = `${x}px`;
  key.style.top = `${y}px`;
};

const returnKey = (key) => {
  const keyIndex = getIndexByKeyId(key.id);

  const top = getTopPosition(keyIndex);
  const left = getLeftPosition(keyIndex);
  const newCoord = { x: left, y: top };

  moveKeyToStartPosition(key, newCoord);
};

const endDrag = () => {
  isDragOn = false;
  // eslint-disable-next-line no-use-before-define
  document.getElementById('gamefield').removeEventListener('mousemove', onMouseMove);
  if (draggableKey) {
    draggableKey.style.transition = '0.3s linear';
    draggableKey.style.zIndex = 2;
    returnKey(draggableKey);
  }
  draggableKey = null;
};

const onMouseMove = (event) => {
  if (!draggableKey) return;

  if (isKeyOutGameField(event)) {
    returnKey(draggableKey);
    endDrag();
    return;
  }

  const fieldX = GAME_FIELD.getBoundingClientRect().left;
  const fieldY = GAME_FIELD.getBoundingClientRect().top;
  const newKeyX = event.pageX - fieldX - draggableKey.shiftX;
  const newKeyY = event.pageY - fieldY - draggableKey.shiftY;

  moveAt(draggableKey, newKeyX, newKeyY);
};

const onMouseUp = () => {
  endDrag();
};

const onMouseDown = (event) => {
  const key = event.target.closest('div');
  const keyId = event.target.closest('div').id;

  if (keyId !== 'gamefield' && keyId !== 'key0') {
    const keyCoord = getKeyCoordinateByPosition(key);
    if (isMoveEnabled(keyCoord, EMPTY)) {
      draggableKey = key;
      draggableKey.shiftX = event.clientX - draggableKey.getBoundingClientRect().left;
      draggableKey.shiftY = event.clientY - draggableKey.getBoundingClientRect().top;

      document.getElementById('gamefield').addEventListener('mousemove', onMouseMove);
      draggableKey.style.transition = 'none';
      draggableKey.style.zIndex = 5;
    }
  }
};

const onDragStart = (event) => event.preventDefault();

const setHandlers = () => {
  document.querySelector('.game-field').addEventListener('click', onClickOnField);
  document.querySelector('.game-field').addEventListener('ondragstart', onDragStart);
  document.querySelector('.game-field').addEventListener('mousedown', onMouseDown);
  document.querySelector('.game-field').addEventListener('mouseup', onMouseUp);
  document.querySelector('.control-container').addEventListener('click', onClickControl);
  document.getElementById('sizeminus').addEventListener('click', sizeDown);
  document.getElementById('sizeplus').addEventListener('click', sizeUp);
};

window.onload = () => {
  createBase();
  setHandlers();
  generateWinPosition();
  doModal('StartGame');
};
