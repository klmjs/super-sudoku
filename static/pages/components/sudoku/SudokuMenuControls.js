import Button from "../Button.js";
import LanguageSelector from "../LanguageSelector.js";

const {defineComponent} = Vue;

export const UndoButton = defineComponent({
  name: "UndoButton",
  components: {
    Button,
  },
  props: {
    canUndo: {
      type: Boolean,
      required: true,
    },
    undo: {
      type: Function,
      required: true,
    },
  },
  methods: {
    handleUndo() {
      this.undo();
    },
  },
  template: `
  <Button :disabled="!canUndo" @click="handleUndo">
    {{ $t("undo_btn") }}
  </Button>
`,
});

export const EraseButton = defineComponent({
  name: "EraseButton",
  components: {
    Button,
  },
  props: {
    activeCellCoordinates: {
      type: Object,
      default: null,
    },
    clearCell: {
      type: Function,
      required: true,
    },
  },
  methods: {
    handleErase() {
      if (this.activeCellCoordinates) {
        this.clearCell(this.activeCellCoordinates);
      }
    },
  },
  template: `
  <Button @click="handleErase">
    {{ $t("erase_btn") }}
  </Button>
`,
});

export const NotesButton = defineComponent({
  name: "NotesButton",
  components: {
    Button,
  },
  props: {
    notesMode: {
      type: Boolean,
      required: true,
    },
    activateNotesMode: {
      type: Function,
      required: true,
    },
    deactivateNotesMode: {
      type: Function,
      required: true,
    },
  },
  methods: {
    toggleNotesMode() {
      if (this.notesMode) {
        this.deactivateNotesMode();
      } else {
        this.activateNotesMode();
      }
    },
  },
  template: `
  <Button @click="toggleNotesMode" class="relative">
    <div
      :class="[
        'absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full px-2 text-sm md:text-base',
        {
          'bg-teal-700 text-white': !notesMode,
          'bg-sky-700 text-white': notesMode,
        }
      ]"
    >
      {{ notesMode ? "ON" : "OFF" }}
    </div>
    <div>{{ $t("note_btn") }}</div>
  </Button>
`,
});

export const HintButton = defineComponent({
  name: "HintButton",
  components: {
    Button,
  },
  props: {
    activeCellCoordinates: {
      type: Object,
      required: true,
    },
    getHint: {
      type: Function,
      required: true,
    },
  },
  methods: {
    handleGetHint() {
      if (this.activeCellCoordinates) {
        this.getHint(this.activeCellCoordinates);
      }
    },
  },
  template: `
  <Button @click="handleGetHint">
    {{ $t("hint_btn") }}
  </Button>
`,
});

export const SudokuMenuControls = defineComponent({
  name: "SudokuMenuControls",
  components: {
    UndoButton,
    EraseButton,
    NotesButton,
    HintButton,
  },
  props: {
    notesMode: {
      type: Boolean,
      required: true,
    },
    activeCellCoordinates: {
      type: Object,
      required: true,
    },
    clearCell: {
      type: Function,
      required: true,
    },
    activateNotesMode: {
      type: Function,
      required: true,
    },
    deactivateNotesMode: {
      type: Function,
      required: true,
    },
    getHint: {
      type: Function,
      required: true,
    },
    canUndo: {
      type: Boolean,
      required: true,
    },
    undo: {
      type: Function,
      required: true,
    },
  },
  template: `
  <div class="grid w-full grid-cols-4 gap-2">
    <UndoButton :can-undo="canUndo" :undo="undo" />
    <EraseButton 
      :active-cell-coordinates="activeCellCoordinates" 
      :clear-cell="clearCell" 
    />
    <NotesButton
      :notes-mode="notesMode"
      :activate-notes-mode="activateNotesMode"
      :deactivate-notes-mode="deactivateNotesMode"
    />
    <HintButton 
      :active-cell-coordinates="activeCellCoordinates" 
      :get-hint="getHint" 
    />
  </div>
`,
});

export default SudokuMenuControls;
