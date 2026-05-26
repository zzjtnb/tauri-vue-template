<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="mx-auto flex flex-col gap-5 max-w-7xl w-full">
    <section class="p-5 border border-border rounded-3xl bg-card shadow-sm md:p-6">
      <p class="text-sm text-primary font-medium m-0">
        {{ eyebrow }}
      </p>
      <h1 class="text-3xl tracking-[-0.035em] font-bold mb-0 mt-2 md:text-4xl">
        {{ title }}
      </h1>
      <p class="text-sm text-muted-foreground leading-7 mb-0 mt-3 max-w-4xl md:text-base">
        {{ description }}
      </p>
    </section>

    <slot />
  </div>
</template>
