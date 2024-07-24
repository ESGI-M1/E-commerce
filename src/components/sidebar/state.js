import { ref, computed, watchEffect } from 'vue'

export const collapsed = ref(window.innerWidth < 768)
export const toggleSidebar = () => (collapsed.value = !collapsed.value)
export const isMobile = ref(false)
export const sidebarWidth = computed(
  () => `${collapsed.value ? 0 : 190}px`
)

watchEffect(() => {
  isMobile.value = window.innerWidth <= 768
})

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})
