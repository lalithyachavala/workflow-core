export function computeTotalSeconds(clockInAt: Date, clockOutAt: Date) {
  return Math.max(0, Math.floor((clockOutAt.getTime() - clockInAt.getTime()) / 1000));
}
