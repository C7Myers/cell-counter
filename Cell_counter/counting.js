export function mapPoint(c, u, v) { return { x: (1 - v) * ((1 - u) * c[0].x + u * c[1].x) + v * ((1 - u) * c[3].x + u * c[2].x), y: (1 - v) * ((1 - u) * c[0].y + u * c[1].y) + v * ((1 - u) * c[3].y + u * c[2].y) }; }
export function inverse(c, x, y) { let u = .5, v = .5; for (let i = 0; i < 10; i++) {
    const p = mapPoint(c, u, v), du = { x: (1 - v) * (c[1].x - c[0].x) + v * (c[2].x - c[3].x), y: (1 - v) * (c[1].y - c[0].y) + v * (c[2].y - c[3].y) }, dv = { x: (1 - u) * (c[3].x - c[0].x) + u * (c[2].x - c[1].x), y: (1 - u) * (c[3].y - c[0].y) + u * (c[2].y - c[1].y) }, det = du.x * dv.y - du.y * dv.x;
    if (Math.abs(det) < 1e-8)
        break;
    const ex = x - p.x, ey = y - p.y;
    u += (ex * dv.y - ey * dv.x) / det;
    v += (ey * du.x - ex * du.y) / det;
} return { x: u, y: v }; }
export function square(d) { return Math.min(2, Math.floor(d.y * 3)) * 3 + Math.min(2, Math.floor(d.x * 3)); }
export function selected(d, mode) { return d.x >= 0 && d.x < 1 && d.y >= 0 && d.y < 1 && (mode === 'whole' || [0, 2, 6, 8].includes(square(d))); }
export function concentration(count, mode, dilution) { return count / (mode === 'whole' ? 9 : 4) * dilution * 10000; }
export function detect(source, c, radius, sensitivity) {
    const n = 900, a = new Float32Array(n * n), sum = new Float64Array((n + 1) * (n + 1));
    for (let y = 0; y < n; y++) {
        let row = 0;
        for (let x = 0; x < n; x++) {
            const p = mapPoint(c, x / n, y / n), sx = Math.max(0, Math.min(source.width - 1, Math.round(p.x))), sy = Math.max(0, Math.min(source.height - 1, Math.round(p.y))), i = (sy * source.width + sx) * 4;
            const g = .299 * source.data[i] + .587 * source.data[i + 1] + .114 * source.data[i + 2];
            a[y * n + x] = g;
            row += g;
            sum[(y + 1) * (n + 1) + x + 1] = sum[y * (n + 1) + x + 1] + row;
        }
    }
    const avg = (x, y, r) => { let x0 = Math.max(0, x - r), x1 = Math.min(n, x + r + 1), y0 = Math.max(0, y - r), y1 = Math.min(n, y + r + 1); return (sum[y1 * (n + 1) + x1] - sum[y0 * (n + 1) + x1] - sum[y1 * (n + 1) + x0] + sum[y0 * (n + 1) + x0]) / ((x1 - x0) * (y1 - y0)); };
    const rect = (x0, y0, x1, y1) => { x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(n, x1); y1 = Math.min(n, y1); return (sum[y1 * (n + 1) + x1] - sum[y0 * (n + 1) + x1] - sum[y1 * (n + 1) + x0] + sum[y0 * (n + 1) + x0]) / ((x1 - x0) * (y1 - y0)); };
    const r = Math.round(radius), inner = Math.max(1, Math.round(r * .35)), score = new Float32Array(n * n), threshold = 2 + (100 - sensitivity) * .13;
    for (let y = r + 1; y < n - r - 1; y++)
        for (let x = r + 1; x < n - r - 1; x++) {
            const center = avg(x, y, inner), outer = avg(x, y, r + 2), s = center - outer;
            if (s > threshold && center - Math.max(rect(x - r - 3, y - 1, x + r + 4, y + 2), rect(x - 1, y - r - 3, x + 2, y + r + 4)) > threshold * .65) {
                const contrasts = [avg(x - r, y, 1), avg(x + r, y, 1), avg(x, y - r, 1), avg(x, y + r, 1)].map(z => center - z);
                if (contrasts.filter(z => z > threshold * .35).length >= 3)
                    score[y * n + x] = s;
            }
        }
    const candidates = [];
    for (let y = r + 1; y < n - r - 1; y++)
        for (let x = r + 1; x < n - r - 1; x++) {
            const s = score[y * n + x];
            if (s <= 0)
                continue;
            let peak = true;
            for (let dy = -2; dy <= 2 && peak; dy++)
                for (let dx = -2; dx <= 2; dx++)
                    if (score[(y + dy) * n + x + dx] > s) {
                        peak = false;
                        break;
                    }
            if (peak)
                candidates.push({ x, y, s });
        }
    candidates.sort((a, b) => b.s - a.s);
    const out = [];
    for (const q of candidates) {
        if (out.length >= 3000)
            break;
        if (out.some(d => Math.hypot(d.x * n - q.x, d.y * n - q.y) < r * 1.65))
            continue;
        out.push({ id: crypto.randomUUID(), x: q.x / n, y: q.y / n, score: q.s, review: q.s < threshold * 1.65, origin: 'auto' });
    }
    return out;
}
