<script setup lang="ts">
interface Capability {
  title: string
  description: string
  icon: string
  accent: string
}

const props = defineProps<{
  capabilities: readonly Capability[]
}>()
</script>

<template>
  <section aria-labelledby="topnav-capabilities-title" class="space-y-5">
    <div>
      <p class="text-sm text-primary font-semibold">
        Top Navigation Surface
      </p>
      <h2 id="topnav-capabilities-title" class="text-2xl tracking-tight font-black mt-1">
        顶部导航模板能力
      </h2>
    </div>

    <div class="gap-4 grid md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="capability in props.capabilities"
        :key="capability.title"
        class="group p-5 border rounded-[1.5rem] bg-card shadow-sm transition duration-300 relative overflow-hidden hover:shadow-foreground/5 hover:shadow-xl hover:-translate-y-1"
      >
        <div class="h-1 inset-x-0 top-0 absolute" :class="capability.accent" aria-hidden="true" />
        <div class="text-primary mb-5 rounded-2xl bg-muted grid size-12 transition place-items-center group-hover:scale-105">
          <span :class="capability.icon" class="size-5" aria-hidden="true" />
        </div>
        <h3 class="text-base font-bold">
          {{ capability.title }}
        </h3>
        <p class="text-sm text-muted-foreground leading-6 mt-2">
          {{ capability.description }}
        </p>
      </article>
    </div>
  </section>
</template>
