const {defineComponent} = Vue;

export const Checkbox = defineComponent({
  name: "Checkbox",
  props: {
    id: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["onChange", "update:modelValue"],
  methods: {
    handleChange(event) {
      const checked = event.target.checked;
      this.$emit("update:modelValue", checked);
      this.$emit("onChange", checked);
    },
  },
  template: `
<div class="relative flex items-center">
  <div class="flex h-5 items-center">
    <input
      :checked="modelValue"
      @change="handleChange"
      :id="id"
      :aria-describedby="id + 'description'"
      :name="id"
      type="checkbox"
      class="h-6 w-6 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
    />
  </div>
  <div class="ml-3">
    <slot></slot>
  </div>
</div>
`,
});

export default Checkbox;
