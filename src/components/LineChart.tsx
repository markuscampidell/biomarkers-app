import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { formatDateTime, formatShortDate } from '../lib/date';

export interface Point {
  t: number; // epoch ms
  v: number;
}

export interface Series {
  name: string;
  /** CSS color, ideally a var(--series-n) token. */
  color: string;
  points: Point[];
}

interface Props {
  series: Series[];
  /** Optimal band to shade. */
  band?: { min?: number; max?: number };
  /** Optimal target line. */
  target?: number;
  format?: (v: number) => string;
  height?: number;
  /** Fixed y domain (e.g. 0–100 for percentages). */
  yDomain?: [number, number];
}

const M = { top: 12, right: 14, bottom: 26, left: 40 };

function niceTicks(min: number, max: number, count = 4): number[] {
  const span = max - min || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

/** Minimal responsive line chart with an optimal band and hover crosshair. */
export function LineChart({ series, band, target, format = String, height = 200, yDomain }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(Math.max(240, el.clientWidth));
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(240, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geom = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    const times = [...new Set(all.map((p) => p.t))].sort((a, b) => a - b);
    let [t0, t1] = [times[0] ?? 0, times[times.length - 1] ?? 1];
    if (t0 === t1) {
      t0 -= 86_400_000;
      t1 += 86_400_000;
    }

    let y0: number, y1: number;
    if (yDomain) [y0, y1] = yDomain;
    else {
      const vals = all.map((p) => p.v);
      if (band?.min !== undefined) vals.push(band.min);
      if (band?.max !== undefined) vals.push(band.max);
      if (target !== undefined) vals.push(target);
      y0 = Math.min(...vals);
      y1 = Math.max(...vals);
      const pad = (y1 - y0) * 0.12 || Math.abs(y0) * 0.1 || 1;
      y0 -= pad;
      y1 += pad;
    }

    const iw = width - M.left - M.right;
    const ih = height - M.top - M.bottom;
    const x = (t: number) => M.left + ((t - t0) / (t1 - t0)) * iw;
    const y = (v: number) => M.top + ih - ((v - y0) / (y1 - y0)) * ih;
    const yTicks = niceTicks(y0, y1).filter((v) => v >= y0 && v <= y1);
    const xCount = Math.max(2, Math.min(5, Math.floor(iw / 80)));
    const xTicks = Array.from({ length: xCount }, (_, i) => t0 + ((t1 - t0) * i) / (xCount - 1));
    return { times, x, y, y0, y1, iw, ih, yTicks, xTicks };
  }, [series, band, target, width, height, yDomain]);

  const { x, y, y0, y1, ih, yTicks, xTicks, times } = geom;
  const clampY = (v: number) => y(Math.min(y1, Math.max(y0, v)));

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left;
    let best: number | null = null;
    let bestD = Infinity;
    for (const t of times) {
      const d = Math.abs(x(t) - px);
      if (d < bestD) [best, bestD] = [t, d];
    }
    setHover(best);
  };

  const hoverRows =
    hover === null
      ? []
      : series.flatMap((s) => s.points.filter((p) => p.t === hover).map((p) => ({ s, p })));
  const tipLeft = hover === null ? 0 : x(hover);

  return (
    <div className="chart" ref={wrapRef}>
      <svg width={width} height={height} role="img" aria-label={`Chart of ${series.map((s) => s.name).join(', ')}`}>
        {/* optimal band */}
        {band && (band.min !== undefined || band.max !== undefined) && (
          <rect
            className="chart-band"
            x={M.left}
            width={geom.iw}
            y={clampY(band.max ?? y1)}
            height={Math.max(0, clampY(band.min ?? y0) - clampY(band.max ?? y1))}
          />
        )}
        {/* grid + y axis */}
        {yTicks.map((v) => (
          <g key={v}>
            <line className="chart-grid" x1={M.left} x2={M.left + geom.iw} y1={y(v)} y2={y(v)} />
            <text className="chart-tick" x={M.left - 6} y={y(v)} dy="0.32em" textAnchor="end">
              {format(v)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text
            key={t}
            className="chart-tick"
            x={x(t)}
            y={M.top + ih + 18}
            textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
          >
            {formatShortDate(new Date(t))}
          </text>
        ))}
        {target !== undefined && (
          <line className="chart-target" x1={M.left} x2={M.left + geom.iw} y1={y(target)} y2={y(target)} />
        )}
        {/* series */}
        {series.map((s) => (
          <g key={s.name}>
            {s.points.length > 1 && (
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={s.points.map((p) => `${x(p.t)},${y(p.v)}`).join(' ')}
              />
            )}
            {s.points.map((p, i) => (
              <circle
                key={i}
                cx={x(p.t)}
                cy={y(p.v)}
                r={p.t === hover ? 5 : 4}
                fill={s.color}
                className="chart-dot"
              />
            ))}
          </g>
        ))}
        {hover !== null && <line className="chart-cross" x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + ih} />}
        <rect
          x={M.left}
          y={0}
          width={geom.iw}
          height={height}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover !== null && hoverRows.length > 0 && (
        <div
          className="chart-tip"
          style={{ left: tipLeft, transform: `translateX(${tipLeft > width / 2 ? 'calc(-100% - 10px)' : '10px'})` }}
        >
          <div className="muted small">{formatDateTime(new Date(hover))}</div>
          {hoverRows.map(({ s, p }) => (
            <div key={s.name} className="chart-tip-row">
              <span className="legend-dot" style={{ background: s.color }} />
              {series.length > 1 && <span className="muted">{s.name}</span>}
              <strong>{format(p.v)}</strong>
            </div>
          ))}
        </div>
      )}
      {series.length > 1 && (
        <div className="legend">
          {series.map((s) => (
            <span key={s.name}>
              <span className="legend-dot" style={{ background: s.color }} /> {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
