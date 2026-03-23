import {lsUserPreferences} from "./storage.js";

import {simpleSudokuToCells, squareIndex} from "./utility.js";
import {START_SUDOKU_COLLECTION, START_SUDOKU_INDEX, START_SUDOKU} from "./sudokus.js";

const {createStore} = Vuex;

export const emptyGrid = simpleSudokuToCells([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
]);

// We start with the first easy sudoku, so the user can start playing immediately.
export const INITIAL_SUDOKU_STATE = {
  current: simpleSudokuToCells(START_SUDOKU.sudoku, START_SUDOKU.solution),
  history: [simpleSudokuToCells(START_SUDOKU.sudoku, START_SUDOKU.solution)],
  historyIndex: 0,
};

export const INITIAL_CREATE_NEW_SUDOKU_STATE = {
  current: emptyGrid,
  history: [emptyGrid],
  historyIndex: 0,
};

// Action types
const SET_SUDOKU = "sudoku/SET_SUDOKU";
const SET_SUDOKU_STATE = "sudoku/SET_SUDOKU_STATE";
const GET_HINT = "sudoku/GET_HINT";
const CLEAR_CELL = "sudoku/CLEAR_CELL";
const SET_NOTES = "sudoku/SET_NOTES";
const SET_NUMBER = "sudoku/SET_NUMBER";
const CLEAR_NUMBER = "sudoku/CLEAR_NUMBER";
const UNDO = "sudoku/UNDO";
const REDO = "sudoku/REDO";

export const SudokuContext = {
  state: () => ({...INITIAL_SUDOKU_STATE}),

  mutations: {
    [SET_SUDOKU_STATE](state, sudokuState) {
      Object.assign(state, sudokuState);
    },
    [SET_SUDOKU](state, sudoku) {
      state.current = sudoku;
      state.history = [sudoku];
      state.historyIndex = 0;
    },
    [UNDO](state) {
      if (state.historyIndex < state.history.length - 1) {
        Object.assign(state, {
          current: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        });
      }
    },
    [REDO](state) {
      if (state.historyIndex > 0) {
        Object.assign(state, {
          current: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        });
      }
    },
    [GET_HINT](state, {cellCoordinates}) {
      handleCellUpdate(state, {type: GET_HINT, cellCoordinates});
    },
    [CLEAR_CELL](state, {cellCoordinates}) {
      handleCellUpdate(state, {type: CLEAR_CELL, cellCoordinates});
    },
    [SET_NOTES](state, {cellCoordinates, notes}) {
      handleCellUpdate(state, {type: SET_NOTES, cellCoordinates, notes});
    },
    [SET_NUMBER](state, {cellCoordinates, number}) {
      handleCellUpdate(state, {type: SET_NUMBER, cellCoordinates, number});
    },
    [CLEAR_NUMBER](state, {cellCoordinates}) {
      handleCellUpdate(state, {type: CLEAR_NUMBER, cellCoordinates});
    },
  },

  actions: {
    setSudokuState({commit}, sudokuState) {
      commit(SET_SUDOKU_STATE, sudokuState);
    },
    setSudoku({commit}, {sudoku, solution}) {
      const cells = simpleSudokuToCells(sudoku, solution);
      commit(SET_SUDOKU, cells);
    },
    getHint({commit}, cellCoordinates) {
      commit(GET_HINT, {cellCoordinates});
    },
    clearCell({commit}, cellCoordinates) {
      commit(CLEAR_CELL, {cellCoordinates});
    },
    setNotes({commit}, {cellCoordinates, notes}) {
      commit(SET_NOTES, {cellCoordinates, notes});
    },
    setNumber({commit}, {cellCoordinates, number}) {
      commit(SET_NUMBER, {cellCoordinates, number});
    },
    clearNumber({commit}, cellCoordinates) {
      commit(CLEAR_NUMBER, {cellCoordinates});
    },
    undo({commit}) {
      commit(UNDO);
    },
    redo({commit}) {
      commit(REDO);
    },
  },
};

// When a number is set, remove conflicting notes.
export const fixSudokuNotes = function (sudoku, newCell) {
  sudoku = sudoku.map((cell) => {
    if (cell.x === newCell.x) {
      return {
        ...cell,
        notes: cell.notes.filter((n) => n !== newCell.number),
      };
    }
    return cell;
  });

  sudoku = sudoku.map((cell) => {
    if (cell.y === newCell.y) {
      return {
        ...cell,
        notes: cell.notes.filter((n) => n !== newCell.number),
      };
    }
    return cell;
  });

  return sudoku.map((cell) => {
    if (squareIndex(cell.x, cell.y) === squareIndex(newCell.x, newCell.y)) {
      return {
        ...cell,
        notes: cell.notes.filter((n) => n !== newCell.number),
      };
    }
    return cell;
  });
};

