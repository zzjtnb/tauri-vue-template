<script setup lang="ts">
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, HoverCard, HoverCardContent, HoverCardTrigger, Menubar, MenubarCheckboxItem, MenubarContent, MenubarGroup, MenubarItem, MenubarLabel, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger, Popover, PopoverContent, PopoverTrigger, Separator, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@tauri-vue-template/ui'
import { ref } from 'vue'

const dialogOpen = ref(false)
const alertDialogOpen = ref(false)
const commandOpen = ref(false)
const showStatusBar = ref(true)
const showActivityBar = ref(false)
const position = ref('bottom')
const contextMode = ref('preview')
const menubarView = ref('compact')
const menubarWrap = ref(true)

const basicMenuItems = [
  { label: '个人资料' },
  { label: '账单' },
  { label: '设置' },
]

const radioPositions = [
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
  { value: 'right', label: '右侧' },
]

const sheetSides = [
  { side: 'left', icon: 'i-ri-layout-left-line', label: '从左侧打开', title: '侧边栏标题', description: '常用于导航菜单。' },
  { side: 'right', icon: 'i-ri-layout-right-line', label: '从右侧打开', title: '设置面板', description: '常用于设置或详情面板。' },
  { side: 'top', icon: 'i-ri-layout-top-line', label: '从顶部打开', title: '通知面板', description: '适合展示短通知或全局提示。' },
  { side: 'bottom', icon: 'i-ri-layout-bottom-line', label: '从底部打开', title: '操作面板', description: '适合移动端操作菜单。' },
] as const

const subMenuItems = [
  { label: '保存页面' },
  { label: '创建快捷方式' },
  { label: '命名窗口' },
]

