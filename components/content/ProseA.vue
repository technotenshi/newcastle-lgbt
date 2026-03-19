<template>
  <a
    v-if="isExternal"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
  ><slot /></a>
  <NuxtLink
    v-else
    :href="href"
  >
    <slot />
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  href: {
    type: String,
    default: '',
  },
});

const isExternal = computed(() => /^https?:\/\//.test(props.href));
</script>
