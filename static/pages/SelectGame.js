import GameSelect from "./Game/GameSelect.js";
import {Container} from "./components/Layout.js";
import Button from "./components/Button.js";
import {DarkModeButton} from "./components/DarkModeButton.js";

export default Vue.defineComponent({
  methods: {
    goBack(event) {
      this.$router.push('/');
    },
  },
  template: `    
<Container class="mt-4">
  <div class="mb-8 flex flex-col gap-2">
    <div class="flex gap-4 items-center justify-between">
      <h1 class="text-2xl text-white">{{$t('select_game_title')}}</h1>
      <div class="flex gap-2">
        <DarkModeButton />
        <Button class="bg-teal-600 dark:bg-teal-600 text-white flex-shrink-0" @click="goBack">
          {{"◀ " + $t('go_back')}}
        </Button>
      </div>
    </div>
    <p class="text-gray-300">{{$t('select_game_subtitle')}}</p>
  </div>
  <GameSelect />
</Container>`,
});
