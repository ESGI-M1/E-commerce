import { ref } from 'vue';

const loading = ref(false);

export function load() {
  let loadingTimeout;

  function startLoading() {
    loading.value = true;
  }

  function stopLoading() {
    clearTimeout(loadingTimeout);
    loadingTimeout = setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  return { loading, startLoading, stopLoading };
}