export const handleCellUpdate = function (state, action) {
  const {x, y} = action.cellCoordinates;
  let newGrid = state.current.map((cell) => {
    const isCell = cell.x === x && cell.y === y;
    if (isCell && !cell.initial) {
      switch (action.type) {
        case SET_NOTES: {
          return {
            ...cell,
            notes: action.notes,
            number: 0,
          };
        }
        case SET_NUMBER: {
          return {
            ...cell,
            number: action.number,
            notes: [],
          };
        }
        case CLEAR_NUMBER: {
          return {
            ...cell,
            number: 0,
          };
        }
        case CLEAR_CELL: {
          return {
            ...cell,
            number: 0,
            notes: [],
          };
        }
        case GET_HINT: {
          return {
            ...cell,
            number: cell.solution,
            notes: [],
          };
        }
        default:
          return cell;
      }
    }
    return cell;
  });

  // Fix notes when setting a number
  if (action.type === SET_NUMBER) {
    const newCell = newGrid.find((cell) => cell.x === x && cell.y === y);
    if (newCell) {
      newGrid = fixSudokuNotes(newGrid, newCell);
    }
  }

  // Add to history
  const newHistory = [newGrid, ...state.history];

  Object.assign(state, {
    current: newGrid,
    history: newHistory,
    historyIndex: 0,
  });
};

export const GameStateMachine = {
  running: "RUNNING",
  paused: "PAUSED",
};

export const INITIAL_GAME_STATE = {
  activeCellCoordinates: undefined,
  sudokuCollectionName: START_SUDOKU_COLLECTION.name,
  notesMode: false,
  showMenu: false,
  showNotes: false,
  state: GameStateMachine.paused,
  sudokuIndex: START_SUDOKU_INDEX,
  secondsPlayed: 0,
  timesSolved: 0,
  previousTimes: [],
  won: false,
};

// Action types
const NEW_GAME = "game/NEW_GAME";
const WON_GAME = "game/WON_GAME";
const PAUSE_GAME = "game/PAUSE_GAME";
const CONTINUE_GAME = "game/CONTINUE_GAME";
const SET_GAME_STATE = "game/SET_GAME_STATE";
const RESTART_GAME = "game/RESTART_GAME";
const SHOW_MENU = "game/SHOW_MENU";
const HIDE_MENU = "game/HIDE_MENU";
const SELECT_CELL = "game/SELECT_MENU";
const ACTIVATE_NOTES_MODE = "game/ACTIVATE_NOTES_MODE";
const DEACTIVATE_NOTES_MODE = "game/DEACTIVATE_NOTES_MODE";
const UPDATE_TIMER = "game/UPDATE_TIME";
const RESET_GAME = "game/RESET_GAME";

