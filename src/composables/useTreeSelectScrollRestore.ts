import type { Ref } from 'vue'

export function useTreeSelectScrollRestore(
  storageKey: string,
  wrapperRef: Ref<HTMLElement | null>,
  route: { fullPath: string },
  activeIndex: Ref<number>,
  items: Ref<{ value: any }[]>,
  loadItem: (value: unknown) => Promise<void>
) {
  const key = () => `${storageKey}-${route.fullPath}`

  const save = () => {
    const el = wrapperRef.value
    if (!el) return
    const nav = el.querySelector('.van-tree-select__nav') as HTMLElement
    const content = el.querySelector('.van-tree-select__content') as HTMLElement
    if (nav || content) {
      sessionStorage.setItem(
        key(),
        JSON.stringify({
          navScrollTop: nav?.scrollTop ?? 0,
          contentScrollTop: content?.scrollTop ?? 0,
          activeIndex: activeIndex.value
        })
      )
    }
  }

  const restore = async () => {
    const raw = sessionStorage.getItem(key())
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (typeof data.activeIndex === 'number' && items.value[data.activeIndex]) {
        activeIndex.value = data.activeIndex
        await loadItem(items.value[data.activeIndex].value)
      }
      await nextTick()
      const el = wrapperRef.value
      if (el) {
        const nav = el.querySelector('.van-tree-select__nav') as HTMLElement
        const content = el.querySelector('.van-tree-select__content') as HTMLElement
        if (nav && data.navScrollTop) nav.scrollTop = data.navScrollTop
        if (content && data.contentScrollTop) content.scrollTop = data.contentScrollTop
      }
      sessionStorage.removeItem(key())
    } catch {
      sessionStorage.removeItem(key())
    }
  }

  return { save, restore }
}
