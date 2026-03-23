import {t} from "./i18n.js";
import {stringifySudoku, cellsToSimpleSudoku} from "./utility.js";

export const BaseCollection = {
  Easy: "easy",
  Medium: "medium",
  Hard: "hard",
  Expert: "expert",
  Evil: "evil",
};

export function translateCollectionName(collectionName) {
  // TODO: Find better place for this.
  const BASE_COLLECTION_TRANSLATION = {
    [BaseCollection.Easy]: t("difficulty_easy"),
    [BaseCollection.Medium]: t("difficulty_medium"),
    [BaseCollection.Hard]: t("difficulty_hard"),
    [BaseCollection.Expert]: t("difficulty_expert"),
    [BaseCollection.Evil]: t("difficulty_evil"),
  };
  // TODO: We should also pass the collection id, not just the name.
  if (collectionName in BASE_COLLECTION_TRANSLATION) {
    return BASE_COLLECTION_TRANSLATION[collectionName];
  }
  return collectionName;
}

// The collections have an id, name and a list of sudokus.
// We do not want to parse the whole sudokus, just to show an index of the sudokus.
// That's why we save the name and and sudokus in different local storage keys.
const STORAGE_COLLECTION_SUDOKUS_PREFIX = "super_sudoku_collections_sudokus_";
const STORAGE_COLLECTION_NAMES_PREFIX = "super_sudoku_collections_names_";

function createCollectionSudokusKey(collectionId) {
  return STORAGE_COLLECTION_SUDOKUS_PREFIX + collectionId;
}

function createCollectionNamesKey(collectionId) {
  return STORAGE_COLLECTION_NAMES_PREFIX + collectionId;
}

export const lsCollection = {
  getCollections() {
    const collectionNameKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(STORAGE_COLLECTION_NAMES_PREFIX),
    );

    return collectionNameKeys
      .map((collectionNameKey) => {
        const collectionName = localStorage.getItem(collectionNameKey);
        if (!collectionName) {
          return null;
        }

        const collectionId = collectionNameKey.replace(STORAGE_COLLECTION_NAMES_PREFIX, "");
        const result = {
          id: collectionId,
          name: collectionName,
        };
        return result;
      })
      .filter((collection) => collection !== null);
  },
  getCollection(collectionId) {
    const collectionSudokus = localStorage.getItem(createCollectionSudokusKey(collectionId));
    if (collectionSudokus === null) {
      throw new Error("Collection not found");
    }

    const collectionName = localStorage.getItem(createCollectionNamesKey(collectionId));
    if (collectionName === null) {
      throw new Error("Collection not found");
    }

    return {
      id: collectionId,
      name: collectionName,
      sudokusRaw: collectionSudokus,
    };
  },
  saveCollection(collection) {
    localStorage.setItem(createCollectionSudokusKey(collection.id), collection.sudokusRaw);
    localStorage.setItem(createCollectionNamesKey(collection.id), collection.name);
  },
  removeCollection(collectionId) {
    localStorage.removeItem(createCollectionSudokusKey(collectionId));
    localStorage.removeItem(createCollectionNamesKey(collectionId));
  },
};

const STORAGE_KEY_USER_PREFERENCES = "super-sudoku-user-preferences";

export const DEFAULT_USER_PREFERENCES = {
  showHints: false,
  showWrongEntries: false,
  showConflicts: true,
  showCircleMenu: true,
  showOccurrences: false,
};

export const lsUserPreferences = {
  getPreferences() {
    if (typeof localStorage === "undefined") {
      return DEFAULT_USER_PREFERENCES;
    }

    const storedPreferences = localStorage.getItem(STORAGE_KEY_USER_PREFERENCES);

    if (!storedPreferences) {
      return DEFAULT_USER_PREFERENCES;
    }

    try {
      const parsed = JSON.parse(storedPreferences);

      // Merge with defaults to handle cases where new preferences are added
      return {
        ...DEFAULT_USER_PREFERENCES,
        ...parsed,
      };
    } catch (error) {
      console.warn("Failed to parse user preferences from localStorage:", error);
      return DEFAULT_USER_PREFERENCES;
    }
  },

  savePreferences(preferences) {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Failed to save user preferences to localStorage:", error);
    }
  },
};

const STORAGE_KEY_V_1_4 = "super_sudoku_1_4_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_5 = "super_sudoku_1_5_use_this_file_if_you_want_to_cheat";
const STORAGE_KEY_V_1_6_PREFIX = "super_sudoku_1_6_";
const STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY = "super_sudoku_currently_playing_sudoku";

