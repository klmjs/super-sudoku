import SudokuMenuCircle, {MenuWrapper, MenuContainer} from "./SudokuMenuCircle.js";
import {GridLineX, GridCell, GridLineY, GridCellNumber, CellNote, CellNoteContainer} from "./SudokuGrid.js";

import SudokuGame from "../../../SudokuGame.js";

const {defineComponent} = Vue;

export const SudokuGrid = defineComponent({
  name: "SudokuGrid",
  components: {
    GridLineX,
    GridLineY,
  },
  props: {
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    hideLeftRight: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    isBoldLine(i) {
      return [3, 6].includes(i);
    },
    shouldHide(i) {
      return [0, 9].includes(i);
    },
  },
  template: `
  <div>
    <GridLineX
      v-for="i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
      :key="'x' + i"
      :makeBold="isBoldLine(i)"
      :width="width"
      :top="(i * height) / 9"
      v-if="!(hideLeftRight && shouldHide(i))"
    />
    <GridLineY
      v-for="i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
      :key="'y' + i"
      :makeBold="isBoldLine(i)"
      :height="height"
      :left="(i * height) / 9"
      v-if="!(hideLeftRight && shouldHide(i))"
    />
  </div>
`,
});

export const SudokuCell = defineComponent({
  name: "SudokuCell",
  components: {
    GridCell,
    GridCellNumber,
    CellNoteContainer,
    CellNote,
  },
  props: {
    number: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    highlightNumber: {
      type: Boolean,
      required: true,
    },
    highlight: {
      type: Boolean,
      required: true,
    },
    conflict: {
      type: Boolean,
      required: true,
    },
    bounds: {
      type: Object,
      required: true,
      validator: function (value) {
        return (
          value.hasOwnProperty("width") &&
          value.hasOwnProperty("height") &&
          value.hasOwnProperty("top") &&
          value.hasOwnProperty("left")
        );
      },
    },
    onClick: {
      type: Function,
      required: true,
    },
    onRightClick: {
      type: Function,
      required: true,
    },
    top: {
      type: Number,
      required: true,
    },
    left: {
      type: Number,
      required: true,
    },
    initial: {
      type: Boolean,
      required: true,
    },
    notes: {
      type: Array,
      required: true,
      validator: function (value) {
        return value.every((item) => typeof item === "number");
      },
    },
    notesMode: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    getNotePosition(note) {
      return SudokuGame.getNotePosition(note);
    },
  },
  template: `
  <div>
    <GridCell
      :notesMode="notesMode"
      :active="active"
      :conflict="conflict"
      :highlight="highlight"
      :highlightNumber="highlightNumber"
      :bounds="bounds"
      @click="onClick"
      @contextmenu="onRightClick"
    />
    <GridCellNumber
      :left="left"
      :top="top"
      :initial="initial"
      :highlight="highlightNumber"
      :conflict="conflict"
    >
      {{ number !== 0 ? number : "" }}
    </GridCellNumber>
    <CellNoteContainer :initial="initial" :bounds="bounds">
      <template v-if="!(initial || number)">
        <CellNote
          v-for="n in notes"
          :key="n"
          :left="getNotePosition(n).x"
          :top="getNotePosition(n).y"
        >
          {{ n !== 0 ? n : "" }}
        </CellNote>
      </template>
    </CellNoteContainer>
  </div>
`,
});

