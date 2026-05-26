<script setup lang="ts">
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Pagination, PaginationContent, PaginationEllipsis, PaginationFirst, PaginationItem, PaginationLast, PaginationNext, PaginationPrevious, ScrollArea, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@tauri-vue-template/ui'
import { ref } from 'vue'

const selectedRow = ref(1)
const currentPage = ref(2)

const tableData = [
  { id: 0, name: '项目 1', status: '进行中', variant: 'default' as const },
  { id: 1, name: '项目 2', status: '已完成', variant: 'secondary' as const },
  { id: 2, name: '项目 3', status: '待开始', variant: 'outline' as const },
]

const cards = [
  { title: '简单卡片', description: '这是一个基础的卡片组件', hasFooter: false },
  { title: '带页脚的卡片', description: '包含操作按钮', hasFooter: true },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Table 表格 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Table 表格
      </h3>
      <div class="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="row in tableData"
              :key="row.id"
              :class="{ 'bg-muted/50': selectedRow === row.id }"
              @click="selectedRow = row.id"
            >
              <TableCell>{{ row.name }}{{ selectedRow === row.id ? '（当前选中）' : '' }}</TableCell>
              <TableCell>
                <Badge :variant="row.variant">
                  {{ row.status }}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="ghost">
                  编辑
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p class="text-sm text-muted-foreground">
        点击行可以选中，当前选中：项目 {{ selectedRow + 1 }}
      </p>
    </div>

    <Separator />

    <!-- Card 卡片 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Card 卡片
      </h3>
      <div class="gap-4 grid md:grid-cols-2">
        <Card v-for="card in cards" :key="card.title">
          <CardHeader>
            <CardTitle>{{ card.title }}</CardTitle>
            <CardDescription>{{ card.description }}</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              卡片内容区域
            </p>
          </CardContent>
          <CardFooter v-if="card.hasFooter" class="flex justify-between">
            <Button variant="outline">
              取消
            </Button>
            <Button>确认</Button>
          </CardFooter>
        </Card>
      </div>
    </div>

    <Separator />

    <!-- Pagination 分页 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Pagination 分页
      </h3>

      <!-- 基础分页示例 -->
      <div class="flex flex-col gap-2">
        <h4 class="text-sm font-medium">
          基础分页示例
        </h4>
        <Pagination
          v-slot="{ page }"
          :items-per-page="10"
          :total="100"
          :page="currentPage"
          @update:page="currentPage = $event"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationPrevious>
              <span class="i-ri-arrow-left-s-line" />
              <span class="hidden sm:block">上一页</span>
            </PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === page"
              >
                {{ item.value }}
              </PaginationItem>
            </template>
            <PaginationEllipsis :index="4" />
            <PaginationNext>
              <span class="hidden sm:block">下一页</span>
              <span class="i-ri-arrow-right-s-line" />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>

      <!-- 自定义示例（带首页/末页 + 移动端优化） -->
      <div class="flex flex-col gap-2">
        <h4 class="text-sm font-medium">
          自定义示例（带首页/末页 + 移动端优化）
        </h4>
        <Pagination
          v-slot="{ page }"
          :items-per-page="10"
          :total="100"
          :sibling-count="1"
          show-edges
          :page="currentPage"
          class="max-sm:px-2"
          @update:page="currentPage = $event"
        >
          <PaginationContent v-slot="{ items }">
            <PaginationFirst class="hidden sm:block">
              <span class="i-ri-arrow-left-double-line" />
              <span>首页</span>
            </PaginationFirst>
            <PaginationPrevious>
              <span class="i-ri-arrow-left-s-line" />
              <span class="hidden sm:block">上一页</span>
            </PaginationPrevious>
            <template v-for="(item, index) in items" :key="index">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === page"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else />
            </template>
            <PaginationNext>
              <span class="hidden sm:block">下一页</span>
              <span class="i-ri-arrow-right-s-line" />
            </PaginationNext>
            <PaginationLast class="hidden sm:block">
              <span>末页</span>
              <span class="i-ri-arrow-right-double-line" />
            </PaginationLast>
          </PaginationContent>
        </Pagination>
      </div>

      <!-- 自定义示例（完整版 + 自动换行） -->
      <div class="flex flex-col gap-2">
        <h4 class="text-sm font-medium">
          自定义示例（完整版 + 自动换行）
        </h4>
        <Pagination
          v-slot="{ page }"
          :total="100"
          :items-per-page="10"
          :sibling-count="1"
          :page="currentPage"
          show-edges
          class="max-sm:px-2"
          @update:page="currentPage = $event"
        >
          <PaginationContent v-slot="{ items }" class="flex-wrap gap-1">
            <PaginationFirst>
              <span class="i-ri-arrow-left-double-line" />
              <span>首页</span>
            </PaginationFirst>
            <PaginationPrevious>
              <span class="i-ri-arrow-left-s-line" />
              <span>上一页</span>
            </PaginationPrevious>
            <template v-for="(item, index) in items" :key="`page-${index}`">
              <PaginationItem
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === page"
              >
                {{ item.value }}
              </PaginationItem>
              <PaginationEllipsis v-else />
            </template>
            <PaginationNext>
              <span>下一页</span>
              <span class="i-ri-arrow-right-s-line" />
            </PaginationNext>
            <PaginationLast>
              <span>末页</span>
              <span class="i-ri-arrow-right-double-line" />
            </PaginationLast>
          </PaginationContent>
        </Pagination>
      </div>

      <p class="text-sm text-muted-foreground">
        当前页：{{ currentPage }} / 10
      </p>
    </div>

    <Separator />

    <!-- ScrollArea 滚动区域 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        ScrollArea 滚动区域
      </h3>
      <ScrollArea class="p-4 border rounded-md h-[200px] w-full">
        <div class="flex flex-col gap-2">
          <p v-for="i in 20" :key="i" class="text-sm">
            滚动内容 {{ i }}
          </p>
        </div>
      </ScrollArea>
      <p class="text-sm text-muted-foreground">
        滚动条样式使用主题变量，hover 时会高亮显示
      </p>
    </div>
  </div>
</template>
