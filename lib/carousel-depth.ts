/** Circular distance from a card's snap to the continuous track position. */
export function carouselDepth(snap: number, progress: number, count: number) {
  const difference = snap - progress;
  return Math.abs(difference - Math.round(difference)) * count;
}
