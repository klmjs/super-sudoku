const {defineComponent} = Vue;

export const Container = defineComponent({
  name: "Container",
  template: `
  <div :class="['max-w-screen-xl', 'mx-auto', 'px-4']">
    <slot></slot>
  </div>
`,
});

export default Container;
