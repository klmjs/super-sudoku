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
      required: true,
    },
  },
  template: `
  <div
    :style="{
      width: width + '%',
      top: top + '%',
      height: makeBold ? '2px' : '1px'
    }"
    :class="['absolute left-0 -translate-y-1/2', { 'bg-gray-400 dark:bg-gray-500': makeBold, 'bg-gray-300 dark:bg-gray-600': !makeBold }]"
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
      required: true,
    },
  },
  template: `
  <div
    :style="{
      height: height + '%',
      left: left + '%',
      width: makeBold ? '2px' : '1px'
    }"
    :class="['absolute left-0 -translate-y-1/2', { 'bg-gray-400 dark:bg-gray-500': makeBold, 'bg-gray-300 dark:bg-gray-600': !makeBold }]"
  />
`,
});

export const CellNote = defineComponent({
  name: "CellNote",
  props: {
    left: {
      type: Number,
      required: true,
    },
    top: {
      type: Number,
      required: true,
    },
  },
  template: `
  <div
    :style="{ top: top + '%', left: left + '%' }"
    class="absolute -translate-x-1/2 -translate-y-1/2 text-xs text-sky-400 sm:text-sm"
  >
    <slot></slot>
  </div>
`,
});

export const CellNoteContainer = defineComponent({
  name: "CellNoteContainer",
  props: {
    initial: {
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
  },
  template: `
  <div
    :style="{
      width: bounds.width + '%',
      height: bounds.height + '%',
      top: bounds.top + '%',
      left: bounds.left + '%'
    }"
    :class="[ 'pointer-events-none absolute', { 'font-bold': initial } ]"
  >
    <slot></slot>
  </div>
`,
});

export const GridCell = defineComponent({
  name: "GridCell",
  props: {
    conflict: {
      type: Boolean,
      required: true,
    },
    highlight: {
      type: Boolean,
      required: true,
    },
    highlightNumber: {
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
    active: {
      type: Boolean,
      required: true,
    },
    notesMode: {
      type: Boolean,
      required: true,
    },
    onClick: {
      type: Function,
      required: true,
    },
    onRightClick: {
      type: Function,
      required: true,
    },
  },
  computed: {
    backgroundColorClass() {
      if (this.conflict) {
        return "bg-red-200 dark:bg-red-900";
      }
      if (this.highlightNumber) {
        return "bg-gray-300 dark:bg-gray-600";
      }
      if (this.highlight) {
        return "bg-gray-200 dark:bg-gray-700";
      }
      return "bg-white dark:bg-gray-800";
    },
    borderColorClass() {
      if (this.active) {
        if (this.notesMode) {
          return "border-sky-400 dark:border-sky-600";
        }
        return "border-teal-400 dark:border-teal-600";
      }
      return "border-transparent";
    },
    dimensions() {
      return {
        width: this.bounds.width + "%",
        height: this.bounds.height + "%",
        top: this.bounds.top + "%",
        left: this.bounds.left + "%",
      };
    },
  },
  template: `
  <div>
    <div
      @click.stop.prevent="onClick"
      @contextmenu.stop.prevent="onRightClick"
      :style="dimensions"
      :class="['absolute', 'z-20', 'border-2', borderColorClass]"
    />
    <div
      :style="dimensions"
      :class="['absolute z-0 transition-colors duration-0 hover:bg-opacity-50', backgroundColorClass]"
    />
  </div>
`,
});

export const GridCellNumber = defineComponent({
  name: "GridCellNumber",
  props: {
    initial: {
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
    left: {
      type: Number,
      required: true,
    },
    top: {
      type: Number,
      required: true,
    },
  },
  template: `
  <div
    :style="{
      left: left + '%',
      top: top + '%'
    }"
    :class="['pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 text-lg font-bold', {
        'text-black dark:text-white': initial,
        'text-amber-600': highlight && !conflict,
        'text-teal-600': !initial && !highlight && !conflict,
        'text-red-600 dark:text-red-300': conflict && !initial
      } ]"
  >
    <slot></slot>
  </div>
`,
});
