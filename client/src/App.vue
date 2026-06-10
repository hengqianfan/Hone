<script setup lang="ts">
import { onMounted } from 'vue'
import Controller from './components/Controller/index.vue'
import BokeNav from './components/BokeNav/index.vue'
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()

onMounted(() => {
  document.addEventListener('click', async (e) => {

    const target = e.target as HTMLElement

    if (
      !target.classList.contains('md-code-copy')
    ) {
      return
    }

    const code =
      decodeURIComponent(
        target.dataset.code || ''
      )

    await navigator.clipboard.writeText(code)

    const old = target.innerText

    target.innerText = 'Copied'

    setTimeout(() => {
      target.innerText = old
    }, 1500)
  })
})

</script>

<template>
  <div id="app">
    <Controller />
    <!-- <BokeNav v-if="themeStore.webMode == 'boke'" /> -->


    <router-view />
  </div>
</template>

<style lang="scss" scoped>
#app {
  // background-color: #eff1f4;
  width: 100%;
  height: 100vh;
  // background-image: url(./assets/imgs/banners/banner02.png);
  // background-color: rgb(230, 230, 230);
  background-size: cover;
  background-position: center;


}
</style>
