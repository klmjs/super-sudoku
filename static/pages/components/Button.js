const {defineComponent} = Vue;

export const Button = defineComponent({
  name: "Button",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
  template: `
  <button
    :class="[
      'rounded-sm border-none bg-white dark:text-white dark:bg-gray-500 md:px-4 md:py-2 px-2 py-1 text-black shadow-sm transition-transform hover:brightness-90 focus:outline-none disabled:brightness-75',
      {
        'scale-110 brightness-90': active,
      }
    ]"
  >
    <slot></slot>
  </button>
`,
});

export default Button;
