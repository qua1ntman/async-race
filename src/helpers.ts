export function tagGenerator(tag: string, className: string, id?: string): HTMLElement {
  const elem = document.createElement(tag);
  elem.classList.add(className);
  if (id) elem.id = id;
  return elem;
}

export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export function calculateDistance(first: HTMLElement, second: HTMLElement): number {
  return second.offsetLeft - first.offsetLeft + second.offsetWidth - 50;
}