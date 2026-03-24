import {SUDOKU_NUMBERS} from "../../../utility.js";
import SudokuGame from "../../../SudokuGame.js";
import Button from "../Button.js";

const {defineComponent} = Vue;

export const SudokuMenuNumbers = defineComponent({
  name: "SudokuMenuNumbers",
  components: {
    Button,
  },
  props: {
    notesMode: {
      type: Boolean,
      required: true,
    },
    activeCell: {
      type: Object,
      default: null,
    },
    showOccurrences: {
      type: Boolean,
      required: true,
    },
    sudoku: {
      type: Array,
      required: true,
    },
    showHints: {
      type: Boolean,
      required: true,
    },
    setNumber: {
      type: Function,
      required: true,
    },
    setNotes: {
      type: Function,
      required: true,
    },
  },
  computed: {
    SUDOKU_NUMBERS() {
      return SUDOKU_NUMBERS;
    },
    occurrencesMap() {
      const map = {};
      SUDOKU_NUMBERS.forEach((num) => {
        map[num] = this.sudoku.filter((c) => c.number === num).length;
      });
      return map;
    },
    conflicting() {
      return SudokuGame.conflictingFields(this.sudoku);
    },
    activeCellData() {
      return this.activeCell ? this.sudoku[this.activeCell.y * 9 + this.activeCell.x] : undefined;
    },
    userNotes() {
      return (this.activeCellData ? this.activeCellData.notes : undefined) || [];
    },
    conflictingCell() {
      return this.activeCell ? this.conflicting[this.activeCell.y * 9 + this.activeCell.x] : undefined;
    },
    autoNotes() {
      return (this.showHints && this.conflictingCell ? this.conflictingCell.possibilities : undefined) || [];
    },
  },
  methods: {
    setNumberOrNote(n) {
      if (!this.activeCell) return;

      if (this.notesMode) {
        const startingNotes =
          this.userNotes.length === 0 && this.autoNotes.length > 0 ? this.autoNotes : this.userNotes;

        const newNotes = startingNotes.includes(n)
          ? startingNotes.filter((note) => note !== n)
          : [...this.userNotes, n];

        this.setNotes(this.activeCell, newNotes);
      } else {
        this.setNumber(this.activeCell, n);
      }
    },
  },
  template: `
<div class="grid w-full overflow-hidden justify-center gap-2 md:grid-cols-3 grid-cols-9">
    <Button
      v-for="n in SUDOKU_NUMBERS"
      :key="n"
      :class="[
        'relative font-bold',
        {
          'bg-gray-400': occurrencesMap[n] === 9,
          'bg-red-400 dark:bg-red-400': showOccurrences && occurrencesMap[n] > 9,
          'bg-sky-600 dark:bg-sky-600 text-white': 
            notesMode && userNotes.includes(n) && activeCellData && activeCellData.number === 0,
          'bg-sky-300 dark:bg-sky-300':
            notesMode &&
            userNotes.length === 0 &&
            autoNotes.includes(n) &&
            !userNotes.includes(n) &&
            activeCellData && activeCellData.number === 0,
        }
      ]"
      @click="setNumberOrNote(n)"
    >
      <div 
        v-if="showOccurrences" 
        class="absolute right-0 bottom-0 h-3 w-3 rounded-xl bg-teal-700 text-xxs text-white opacity-70 sm:right-1 sm:bottom-1 sm:h-4 sm:w-4 sm:text-xs"
      >
        {{ occurrencesMap[n] }}
      </div>
      {{ n }}
    </Button>
  </div>
`,
});

export default SudokuMenuNumbers;
