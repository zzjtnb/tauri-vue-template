import zzjtnb from 'eslint-config-zzjtnb'

export default zzjtnb().append({
  files: ['packages/ui/src/shadcn-vue/ui/**/*.ts'],
  rules: {
    // ui 由 shadcn-vue CLI 生成，模板内的 Symbol() 写法不作为仓库手写源码风格门禁。
    'symbol-description': 'off',
  },
})
