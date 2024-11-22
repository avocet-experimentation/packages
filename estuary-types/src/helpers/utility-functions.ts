
export const idMap = <T extends { id: string; }>(
  records: T[]
): Record<string, T> => records.reduce((acc, el) => {
  return Object.assign(acc, { [el.id]: el });
}, {} as Record<string, T>);


export function isKeyOf<T extends Record<any, any>>(
  possibleKey: string | number | symbol,
  obj: T,
): possibleKey is keyof T {
  return (possibleKey in obj 
    && (
      typeof possibleKey !== 'symbol' && obj[possibleKey] !== undefined
      || obj.possibleKey !== undefined
    )
  );
}
