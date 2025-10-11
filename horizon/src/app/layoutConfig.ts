// app/layoutConfig.ts
export const hideLayoutPages = [
  "/"
];

export function shouldHideLayout(pathname: string) {
  return hideLayoutPages.includes(pathname);
}
