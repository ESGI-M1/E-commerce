<template>
  <h1>The sidebar is {{ collapsed ? 'closed' : 'open' }}</h1>
  <fancy-confirm
    :buttonText="'Toggle Sidebar'"
    :confirmationMessage="'Are you sure you want to toggle the sidebar?'"
    @confirmed="toggleSidebar"
  >
  </fancy-confirm>
</template>

<script lang="ts">
import { collapsed, toggleSidebar } from '../components/sidebar/state.js'
import FancyConfirm from '../components/Confirm.vue'

export default {
  components: { FancyConfirm },
  setup() {
    return { collapsed, toggleSidebar }
  }
}
</script>
