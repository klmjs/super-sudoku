const {defineComponent} = Vue;

export const GridLineX = defineComponent({
  name: "GridLineX",
  props: {
    top: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    makeBold: {
      type: Boolean,
      default: false,
    },
  },
  template: `
  <div
    :class="[
      'absolute left-0 h-px transform -translate-y-1/2',
      makeBold ? 'bg-gray-400 dark:bg-gray-400' : 'bg-gray-200 dark:bg-gray-600'
    ]"
    :style="{
      width: width + '%',
      top: top + '%'
    }"
  />
`,
});

export const GridLineY = defineComponent({
  name: "GridLineY",
  props: {
    left: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    makeBold: {
      type: Boolean,
      default: false,
    },
  },
  template: `
  <div
    :class="[
      'absolute top-0 w-px transform -translate-x-1/2',
      makeBold ? 'bg-gray-400 dark:bg-gray-400' : 'bg-gray-200 dark:bg-gray-600'
    ]"
    :style="{
      height: height + '%',
      left: left + '%'
    }"
  />
`,
});

export const SudokuPreviewGrid = defineComponent({
  name: "SudokuPreviewGrid",
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
  computed: {
    lineNumbers() {
      const numbers9 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const numbers8 = [1, 2, 3, 4, 5, 6, 7, 8];
      return this.hideLeftRight ? numbers8 : numbers9;
    },
  },
  template: `
  <div>
    <GridLineX
      v-for="i in lineNumbers"
      :key="'x' + i"
      :make-bold="[3, 6].includes(i)"
      :width="width"
      :top="(i * height) / 9"
    />
    <GridLineY
      v-for="i in lineNumbers"
      :key="'y' + i"
      :make-bold="[3, 6].includes(i)"
      :height="height"
      :left="(i * height) / 9"
    />
  </div>
`,
});

export const SudokuPreview = defineComponent({
  name: "SudokuPreview",
  components: {
    SudokuPreviewGrid,
  },
  props: {
    sudoku: {
      type: Array,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    darken: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 150,
    },
    onClick: {
      type: Function,
      required: true,
    },
  },
  computed: {
    containerHeight() {
      return this.size;
    },
    containerWidth() {
      return this.size;
    },
    height() {
      return 100;
    },
    width() {
      return 100;
    },
    fontSize() {
      return this.size / 16;
    },
    xSection() {
      return this.height / 9;
    },
    ySection() {
      return this.width / 9;
    },
  },
  methods: {
    handleClick() {
      this.onClick();
    },
    handleKeydown(event) {
      if (event.key === "Enter") {
        this.onClick();
      }
    },
  },
  template: `
  <div
    class="user-select-none hover:cursor-pointer group"
    :tabindex="id + 4"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div
      class="relative bg-gray-100 dark:bg-gray-700 rounded-sm"
      :style="{
        height: containerHeight + 'px',
        width: containerWidth + 'px',
        fontSize: fontSize + 'px',
        lineHeight: 1,
      }"
    >
      <div class="absolute z-10 top-0 left-0 w-full h-full flex items-center justify-center">
        <div 
          :style="{fontSize: size / 3 + 'px'}" 
          class="font-bold text-black dark:text-white opacity-80"
        >
          {{ id }}
        </div>
      </div>
      <SudokuPreviewGrid 
        :width="width" 
        :height="height" 
        :hide-left-right="true" 
      />
      <div v-for="(row, y) in sudoku" :key="y">
        <div 
          v-for="(n, x) in row" 
          v-if="n !== 0"
          :key="x"
          class="text-black dark:text-white absolute"
          :style="{
            position: "absolute",
            left: xSection * (x + 0.5) + '%',
            top: ySection * (y + 0.5) + '%',
            transform: 'translate(-50%, -50%)',
          }"
        >
          {{ n }}
        </div>
      </div>
      <div 
        v-if="darken" 
        class="absolute z-20 top-0 left-0 w-full h-full bg-black opacity-20 group-hover:opacity-0 transition-opacity duration-300" 
      />
    </div>
  </div>
`,
});

export default SudokuPreview;
