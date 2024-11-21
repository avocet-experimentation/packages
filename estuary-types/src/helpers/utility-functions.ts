
export const idMap = <T extends { id: string; }>(
  records: T[]
): Record<string, T> => records.reduce((acc, el) => {
  return Object.assign(acc, { [el.id]: el });
}, {} as Record<string, T>);