const commands = [
  { value: 'calendar', icon: 'i-ri-calendar-line', label: '日历' },
  { value: 'search', icon: 'i-ri-search-line', label: '搜索' },
  { value: 'settings', icon: 'i-ri-settings-3-line', label: '设置' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Dialog 对话框 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Dialog 对话框
      </h3>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>打开对话框</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>对话框标题</DialogTitle>
            <DialogDescription>
              这是一个标准的对话框组件，用于显示重要信息或获取用户输入。
            </DialogDescription>
          </DialogHeader>
          <div class="py-4">
            <p class="text-sm">
              对话框内容区域
            </p>
          </div>
          <DialogFooter>
            <DialogClose as-child>
              <Button variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button @click="dialogOpen = false">
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <Separator />

    <!-- Alert Dialog 警告对话框 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Alert Dialog 警告对话框
      </h3>
      <AlertDialog v-model:open="alertDialogOpen">
        <AlertDialogTrigger as-child>
          <Button variant="destructive">
            删除操作
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除您的数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction @click="alertDialogOpen = false">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

    <Separator />

    <!-- Dropdown Menu 下拉菜单 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Dropdown Menu 下拉菜单
      </h3>
      <div class="flex flex-wrap gap-2">
        <!-- 基础菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              基础菜单
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>我的账户</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem v-for="item in basicMenuItems" :key="item.label">
                {{ item.label }}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>退出登录</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 带 Checkbox 的菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              Checkbox 菜单
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <DropdownMenuLabel>外观</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem v-model:checked="showStatusBar">
                状态栏
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem v-model:checked="showActivityBar">
                活动栏
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 带 Radio 的菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              Radio 菜单
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <DropdownMenuLabel>面板位置</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup v-model="position">
                <DropdownMenuRadioItem v-for="pos in radioPositions" :key="pos.value" :value="pos.value">
                  {{ pos.label }}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 带子菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline">
              子菜单
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>新建文件</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  更多工具
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem v-for="item in subMenuItems" :key="item.label">
                      {{ item.label }}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>关闭</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <Separator />

    <!-- Context Menu 右键菜单 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Context Menu 右键菜单
      </h3>
      <ContextMenu>
        <ContextMenuTrigger class="text-sm text-muted-foreground border rounded-lg border-dashed flex h-28 items-center justify-center">
          在此区域右键打开 ContextMenu
        </ContextMenuTrigger>
        <ContextMenuContent class="w-56">
          <ContextMenuLabel>资源操作</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuGroup>
            <ContextMenuItem>
              打开
              <ContextMenuShortcut>⌘O</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuCheckboxItem v-model:checked="showStatusBar">
              显示状态栏
            </ContextMenuCheckboxItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                更多操作
              </ContextMenuSubTrigger>
              <ContextMenuSubContent class="w-48">
                <ContextMenuGroup>
                  <ContextMenuItem>复制链接</ContextMenuItem>
                  <ContextMenuItem>固定到侧边栏</ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup v-model="contextMode">
            <ContextMenuRadioItem value="preview">
              预览
            </ContextMenuRadioItem>
            <ContextMenuRadioItem value="edit">
              编辑
            </ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    </div>

    <Separator />

    <!-- Menubar 菜单栏 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Menubar 菜单栏
      </h3>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>文件</MenubarTrigger>
          <MenubarContent>
            <MenubarGroup>
              <MenubarItem>
                新建会话
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                打开工作区
                <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
            </MenubarGroup>
            <MenubarSeparator />
            <MenubarItem>关闭</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>视图</MenubarTrigger>
          <MenubarContent>
            <MenubarLabel>布局</MenubarLabel>
            <MenubarSeparator />
            <MenubarCheckboxItem v-model:checked="menubarWrap">
              自动换行
            </MenubarCheckboxItem>
            <MenubarSub>
              <MenubarSubTrigger>
                显示密度
              </MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarRadioGroup v-model="menubarView">
                  <MenubarRadioItem value="compact">
                    紧凑
                  </MenubarRadioItem>
                  <MenubarRadioItem value="comfortable">
                    舒展
                  </MenubarRadioItem>
                </MenubarRadioGroup>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <p class="text-sm text-muted-foreground">
        Menubar 使用 Menu、Group、RadioGroup 和 Sub 组合桌面式菜单。
      </p>
    </div>

    <Separator />

    <!-- Popover 弹出框 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Popover 弹出框
      </h3>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">
            打开弹出框
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-80">
          <div class="flex flex-col gap-2">
            <h4 class="font-medium">
              弹出框标题
            </h4>
            <p class="text-sm text-muted-foreground">
              这是一个弹出框组件，可以包含任意内容。
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>

    <Separator />

    <!-- Tooltip 提示框 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Tooltip 提示框
      </h3>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="outline">
              悬停查看提示
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>这是一个提示信息</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <Separator />

    <!-- HoverCard 悬浮信息卡 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        HoverCard 悬浮信息卡
      </h3>
      <HoverCard>
        <HoverCardTrigger as-child>
          <Button variant="link" class="px-0">
            查看 shadcn-vue 信息
          </Button>
        </HoverCardTrigger>
        <HoverCardContent class="w-80">
          <div class="flex flex-col gap-2">
            <h4 class="font-medium">
              shadcn-vue
            </h4>
            <p class="text-sm text-muted-foreground">
              源码式 UI 组件集合，业务侧统一从 @tauri-vue-template/ui 使用。
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>

    <Separator />

    <!-- Sheet 侧边栏 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Sheet 侧边栏
      </h3>
      <div class="flex flex-wrap gap-2">
        <Sheet v-for="item in sheetSides" :key="item.side">
          <SheetTrigger as-child>
            <Button variant="outline">
              <span :class="item.icon" data-icon="inline-start" aria-hidden="true" />
              {{ item.label }}
            </Button>
          </SheetTrigger>
          <SheetContent :side="item.side">
            <SheetHeader>
              <SheetTitle>{{ item.title }}</SheetTitle>
              <SheetDescription>
                {{ item.description }}Sheet 必须提供可访问标题和描述。
              </SheetDescription>
            </SheetHeader>
            <div class="py-4">
              <div class="text-sm text-muted-foreground p-4 border rounded-lg">
                当前方向：{{ item.side }}
              </div>
            </div>
            <SheetFooter>
              <SheetClose as-child>
                <Button variant="outline">
                  关闭
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <p class="text-sm text-muted-foreground">
        Sheet 可以从四个方向滑出，适合导航、详情和移动端操作面板。
      </p>
    </div>

    <Separator />

    <!-- Drawer 抽屉 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Drawer 底部抽屉
      </h3>
      <Drawer>
        <DrawerTrigger as-child>
          <Button variant="outline">
            打开 Drawer
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div class="mx-auto max-w-sm w-full">
            <DrawerHeader>
              <DrawerTitle>任务操作</DrawerTitle>
              <DrawerDescription>
                Drawer 适合移动端底部操作面板，必须提供可访问标题。
              </DrawerDescription>
            </DrawerHeader>
            <div class="px-4 py-2">
              <div class="text-sm text-muted-foreground p-4 border rounded-lg">
                当前选择：{{ contextMode === 'preview' ? '预览' : '编辑' }} 模式
              </div>
            </div>
            <DrawerFooter>
              <Button>保存</Button>
              <DrawerClose as-child>
                <Button variant="outline">
                  关闭
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>

    <Separator />

    <!-- Command 命令面板 -->
    <div class="flex flex-col gap-3">
      <h3 class="text-lg font-semibold">
        Command 命令面板
      </h3>
      <Button variant="outline" @click="commandOpen = !commandOpen">
        {{ commandOpen ? '关闭命令面板' : '打开命令面板' }}
      </Button>
      <div v-if="commandOpen" class="border rounded-lg">
        <Command>
          <CommandInput placeholder="搜索命令..." />
          <CommandList>
            <CommandEmpty>未找到结果</CommandEmpty>
            <CommandGroup heading="建议">
              <CommandItem v-for="cmd in commands" :key="cmd.value" :value="cmd.value">
                <span class="shrink-0" :class="cmd.icon" aria-hidden="true" />
                {{ cmd.label }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      <p class="text-sm text-muted-foreground">
        输入搜索时会过滤命令项，hover 和 focus 状态会高亮显示
      </p>
    </div>
  </div>
</template>
