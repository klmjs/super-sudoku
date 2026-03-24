import {SUDOKU_NUMBERS} from "../../../utility.js";
import SudokuGame from "../../../SudokuGame.js";
import {colors} from "../../../i18n.js";

const {defineComponent} = Vue;

export const MenuContainer = defineComponent({
  name: "MenuContainer",
  props: {
    bounds: {
      type: Object,
      required: true,
      validator: function (value) {
        return typeof value === "object" && "width" in value && "height" in value && "top" in value && "left" in value;
      },
    },
  },
  template: `
  <div
    class="absolute"
    :style="{
      width: bounds.width + '%',
      height: bounds.height + '%',
      top: bounds.top + '%',
      left: bounds.left + '%',
    }"
  >
    <slot></slot>
  </div>
`,
});

export const MenuWrapper = defineComponent({
  name: "MenuWrapper",
  template: `
  <div
    class="relative z-50"
    :style="{
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }"
  >
    <div class="menu-wrapper-mobile">
      <slot></slot>
    </div>
  </div>
`,
});

const TAU = Math.PI * 2;

const MENU_COLORS = {
  menuColors: {
    normal: colors.teal[500],
    alternate: colors.teal[600],
    alternate2: colors.teal[400],
    noteNormal: colors.sky[500],
    noteAlternate: colors.sky[600],
    noteAlternate2: colors.sky[400],
  },
};

export const MenuCirclePart = defineComponent({
  name: "MenuCirclePart",
  props: {
    radius: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    onClick: {
      type: Function,
      default: null,
    },
    minRad: {
      type: Number,
      required: true,
    },
    maxRad: {
      type: Number,
      required: true,
    },
    stroke: {
      type: String,
      required: true,
    },
  },
  computed: {
    textRadius() {
      return this.radius + 8;
    },
    circumCircle() {
      return TAU * this.radius;
    },
    step() {
      return Math.abs(this.maxRad - this.minRad);
    },
    textX() {
      return this.textRadius * Math.cos(this.minRad + this.step * 0.5) + radius * 2;
    },
    textY() {
      const yOffset = 7;
      return this.textRadius * Math.sin(this.minRad + this.step * 0.5) + radius * 2 + yOffset;
    },
    strokeDashoffset() {
      return -((this.minRad / TAU) * this.circumCircle) % this.circumCircle;
    },
    strokeDasharray() {
      return `${(this.step / TAU) * this.circumCircle} ${this.circumCircle}`;
    },
  },
  methods: {
    handleClick(event) {
      if (this.onClick) {
        this.onClick(event);
      }
    },
  },
  template: `
  <g>
    <circle
      :class="['stroke-[50px] opacity-75', 'hover:stroke-[60px] hover:cursor-pointer hover:fill-opacity-90', isActive ? 'stroke-[60px] cursor-pointer fill-opacity-90' : '']"
      :r="radius"
      :cx="radius * 2"
      :cy="radius * 2"
      fill="none"
      @click="handleClick"
      :style="{
        strokeDashoffset: strokeDashoffset,
        strokeDasharray: strokeDasharray,
        stroke: stroke,
      }"
    />
    <text
      :x="textX"
      :y="textY"
      :style="{
        fill: 'white',
        textAnchor: 'middle',
        zIndex: 100,
        pointerEvents: 'none',
      }"
    >
      <slot></slot>
    </text>
  </g>
`,
});

export const MenuCircle = defineComponent({
  name: "MenuCircle",
  components: {
    MenuCirclePart,
  },
  props: {
    cell: {
      type: Object,
      required: true,
    },
    notesMode: {
      type: Boolean,
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
    showMenu: {
      type: Function,
      required: true,
    },
    clearNumber: {
      type: Function,
      required: true,
    },
    sudoku: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      circleRadius: 45,
      minRad: 0,
      maxRad: TAU,
      SUDOKU_NUMBERS: SUDOKU_NUMBERS,
      TAU: TAU,
    };
  },
  computed: {
    usedRad() {
      return Math.abs(this.maxRad - this.minRad);
    },
    circumCircle() {
      return TAU * this.circleRadius;
    },
    radPerStep() {
      return this.usedRad / SUDOKU_NUMBERS.length;
    },
    notesToUse() {
      const conflicting = SudokuGame.conflictingFields(this.sudoku);
      const userNotes = this.sudoku[this.cell.y * 9 + this.cell.x].notes;
      const conflictingCell = conflicting[this.cell.y * 9 + this.cell.x];
      const autoNotes = this.showHints ? conflictingCell.possibilities : [];
      const notesToUse = userNotes.length === 0 && autoNotes.length > 0 ? autoNotes : userNotes;
      return notesToUse;
    },
    colors() {
      return this.notesMode
        ? [
            MENU_COLORS.menuColors.noteNormal,
            MENU_COLORS.menuColors.noteAlternate,
            MENU_COLORS.menuColors.noteAlternate2,
          ]
        : [MENU_COLORS.menuColors.normal, MENU_COLORS.menuColors.alternate, MENU_COLORS.menuColors.alternate2];
    },
  },
  methods: {
    getIsActive(number) {
      let isActive = number === this.cell.number;
      const notesToUse = this.notesToUse;

      if (this.notesMode) {
        isActive = notesToUse.includes(number);
      }

      return isActive;
    },
    handleClick(event, number) {
      if (this.notesMode) {
        event.preventDefault();
        event.stopPropagation();
      }

      const notesToUse = this.notesToUse;

      if (this.notesMode) {
        const newNotes = notesToUse.includes(number)
          ? notesToUse.filter((note) => note !== number)
          : [...userNotes, number];
        this.setNotes(this.cell, newNotes);
      } else {
        if (number === this.cell.number) {
          this.clearNumber(this.cell);
        } else {
          this.setNumber(this.cell, number);
        }
      }
    },
  },
  template: `
  <svg
    v-if="cell !== null"
    class="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none"
    :style="{
      height: circleRadius * 4 + 'px',
      width: circleRadius * 4 + 'px',
      transform: 'translate(-50%, -50%) rotate(' + minRad + 'rad)',
      WebkitTouchCallout: 'none',
      WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    }"
    @click="showMenu"
  >
    <circle
      :r="circleRadius"
      :cx="circleRadius * 2"
      :cy="circleRadius * 2"
      :style="{
        pointerEvents: 'none',
        strokeDashoffset: 0,
        strokeDasharray: ((usedRad / TAU) * circumCircle) + ' ' + circumCircle,
      }"
      fill="none"
      :class="notesMode ? 'ss_menu-circle-notes' : 'ss_menu-circle'"
    />
    <MenuCirclePart
      v-for="(number, i) in SUDOKU_NUMBERS"
      :key="i"
      :radius="circleRadius"
      :isActive="getIsActive(number)"
      :minRad="minRad + radPerStep * (i + 1)"
      :stroke="colors[i % colors.length]"
      :maxRad="minRad + radPerStep * (i + 1) + radPerStep"
      @click="handleClick($event, number)"
    >
      {{ number }}
    </MenuCirclePart>
  </svg>
`,
});

export default MenuCircle;
