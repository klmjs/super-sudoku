import easySudokus from "./sudokus/easy.txt.js";
import mediumSudokus from "./sudokus/medium.txt.js";
import hardSudokus from "./sudokus/hard.txt.js";
import expertSudokus from "./sudokus/expert.txt.js";
import evilSudokus from "./sudokus/evil.txt.js";

import {parseSudoku, stringifySudoku} from "./utility.js";
import {solve} from "./solve.js";
import {BaseCollection, lsCollection} from "./storage.js";


export const BASE_SUDOKU_COLLECTIONS = {
  [BaseCollection.Easy]: easySudokus,
  [BaseCollection.Medium]: mediumSudokus,
  [BaseCollection.Hard]: hardSudokus,
  [BaseCollection.Expert]: expertSudokus,
  [BaseCollection.Evil]: evilSudokus,
};

// Cache for raw line counts
const lineCountCache = {};

function getLineCount(collection) {
  if (!lineCountCache[collection.id]) {
    lineCountCache[collection.id] = collection.sudokusRaw.split("\n").filter((line) => line.trim()).length;
  }
  return lineCountCache[collection.id];
}


export function getSudokusPaginated(collection, page = 0, pageSize = 12) {
  const totalRows = getLineCount(collection);
  const totalPages = Math.ceil(totalRows / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;

  if (collection.sudokusRaw === "") {
    return {
      sudokus: [],
      totalRows: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }

  const rawLines = collection.sudokusRaw.split("\n");
  const sudokus = [];

  for (const line of rawLines.slice(startIndex, endIndex)) {
    const sudoku = parseSudoku(line);
    const solved = solve(sudoku);
    const result = {
      sudoku,
      solution: solved.sudoku,
      iterations: solved.iterations,
    };
    if (result.solution !== null) {
      sudokus.push(result);
    } else {
      console.warn("Invalid sudoku: ", sudoku, solved);
    }
  }

  return {
    sudokus,
    totalRows,
    page,
    pageSize,
    totalPages,
  };
}

export const START_SUDOKU_INDEX = 0;
export const START_SUDOKU_COLLECTION = {id: "easy", name: "easy", sudokusRaw: BASE_SUDOKU_COLLECTIONS.easy};
export const START_SUDOKU = getSudokusPaginated(START_SUDOKU_COLLECTION, START_SUDOKU_INDEX, START_SUDOKU_INDEX + 1)
  .sudokus[0];

  
  export function getCollections() {
    const baseCollections = Object.keys(BASE_SUDOKU_COLLECTIONS);
    const collections = localStorageCollectionRepository.getCollections();
    return [...baseCollections.map((collection) => ({id: collection, name: collection})), ...collections];
  }
  
  