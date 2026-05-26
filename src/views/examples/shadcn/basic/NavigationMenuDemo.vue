<script setup lang="ts">
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/shadcn-vue/ui/navigation-menu'
import { Separator } from '@/components/shadcn-vue/ui/separator'

const products = [
  { name: '产品 A', description: '产品 A 的描述' },
  { name: '产品 B', description: '产品 B 的描述' },
]

const navLinks = [
  { label: '首页', active: false },
  { label: '产品（激活）', active: true },
  { label: '关于', active: false },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <h3 class="text-lg font-semibold">
      Navigation Menu 导航菜单
    </h3>
    <div class="flex flex-col gap-4">
      <!-- 基础导航菜单 -->
      <div>
        <p class="text-sm text-muted-foreground mb-2">
          基础导航（带下拉菜单）
        </p>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>产品</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div class="p-4 gap-3 grid w-[400px]">
                  <NavigationMenuLink v-for="product in products" :key="product.name">
                    <div class="flex flex-col gap-1">
                      <p class="text-sm font-medium">
                        {{ product.name }}
                      </p>
                      <p class="text-sm text-muted-foreground">
                        {{ product.description }}
                      </p>
                    </div>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink>
                文档
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <!-- 激活状态示例 -->
      <div>
        <p class="text-sm text-muted-foreground mb-2">
          激活状态（:active="true"）
        </p>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem v-for="link in navLinks" :key="link.label">
              <NavigationMenuLink :active="link.active">
                {{ link.label }}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <!-- 禁用状态示例 -->
      <div>
        <p class="text-sm text-muted-foreground mb-2">
          禁用状态
        </p>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink>
                可用链接
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink disabled>
                禁用链接
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
    <p class="text-sm text-muted-foreground">
      展示了基础导航、激活状态（:active="true"）和禁用状态
    </p>
  </div>

  <Separator />
</template>