export const Sudoku = defineComponent({
  name: "Sudoku",
  components: {
    SudokuGrid,
    SudokuCell,
    MenuContainer,
    MenuWrapper,
    SudokuMenuCircle,
  },
  props: {
    sudoku: {
      type: Array,
      required: true,
    },
    showHints: {
      type: Boolean,
      required: true,
    },
    activeCell: {
      type: Object,
      default: null,
    },
    showMenu: {
      type: Function,
      required: true,
    },
    hideMenu: {
      type: Function,
      required: true,
    },
    selectCell: {
      type: Function,
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
    clearNumber: {
      type: Function,
      required: true,
    },
    showConflicts: {
      type: Boolean,
      required: true,
    },
    showWrongEntries: {
      type: Boolean,
      required: true,
    },
    notesMode: {
      type: Boolean,
      required: true,
    },
    shouldShowMenu: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      height: 100,
      width: 100,
      containerWidth: 0,
      xSection: 100 / 9,
      ySection: 100 / 9,
      positionedCells: [],
      conflicting: [],
      uniquePaths: [],
      pathCells: [],
      friendsOfActiveCell: [],
    };
  },
  computed: {
    selectionPosition() {
      const active = this.getActiveCell();
      return {
        x: (active && active.x) || 0,
        y: (active && active.y) || 0,
      };
    },
    selectionBounds() {
      return {
        top: this.ySection * this.selectionPosition.y,
        left: this.xSection * this.selectionPosition.x,
        height: this.ySection,
        width: this.xSection,
      };
    },
  },
  mounted() {
    this.calculateDependencies();

    this.clickHandler = () => {
      const active = this.getActiveCell();
      if (active !== null) {
        this.hideMenu();
      }
    };

    window.addEventListener("click", this.clickHandler);

    // 初始化containerWidth
    this.updateContainerWidth();
    this.resizeObserver = new ResizeObserver(() => {
      this.updateContainerWidth();
    });
    this.resizeObserver.observe(this.$refs.sudokuContainerRef);
  },
  beforeUnmount() {
    if (this.clickHandler) {
      window.removeEventListener("click", this.clickHandler);
    }
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.$refs.sudokuContainerRef);
    }
  },
  methods: {
    getActiveCell() {
      if (!this.activeCell) return null;
      return this.sudoku.find((c) => c.x === this.activeCell.x && c.y === this.activeCell.y);
    },
    calculateDependencies() {
      this.positionedCells = SudokuGame.positionedCells(this.sudoku, this.width, this.height);
      this.conflicting = SudokuGame.conflictingFields(this.sudoku);

      const paths = this.conflicting
        .map((c) => {
          return SudokuGame.getPathsFromConflicting(c, this.sudoku);
        })
        .flat();

      this.uniquePaths = SudokuGame.uniquePaths(paths);

      this.pathCells = this.uniquePaths
        .map((p) => {
          return SudokuGame.getPathBetweenCell(p.from, p.to);
        })
        .flat();

      const active = this.getActiveCell();
      this.friendsOfActiveCell = active ? SudokuGame.sameSquareColumnRow(active, this.sudoku) : [];
    },
    updateContainerWidth() {
      if (this.$refs.sudokuContainerRef) {
        this.containerWidth = this.$refs.sudokuContainerRef.offsetWidth;
      }
    },
    handleClick(c) {
      this.selectCell(c);
      if (!c.initial) {
        this.showMenu();
      }
    },
    handleRightClick(c) {
      this.selectCell(c);
      if (!c.initial) {
        this.showMenu(true);
      }
    },
    isActiveCell(c) {
      const active = this.getActiveCell();
      return active ? c.x === active.x && c.y === active.y : false;
    },
    isHighlightedCell(c) {
      return this.friendsOfActiveCell.some((cc) => cc.x === c.x && cc.y === c.y);
    },
    isHighlightedNumber(c) {
      const active = this.getActiveCell();
      return active && c.number !== 0 ? active.number === c.number : false;
    },
    isInConflictPath(c) {
      return this.showConflicts && this.pathCells.some((d) => d.x === c.x && d.y === c.y);
    },
    isWrongEntry(c) {
      return this.showWrongEntries && (c.number === 0 ? false : c.solution !== c.number);
    },
    getCellBounds(c) {
      return {
        width: this.xSection,
        height: this.ySection,
        left: this.xSection * c.x,
        top: this.ySection * c.y,
      };
    },
    getPositionedCell(i) {
      return this.positionedCells[i];
    },
    getCellNotes(c, i) {
      const conflicted = this.conflicting[i];
      return this.showHints && c.notes.length === 0 ? conflicted.possibilities : c.notes;
    },
  },
  watch: {
    sudoku: {
      handler() {
        this.calculateDependencies();
      },
      deep: true,
    },
    activeCell: {
      handler() {
        this.calculateDependencies();
      },
    },
  },
  template: `
<div 
    class="relative" 
    ref="sudokuContainerRef" 
    :style="{ height: containerWidth + 'px' }"
  >
    <slot></slot>
    <div class="absolute h-full w-full rounded-sm">
      <SudokuGrid :width="width" :height="height" :hideLeftRight="true" />
      <SudokuCell
        v-for="(c, i) in sudoku"
        :key="i"
        :active="isActiveCell(c)"
        :highlight="isHighlightedCell(c)"
        :highlightNumber="isHighlightedNumber(c)"
        :conflict="isInConflictPath(c) || isWrongEntry(c)"
        :bounds="getCellBounds(c)"
        @click="handleClick(c)"
        @contextmenu="handleRightClick(c)"
        :left="getPositionedCell(i).x"
        :top="getPositionedCell(i).y"
        :notes="getCellNotes(c, i)"
        :number="c.number"
        :initial="c.initial"
        :notesMode="notesMode"
      />
      <MenuContainer
        v-if="activeCell && shouldShowMenu"
        :bounds="selectionBounds"
      >
        <MenuWrapper>
          <SudokuMenuCircle
            :cell="activeCell"
            :notesMode="notesMode"
            :showHints="showHints"
            :setNumber="setNumber"
            :setNotes="setNotes"
            :clearNumber="clearNumber"
            :sudoku="sudoku"
            :showMenu="showMenu"
          />
        </MenuWrapper>
      </MenuContainer>
    </div>
  </div>
`,
});

export default Sudoku;
