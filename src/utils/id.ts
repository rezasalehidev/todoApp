// React Native's JS engine doesn't expose crypto.getRandomValues by default,
// which breaks RFC4122 uuid libraries. For an offline-first task manager,
// strict uniqueness across devices isn't required, so a millisecond timestamp
// combined with a Math.random() suffix is more than enough and keeps the
// dependency footprint smaller.
export function createId(): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${time}-${rand}`;
}
