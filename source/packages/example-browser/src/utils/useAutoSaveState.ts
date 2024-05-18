export interface AppPageState {
  filter?: string
  category?: string
  title?: string
}

export function useAutoSaveState() {
  function save(state: AppPageState) {
    let hash = `${state.category}\t${state.title}`
    if (state.filter) {
      hash += `\t${state.filter}`
    }
    window.location.hash = encodeURIComponent(hash)
  }

  function load(): AppPageState | undefined {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      return undefined
    }
    const [category, title, filter] = decodeURIComponent(hash).split('\t')
    return { category, title, filter }
  }

  return {
    save,
    load,
  }
}