export const GameContext = {
  state: () => ({
    ...INITIAL_GAME_STATE,
  }),
  mutations: {
    [SET_GAME_STATE](state, gameState) {
      Object.assign(state, gameState);
    },
    [NEW_GAME](state, {sudokuIndex, sudokuCollectionName, timesSolved, previousTimes}) {
      const currentPreferences = lsUserPreferences.getPreferences();
      Object.assign(state, {
        ...INITIAL_GAME_STATE,
        sudokuIndex,
        sudokuCollectionName,
        timesSolved,
        previousTimes,
        state: GameStateMachine.running,
        ...currentPreferences,
      });
    },
    [WON_GAME](state) {
      const justWon = state.won === false;
      Object.assign(state, {
        ...state,
        won: true,
        state: GameStateMachine.paused,
        timesSolved: justWon ? state.timesSolved + 1 : state.timesSolved,
        previousTimes: justWon ? [...state.previousTimes, state.secondsPlayed] : state.previousTimes,
      });
    },
    [PAUSE_GAME](state) {
      state.state = GameStateMachine.paused;
    },
    [CONTINUE_GAME](state) {
      if (!state.won) {
        state.state = GameStateMachine.running;
      }
    },
    [RESTART_GAME](state, {sudokuIndex, sudokuCollectionName, timesSolved, previousTimes}) {
      Object.assign(state, {
        ...state,
        sudokuIndex,
        sudokuCollectionName,
        timesSolved,
        secondsPlayed: 0,
        previousTimes,
        state: GameStateMachine.running,
        won: false,
      });
    },
    [SHOW_MENU](state, {showNotes = false}) {
      state.showMenu = true;
      state.showNotes = showNotes;
    },
    [HIDE_MENU](state) {
      state.showMenu = false;
      state.showNotes = false;
    },
    [SELECT_CELL](state, cellCoordinates) {
      state.activeCellCoordinates = cellCoordinates;
    },
    [ACTIVATE_NOTES_MODE](state) {
      state.notesMode = true;
    },
    [DEACTIVATE_NOTES_MODE](state) {
      state.notesMode = false;
    },
    [UPDATE_TIMER](state, secondsPlayed) {
      state.secondsPlayed = secondsPlayed;
    },
    [RESET_GAME](state) {
      Object.assign(state, {
        ...state,
        secondsPlayed: 0,
        state: GameStateMachine.running,
        won: false,
      });
    },
  },

  actions: {
    setGameState({commit}, gameState) {
      commit(SET_GAME_STATE, gameState);
    },
    newGame({commit}, {sudokuIndex, sudokuCollectionName, timesSolved, previousTimes}) {
      commit(NEW_GAME, {sudokuIndex, sudokuCollectionName, timesSolved, previousTimes});
    },
    wonGame({commit}) {
      commit(WON_GAME);
    },
    pauseGame({commit}) {
      commit(PAUSE_GAME);
    },
    continueGame({commit}) {
      commit(CONTINUE_GAME);
    },
    selectCell({commit}, cellCoordinates) {
      commit(SELECT_CELL, cellCoordinates);
    },
    showMenu({commit}, showNotes) {
      commit(SHOW_MENU, {showNotes});
    },
    hideMenu({commit}) {
      commit(HIDE_MENU);
    },
    restartGame({commit}, {sudokuIndex, sudokuCollectionName, timesSolved, previousTimes}) {
      commit(RESTART_GAME, {sudokuIndex, sudokuCollectionName, timesSolved, previousTimes});
    },
    activateNotesMode({commit}) {
      commit(ACTIVATE_NOTES_MODE);
    },
    deactivateNotesMode({commit}) {
      commit(DEACTIVATE_NOTES_MODE);
    },
    updateTimer({commit}, secondsPlayed) {
      commit(UPDATE_TIMER, secondsPlayed);
    },
    resetGame({commit}) {
      commit(RESET_GAME);
    },
  },
};

export const INITIAL_USER_PREFERENCES_STATE = lsUserPreferences.getPreferences();

const TOGGLE_SHOW_HINTS = "user_preferences/TOGGLE_SHOW_HINTS";
const TOGGLE_SHOW_OCCURRENCES = "user_preferences/TOGGLE_SHOW_OCCURRENCES";
const TOGGLE_SHOW_CONFLICTS = "user_preferences/TOGGLE_SHOW_CONFLICTS";
const TOGGLE_SHOW_CIRCLE_MENU = "user_preferences/TOGGLE_SHOW_CIRCLE_MENU";
const TOGGLE_SHOW_WRONG_ENTRIES = "user_preferences/TOGGLE_SHOW_WRONG_ENTRIES";

const UserPreferencesContext = {
  state: () => ({...INITIAL_USER_PREFERENCES_STATE}),
  mutations: {
    [TOGGLE_SHOW_HINTS](state) {
      state.showHints = !state.showHints;
    },
    [TOGGLE_SHOW_OCCURRENCES](state) {
      state.showOccurrences = !state.showOccurrences;
    },
    [TOGGLE_SHOW_CONFLICTS](state) {
      state.showConflicts = !state.showConflicts;
    },
    [TOGGLE_SHOW_CIRCLE_MENU](state) {
      state.showCircleMenu = !state.showCircleMenu;
    },
    [TOGGLE_SHOW_WRONG_ENTRIES](state) {
      state.showWrongEntries = !state.showWrongEntries;
    },
  },

  actions: {
    toggleShowHints({commit}) {
      commit(TOGGLE_SHOW_HINTS);
    },
    toggleShowOccurrences({commit}) {
      commit(TOGGLE_SHOW_OCCURRENCES);
    },
    toggleShowConflicts({commit}) {
      commit(TOGGLE_SHOW_CONFLICTS);
    },
    toggleShowCircleMenu({commit}) {
      commit(TOGGLE_SHOW_CIRCLE_MENU);
    },
    toggleShowWrongEntries({commit}) {
      commit(TOGGLE_SHOW_WRONG_ENTRIES);
    },
  },
};

const store = createStore({
  modules: {
    Game: GameContext,
    Sudoku: SudokuContext,
    UserPreferences: UserPreferencesContext,
  },
});

export default store;
