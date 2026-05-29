'use client';

import { useEffect, useRef, useState } from 'react';

const MODEL_PATH = '/models/pbr/crewneck.gltf';
const UV_SIZE = 2048;

const COLORS = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#44ff88'];

function drawUVWire(ctx: CanvasRenderingContext2D, uv: THREE.BufferAttribute, idx: THREE.BufferAttribute | null, color: string, size: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.9;
  const x = (u: number) => u * size;
  const y = (v: number) => (1 - v) * size;
  if (idx) {
    for (let i = 0; i < idx.count; i += 3) {
      const a = idx.getX(i),
        b = idx.getX(i + 1),
        c = idx.getX(i + 2);
      ctx.beginPath();
      ctx.moveTo(x(uv.getX(a)), y(uv.getY(a)));
      ctx.lineTo(x(uv.getX(b)), y(uv.getY(b)));
      ctx.lineTo(x(uv.getX(c)), y(uv.getY(c)));
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace THREE {
  class Mesh {
    geometry: BufferGeometry;
    name: string;
  }
  class BufferGeometry {
    attributes: Record<string, BufferAttribute>;
    index: BufferAttribute | null;
  }
  class BufferAttribute {
    count: number;
    getX(i: number): number;
    getY(i: number): number;
  }
}

function UVSection() {
  const canvas0Ref = useRef<HTMLCanvasElement>(null);
  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('Loading...');
  const [legend, setLegend] = useState<{ name: string; color: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

      new GLTFLoader().load(MODEL_PATH, (gltf) => {
        if (cancelled) return;

        // ── UV0 / UV1 wire канваси ──────────────────────────────────────
        const c0 = canvas0Ref.current;
        const c1 = canvas1Ref.current;
        if (c0 && c1) {
          c0.width = c1.width = UV_SIZE;
          c0.height = c1.height = UV_SIZE;
          const ctx0 = c0.getContext('2d')!;
          const ctx1 = c1.getContext('2d')!;
          for (const ctx of [ctx0, ctx1]) {
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, UV_SIZE, UV_SIZE);
          }
          let ci = 0;
          const items: { name: string; color: string }[] = [];
          gltf.scene.traverse((obj: unknown) => {
            if (!(obj instanceof THREE.Mesh)) return;
            const geo = obj.geometry;
            const uv0 = geo.attributes['uv'] as THREE.BufferAttribute | undefined;
            const uv1 = geo.attributes['uv1'] as THREE.BufferAttribute | undefined;
            const idx = geo.index;
            const color = COLORS[ci % COLORS.length];
            ci++;
            items.push({ name: obj.name, color });
            if (uv0) drawUVWire(ctx0, uv0, idx, color, UV_SIZE);
            if (uv1) drawUVWire(ctx1, uv1, idx, color, UV_SIZE);
          });
          setLegend(items);
        }

        setStatus('Done');
      });
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const ws = (w: number): React.CSSProperties => ({
    display: 'block',
    width: w,
    height: w,
    border: '1px solid #333',
  });

  return (
    <section>
      <h2 style={{ fontSize: 16, marginBottom: 8, color: '#ffd' }}>UV Channels — crewneck.gltf</h2>
      <p style={{ color: '#aaa', fontSize: 12, marginBottom: 10 }}>{status}</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {legend.map(({ name, color }) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 11,
                height: 11,
                background: color,
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 12 }}>{name}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <p style={{ marginBottom: 5, fontSize: 12, color: '#aaa' }}>UV0 — TEXCOORD_0</p>
          <canvas ref={canvas0Ref} style={ws(640)} />
        </div>
        <div>
          <p style={{ marginBottom: 5, fontSize: 12, color: '#aaa' }}>UV1 — TEXCOORD_1</p>
          <canvas ref={canvas1Ref} style={ws(640)} />
        </div>
      </div>
    </section>
  );
}

// ── Texture Inspector ─────────────────────────────────────────────────────────
const TEXTURES = [
  {
    url: '/models/pbr/bake_ao-bake_roughness.jpg',
    label: 'bake_ao-bake_roughness',
  },
  { url: '/models/pbr/bake_normal.jpg', label: 'bake_normal' },
  {
    url: '/models/pbr/cotton_jersey_nor_gl.jpg',
    label: 'cotton_jersey_nor_gl',
  },
  { url: '/models/pbr/cotton_jersey_rough.jpg', label: 'cotton_jersey_rough' },
  { url: '/models/pbr/inside_ao.jpg', label: 'inside_ao' },
];

function TexChannels({ url, label }: { url: string; label: string }) {
  const refR = useRef<HTMLCanvasElement>(null);
  const refG = useRef<HTMLCanvasElement>(null);
  const refB = useRef<HTMLCanvasElement>(null);
  const refFull = useRef<HTMLCanvasElement>(null);
  const [info, setInfo] = useState('');

  useEffect(() => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width = img.width;
      off.height = img.height;
      const c = off.getContext('2d')!;
      c.drawImage(img, 0, 0);
      const data = c.getImageData(0, 0, img.width, img.height).data;
      let sR = 0,
        sG = 0,
        sB = 0;
      for (let i = 0; i < data.length; i += 4) {
        sR += data[i];
        sG += data[i + 1];
        sB += data[i + 2];
      }
      const n = data.length / 4;
      setInfo(`${img.width}×${img.height}  R:${(sR / n).toFixed(1)}  G:${(sG / n).toFixed(1)}  B:${(sB / n).toFixed(1)}`);
      const S = 256;
      const channelDefs: { ref: typeof refR; ch: number }[] = [
        { ref: refR, ch: 0 },
        { ref: refG, ch: 1 },
        { ref: refB, ch: 2 },
        { ref: refFull, ch: -1 },
      ];
      for (const { ref, ch } of channelDefs) {
        if (!ref.current) continue;
        ref.current.width = ref.current.height = S;
        const ctx2 = ref.current.getContext('2d')!;
        const id = ctx2.createImageData(S, S);
        for (let y = 0; y < S; y++)
          for (let x = 0; x < S; x++) {
            const sx = Math.floor((x * img.width) / S);
            const sy = Math.floor((y * img.height) / S);
            const si = (sy * img.width + sx) * 4;
            const di = (y * S + x) * 4;
            if (ch === -1) {
              id.data[di] = data[si];
              id.data[di + 1] = data[si + 1];
              id.data[di + 2] = data[si + 2];
            } else {
              id.data[di] = id.data[di + 1] = id.data[di + 2] = data[si + ch];
            }
            id.data[di + 3] = 255;
          }
        ctx2.putImageData(id, 0, 0);
      }
    };
  }, [url]);

  const cs: React.CSSProperties = {
    width: 256,
    height: 256,
    display: 'block',
    border: '1px solid #333',
  };
  const panels: { label: string; color: string; ref: typeof refR }[] = [
    { label: 'R channel', color: '#f88', ref: refR },
    { label: 'G channel', color: '#8f8', ref: refG },
    { label: 'B channel', color: '#88f', ref: refB },
    { label: 'Full', color: '#aaa', ref: refFull },
  ];

  return (
    <div
      style={{
        background: '#161616',
        borderRadius: 8,
        padding: 14,
        marginBottom: 20,
      }}
    >
      <strong style={{ fontSize: 14, color: '#ffd' }}>{label}</strong>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 10, marginTop: 2 }}>{info}</div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {panels.map(({ label: lbl, color, ref }) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color, marginBottom: 4 }}>{lbl}</div>
            <canvas ref={ref} style={cs} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Tab = 'uv' | 'tex';

export default function DebugPage() {
  const [tab, setTab] = useState<Tab>('uv');
  const btn = (t: Tab, label: string) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '6px 18px',
        fontSize: 13,
        cursor: 'pointer',
        borderRadius: 4,
        border: '1px solid #444',
        background: tab === t ? '#ffd' : '#222',
        color: tab === t ? '#000' : '#ccc',
      }}
    >
      {label}
    </button>
  );
  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: 20,
        color: '#fff',
        fontFamily: 'monospace',
      }}
    >
      <h1 style={{ fontSize: 18, marginBottom: 16 }}>3D Debug Tools</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {btn('uv', 'UV Channels')}
        {btn('tex', 'Texture Inspector')}
      </div>
      {tab === 'uv' && <UVSection />}
      {tab === 'tex' && (
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 14, color: '#ffd' }}>Texture Channel Inspector</h2>
          {TEXTURES.map((t) => (
            <TexChannels key={t.url} {...t} />
          ))}
        </section>
      )}
    </div>
  );
}
