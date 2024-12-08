export type BreakTime = { start: string; end: string }

export function timeToDate(time: string): Date {
  const [h, m] = time.split(':')
  const d = new Date()
  d.setHours(Number(h))
  d.setMinutes(Number(m))
  d.setSeconds(0)

  return d
}
