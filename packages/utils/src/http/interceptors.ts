import type { HttpInterceptorManager as HttpInterceptorManagerContract, HttpInterceptors } from './types.ts'

/**
 * 管理同一类型 HTTP 拦截器的轻量容器。
 *
 * 这个类刻意只负责“注册、移除、列出”三件事，不参与请求执行，
 * 因为真正的执行顺序、错误恢复和 retry 语义都属于 {@link HttpClient} 的职责。
 *
 * @template THandler 拦截器函数类型，例如请求拦截器、响应拦截器或错误拦截器。
 * @public
 */
export class HttpInterceptorManager<THandler> implements HttpInterceptorManagerContract<THandler> {
  /**
   * 使用 Map 保持插入顺序，确保拦截器按注册顺序执行。
   * key 是稳定的数字 id，value 是调用方注册的 handler。
   */
  private handlers = new Map<number, THandler>()

  /**
   * 单调递增的拦截器 id。
   *
   * 不复用已移除 id，可以避免调用方保存旧 id 时误删后续新注册的拦截器。
   */
  private uid = 0

  /**
   * 注册一个拦截器。
   *
   * @param handler - 要注册的拦截器函数。
   * @returns 拦截器 id，可传给 {@link eject} 移除该拦截器。
   * @example
   * ```ts
   * const id = client.interceptors.request.use((config) => config)
   * client.interceptors.request.eject(id)
   * ```
   */
  use(handler: THandler): number {
    const id = this.uid
    this.uid += 1
    this.handlers.set(id, handler)
    return id
  }

  /**
   * 移除指定拦截器。
   *
   * @param id - {@link use} 返回的拦截器 id。
   * @returns `true` 表示成功移除；`false` 表示 id 不存在或已被移除。
   */
  eject(id: number): boolean {
    return this.handlers.delete(id)
  }

  /**
   * 清空当前管理器下的全部拦截器。
   *
   * 通常用于测试 teardown、登出后重建请求环境，或销毁某个临时客户端实例。
   */
  clear(): void {
    this.handlers.clear()
  }

  /**
   * 返回当前拦截器列表快照。
   *
   * 返回快照是关键设计：如果请求执行过程中有代码注册或移除拦截器，
   * 当前请求链不会被中途改变，只有后续新请求会看到新的拦截器列表。
   *
   * @returns 按注册顺序排列的拦截器数组。
   */
  list(): THandler[] {
    return [...this.handlers.values()]
  }
}

/**
 * 创建一组互相独立的 HTTP 拦截器管理器。
 *
 * @returns 包含 request、response、error 三类管理器的对象。
 * @public
 */
export function createHttpInterceptors(): HttpInterceptors {
  return {
    request: new HttpInterceptorManager(),
    response: new HttpInterceptorManager(),
    error: new HttpInterceptorManager(),
  }
}
