type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>

export function cn(...values: ClassValue[]): string {
  const classes: string[] = []

  const push = (value: ClassValue) => {
    if (!value) return
    if (Array.isArray(value)) {
      value.forEach(push)
      return
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, enabled]) => {
        if (enabled) classes.push(key)
      })
      return
    }
    classes.push(String(value))
  }

  values.forEach(push)
  return classes.join(' ')
}
