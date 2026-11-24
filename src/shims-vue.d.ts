/**
 * 让 TypeScript 认识 *.vue 导入。
 *
 * vue-tsc 走构建模式（tsconfig 里是 project references）时不会自动注入这层声明，
 * 少了它会报 TS7016: Could not find a declaration file for module './App.vue'。
 * 这里刻意不写 `{}` / `any`：直接引用 DefineComponent 的默认类型即可，
 * 既能让类型检查通过，也不会触发 @typescript-eslint 的 no-empty-object-type。
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