// Before version 1.6, we had one storage key for all sudokus.
// Now we have one storage key for each sudoku.
// This function loads the sudokus from the old storage key.
const legacyLoadPlayedSudokusFromLocalStorage = () => {
  const empty = {
    active: "",
    sudokus: {},
    application: undefined,
  };
  if (typeof localStorage === "undefined") {
    return empty;
  }
  let usedKey = STORAGE_KEY_V_1_5;
  let text = localStorage.getItem(STORAGE_KEY_V_1_5);
  // Try older versions.
  if (text === null) {
    usedKey = STORAGE_KEY_V_1_4;
    text = localStorage.getItem(STORAGE_KEY_V_1_4);
    console.log("using v1.4", text);
  }
  if (text !== null) {
    try {
      // TODO: add validation
      const result = JSON.parse(text);

      // Migrate from numeric IDs to stringified sudoku keys
      if (usedKey === STORAGE_KEY_V_1_4) {
        const migratedSudokus = {};
        const keys = Object.keys(result.sudokus);
        console.log("keys", keys);

        for (const key of keys) {
          const numberKey = parseInt(key, 10);
          if (isNaN(numberKey)) {
            continue;
          }
          const sudoku = result.sudokus[numberKey];

          // Convert numeric ID to stringified sudoku key
          const sudokuKey = stringifySudoku(cellsToSimpleSudoku(sudoku.sudoku));
          console.log("migrated sudoku:", numberKey, "to", sudokuKey);

          migratedSudokus[sudokuKey] = sudoku;
        }

        result.sudokus = migratedSudokus;
        result.active =
          typeof result.active === "number" && result.active !== -1
            ? stringifySudoku(cellsToSimpleSudoku(result.sudokus[result.active]?.sudoku || []))
            : "";
      }

      return result;
    } catch (e) {
      // delete entry but save it as corrupted, so one might be able to restore it
      console.error("File corrupted: will delete and save as corrupted.", e);
      localStorage.setItem(STORAGE_KEY_V_1_5 + "_corrupted_" + new Date().toISOString(), text);
      localStorage.removeItem(STORAGE_KEY_V_1_5);
      return empty;
    }
  }
  return empty;
};

export function getCurrentSudokuFromStorage() {
  const sudokuKey = localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY);
  if (sudokuKey) {
    return getSudokuFromStorage(sudokuKey);
  }
  return undefined;
}

function getSudokuFromStorage(sudokuKey) {
  // V1.6
  const sudokuFromStorage = localStorage.getItem(createSudokuKey(sudokuKey));
  if (sudokuFromStorage) {
    const sudoku = JSON.parse(sudokuFromStorage);
    // There is a bug that the collection name might not be set, then we just use the difficulty.
    const difficulty = sudoku.game.difficulty;
    if (!sudoku.game.sudokuCollectionName && difficulty) {
      sudoku.game.sudokuCollectionName = difficulty;
    }
    return sudoku;
  }

  // TODO: Remove after a year (today is 2025-06-28).
  // No old storage found.
  if (localStorage.getItem(STORAGE_KEY_V_1_5) === null && localStorage.getItem(STORAGE_KEY_V_1_4) === null) {
    return undefined;
  }

  // V1.5
  const sudokusFromStorage = legacyLoadPlayedSudokusFromLocalStorage();
  // Migrate to V1.6
  for (const sudokuKey of Object.keys(sudokusFromStorage.sudokus)) {
    const sudoku = sudokusFromStorage.sudokus[sudokuKey];
    const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudoku.sudoku));
    localStorage.setItem(createSudokuKey(stringifiedSudoku), JSON.stringify(sudoku));
  }
  // Delete old storage.
  localStorage.removeItem(STORAGE_KEY_V_1_5);
  localStorage.removeItem(STORAGE_KEY_V_1_4);

  // Try again, as now we have the new storage key.
  return getSudokuFromStorage(sudokuKey);
}

function createSudokuKey(stringifiedSudoku) {
  return STORAGE_KEY_V_1_6_PREFIX + stringifiedSudoku;
}

const saveCurrentSudokuToLocalStorage = (game, sudoku) => {
  const stringifiedSudoku = stringifySudoku(cellsToSimpleSudoku(sudoku.current));
  const sudokuKey = createSudokuKey(stringifiedSudoku);
  // We do not save the history as it would take too much space.
  // Also we don't need to to migrate the existing data.
  try {
    localStorage.setItem(sudokuKey, JSON.stringify({game, sudoku: sudoku.current}));
    // TODO: this is problematic with multiple open windows, as the .active gets overwritten.
    // We should have a tab based storage for that stuff as well, so a reload does not open the other sudoku.
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, stringifiedSudoku);
  } catch (e) {
    console.error("LocalStorage is not supported! No Saving possible.", e);
  }
};

export const lsPlayedSudoku = {
  getPlayedSudokus() {
    return Object.keys(localStorage).filter((key) => key.startsWith(STORAGE_KEY_V_1_6_PREFIX));
  },
  getCurrentSudokuKey() {
    return localStorage.getItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY);
  },
  saveCurrentSudokuKey(sudokuKey) {
    localStorage.setItem(STORAGE_CURRENTLY_PLAYING_SUDOKU_KEY, sudokuKey);
  },
  getSudokuState(sudokuKey) {
    return getSudokuFromStorage(sudokuKey);
  },
  saveSudokuState(game, sudoku) {
    saveCurrentSudokuToLocalStorage(game, sudoku);
  },
  removeSudokuState(sudokuKey) {
    localStorage.removeItem(createSudokuKey(sudokuKey));
  },
};
