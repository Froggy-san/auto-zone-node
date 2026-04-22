export function getParam(
  searchParams: URLSearchParams,
  key: string,
  defaultValue: any = undefined
): string {
  return searchParams.get(key) || defaultValue
}
