<template>
  <div id="app">
    <GLoading ref="transitionRef" />
    <GBackground />

    <!-- <GPannel /> -->
    <!-- <GCtrl /> -->
    <GHub />
    <router-view class="view"></router-view>


  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import GBackground from './components/GBackground/index.vue'
import GHub from './components/GHub/index.vue'
import GLoading from '@/components/GLoading/index.vue'
import { registerOverlay } from '@/router'

const transitionRef = ref<InstanceType<typeof GLoading>>()

onMounted(() => {

  registerOverlay(transitionRef.value)
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


<style lang="scss" scoped>
#app {

  width: 100%;
  height: 100vh;

  background-size: cover;
  background-position: center;

  .view {
    z-index: 100;
  }
}
</style>
