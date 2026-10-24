// Keep the manual reference independent from the detector output.
export function compareCounts(app, manual) {
  const valid = n => Number.isSafeInteger(n) && n >= 0;
  app = valid(app) ? app : null;
  manual = valid(manual) ? manual : null;
  const difference = app !== null && manual !== null ? app - manual : null;
  return { app, manual, difference, percent: difference !== null && manual > 0 ? difference / manual * 100 : null };
}
