import type { SuicaDiagramId } from "@/data/suica-guides";

/*
 * Plain SVG diagrams for the Suica guides: few words, large, so they read as
 * a thumbnail in the grid and as the lead picture on each guide page. Generic
 * IC-card and machine shapes only (no operator logos or mascots).
 */
const INK = "#0b1220";
const BLUE = "#145aa0";
const SKY = "#e8f2fc";
const RED = "#d94a32";
const GREEN = "#1f9d6b";
const MUTED = "#64748b";
const LINE = "#d6e0ec";

const W = 480;
const H = 360;

function Txt({ x, y, size = 22, weight = 700, fill = INK, anchor = "middle", children }: { x: number; y: number; size?: number; weight?: number; fill?: string; anchor?: "start" | "middle" | "end"; children: React.ReactNode }) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor} fontFamily="Inter, system-ui, sans-serif">
      {children}
    </text>
  );
}

function IcCard({ x, y, w = 120, color = BLUE, label = "IC" }: { x: number; y: number; w?: number; color?: string; label?: string }) {
  const h = w * 0.63;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={w * 0.08} fill={color} />
      <rect x={w * 0.1} y={h * 0.22} width={w * 0.2} height={h * 0.26} rx={3} fill="#f5d77a" />
      <path d={`M${w * 0.62} ${h * 0.3} q${w * 0.08} ${h * 0.2} 0 ${h * 0.4} M${w * 0.72} ${h * 0.2} q${w * 0.12} ${h * 0.3} 0 ${h * 0.6}`} stroke="#fff" strokeWidth={w * 0.03} fill="none" strokeLinecap="round" opacity={0.85} />
      <text x={w * 0.1} y={h * 0.86} fontSize={w * 0.14} fontWeight={800} fill="#fff" fontFamily="Inter, system-ui, sans-serif">
        {label}
      </text>
    </g>
  );
}

function Machine({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect width={110} height={150} rx={12} fill="#f1f4f8" stroke={INK} strokeWidth={3} />
      <rect x={14} y={16} width={82} height={58} rx={6} fill={BLUE} />
      <rect x={22} y={26} width={30} height={16} rx={3} fill="#fff" opacity={0.9} />
      <rect x={58} y={26} width={30} height={16} rx={3} fill="#fff" opacity={0.9} />
      <rect x={22} y={48} width={66} height={16} rx={3} fill="#fff" opacity={0.6} />
      <rect x={18} y={88} width={34} height={8} rx={4} fill={INK} />
      <rect x={60} y={88} width={32} height={22} rx={4} fill="none" stroke={INK} strokeWidth={2.5} />
      <rect x={30} y={122} width={50} height={10} rx={5} fill={INK} opacity={0.75} />
    </g>
  );
}

function Badge({ x, y, ok }: { x: number; y: number; ok: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={17} fill={ok ? GREEN : RED} />
      {ok ? (
        <path d="M-8 0 l5 6 l11 -12" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M-7 -7 l14 14 M7 -7 l-14 14" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      )}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = MUTED }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x2 - 12 * Math.cos(a - 0.45);
  const hy = y2 - 12 * Math.sin(a - 0.45);
  const kx = x2 - 12 * Math.cos(a + 0.45);
  const ky = y2 - 12 * Math.sin(a + 0.45);
  return (
    <g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={`M${hx} ${hy} L${x2} ${y2} L${kx} ${ky}`} strokeLinejoin="round" />
    </g>
  );
}

function YenNote({ x, y, w = 120 }: { x: number; y: number; w?: number }) {
  const h = w * 0.5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={6} fill="#e9f3e4" stroke="#5f8f4e" strokeWidth={3} />
      <circle cx={w / 2} cy={h / 2} r={h * 0.3} fill="none" stroke="#5f8f4e" strokeWidth={3} />
      <text x={w / 2} y={h / 2 + h * 0.13} fontSize={h * 0.36} fontWeight={800} fill="#3f6b31" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
        ¥
      </text>
    </g>
  );
}

function Where() {
  return (
    <>
      <g transform="translate(46 70)">
        <path d="M0 22 L70 6 L84 -10 Q92 -16 94 -6 L86 10 L118 18 L118 28 L80 26 L66 52 L54 52 L60 26 L20 32 L12 42 L4 42 L8 28 Z" fill={MUTED} />
      </g>
      <Txt x={100} y={160} size={20} fill={MUTED}>Airport</Txt>
      <Arrow x1={150} y1={110} x2={186} y2={110} />
      <Machine x={196} y={36} s={0.95} />
      <Txt x={248} y={200} size={18}>Ticket machine</Txt>
      <g transform="translate(338 52)">
        <rect width={84} height={120} rx={10} fill="#fff" stroke={INK} strokeWidth={3} />
        <rect x={10} y={10} width={64} height={40} rx={5} fill={SKY} />
        <circle cx={42} cy={78} r={16} fill={BLUE} />
        <rect x={20} y={98} width={44} height={10} rx={5} fill={BLUE} />
      </g>
      <Txt x={380} y={200} size={18}>Ticket office</Txt>
      <line x1={40} y1={236} x2={440} y2={236} stroke={LINE} strokeWidth={2} strokeDasharray="6 8" />
      <g transform="translate(150 256)">
        <rect width={46} height={84} rx={9} fill={INK} />
        <rect x={5} y={10} width={36} height={60} rx={4} fill="#fff" />
        <IcCard x={10} y={26} w={26} />
      </g>
      <Txt x={214} y={292} size={22} anchor="start">
        or add it in
      </Txt>
      <Txt x={214} y={320} size={22} anchor="start" fill={BLUE}>
        Apple Wallet
      </Txt>
    </>
  );
}

function Steps() {
  const steps = ["Language", "New Suica", "Card type", "Cash ¥", "Amount", "Take card"];
  return (
    <>
      {steps.map((label, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 30 + col * 150;
        const y = 40 + row * 160;
        return (
          <g key={label}>
            <rect x={x} y={y} width={124} height={110} rx={16} fill={i === 3 ? "#fff6e0" : SKY} stroke={i === 3 ? "#d9a520" : BLUE} strokeWidth={2.5} />
            <circle cx={x + 30} cy={y + 32} r={18} fill={BLUE} />
            <Txt x={x + 30} y={y + 40} size={20} fill="#fff">
              {i + 1}
            </Txt>
            <Txt x={x + 62} y={y + 86} size={19}>
              {label}
            </Txt>
            {col < 2 ? <Arrow x1={x + 128} y1={y + 55} x2={x + 146} y2={y + 55} /> : null}
          </g>
        );
      })}
      <path d="M422 150 Q 440 175 240 182 Q 46 188 60 196" stroke={MUTED} strokeWidth={3} fill="none" strokeDasharray="5 7" />
    </>
  );
}

function Bring() {
  const rows: { ok: boolean; label: string; icon: React.ReactNode }[] = [
    { ok: true, label: "Cash in yen", icon: <YenNote x={0} y={0} w={86} /> },
    { ok: false, label: "Foreign credit card", icon: <g><rect width={86} height={54} rx={8} fill={MUTED} /><rect y={12} width={86} height={10} fill={INK} opacity={0.6} /></g> },
    { ok: false, label: "No passport needed", icon: <g><rect x={18} width={50} height={64} rx={6} fill="#8a2d3b" /><circle cx={43} cy={28} r={11} fill="none" stroke="#e8c770" strokeWidth={3} /></g> },
    { ok: true, label: "An amount in mind", icon: <g><rect width={86} height={54} rx={10} fill={SKY} stroke={BLUE} strokeWidth={2.5} /><text x={43} y={36} fontSize={20} fontWeight={800} fill={BLUE} textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">¥3,000</text></g> },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <g key={r.label} transform={`translate(40 ${24 + i * 84})`}>
          <g transform="translate(0 6)">{r.icon}</g>
          <Txt x={120} y={44} size={24} anchor="start">
            {r.label}
          </Txt>
          <Badge x={410} y={36} ok={r.ok} />
        </g>
      ))}
    </>
  );
}

function Compare() {
  const col = (x: number, color: string, name: string, rows: [string, string][]) => (
    <g transform={`translate(${x} 20)`}>
      <IcCard x={45} y={0} w={120} color={color} />
      <Txt x={105} y={110} size={22}>
        {name}
      </Txt>
      {rows.map(([k, v], i) => (
        <g key={k} transform={`translate(0 ${132 + i * 66})`}>
          <rect width={210} height={56} rx={12} fill={i % 2 ? "#fff" : SKY} stroke={LINE} />
          <Txt x={14} y={23} size={15} weight={600} fill={MUTED} anchor="start">
            {k}
          </Txt>
          <Txt x={14} y={46} size={20} anchor="start">
            {v}
          </Txt>
        </g>
      ))}
    </g>
  );
  return (
    <>
      {col(22, BLUE, "Suica", [["Deposit", "¥500, refundable"], ["Lasts", "No expiry"], ["Refund", "Yes (small fee)"]])}
      {col(248, RED, "Welcome Suica", [["Deposit", "None"], ["Lasts", "28 days"], ["Refund", "No"]])}
    </>
  );
}

function Amount() {
  const segs = [
    { w: 120, color: BLUE, label: "Trains" },
    { w: 90, color: "#3d86c6", label: "Subway" },
    { w: 80, color: "#6aa6d8", label: "Bus" },
    { w: 90, color: "#f0a33a", label: "Shops" },
  ];
  let x = 50;
  return (
    <>
      <Txt x={240} y={70} size={40} weight={800} fill={BLUE}>
        ¥2,000–3,000
      </Txt>
      <Txt x={240} y={104} size={20} weight={600} fill={MUTED}>
        to start
      </Txt>
      {segs.map((s) => {
        const sx = x;
        x += s.w;
        return (
          <g key={s.label}>
            <rect x={sx} y={140} width={s.w - 4} height={56} rx={10} fill={s.color} />
            <Txt x={sx + (s.w - 4) / 2} y={230} size={19}>
              {s.label}
            </Txt>
          </g>
        );
      })}
      <g transform="translate(150 262)">
        <rect width={180} height={60} rx={30} fill={SKY} stroke={BLUE} strokeWidth={2.5} />
        <path d="M40 40 v-20 m-9 9 l9 -9 l9 9" stroke={BLUE} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Txt x={108} y={38} size={20} fill={BLUE}>
          Top up
        </Txt>
      </g>
    </>
  );
}

function Topup() {
  return (
    <>
      <Machine x={34} y={24} s={0.78} />
      <Txt x={77} y={172} size={18}>Ticket machine</Txt>
      <g transform="translate(186 24)">
        <rect width={86} height={117} rx={10} fill="#fff4e3" stroke={INK} strokeWidth={3} />
        <rect x={12} y={14} width={62} height={40} rx={5} fill="#e08a1e" />
        <Txt x={43} y={92} size={18} fill={INK}>¥ +</Txt>
      </g>
      <Txt x={229} y={172} size={18}>Fare adjustment</Txt>
      <g transform="translate(336 40)">
        <rect width={110} height={100} rx={8} fill="#fff" stroke={INK} strokeWidth={3} />
        <rect width={110} height={26} rx={8} fill={GREEN} />
        <rect x={14} y={44} width={34} height={44} rx={4} fill={SKY} />
        <rect x={60} y={44} width={36} height={56} fill={LINE} />
      </g>
      <Txt x={391} y={172} size={18}>Convenience store</Txt>
      <g transform="translate(30 214)">
        {["Charge", "Place card", "Add ¥1,000+"].map((label, i) => (
          <g key={label} transform={`translate(${i * 145} 0)`}>
            <rect width={122} height={80} rx={14} fill={i === 0 ? BLUE : SKY} stroke={BLUE} strokeWidth={2.5} />
            <Txt x={61} y={47} size={17} fill={i === 0 ? "#fff" : INK}>
              {label}
            </Txt>
            {i < 2 ? <Arrow x1={126} y1={40} x2={142} y2={40} /> : null}
          </g>
        ))}
      </g>
    </>
  );
}

function Mistakes() {
  const rows = ["Credit card in a cash-only slot", "Paper ticket instead of Suica", "Loading too much before you fly", "Tapping too fast at the gate"];
  return (
    <>
      {rows.map((label, i) => (
        <g key={label} transform={`translate(28 ${26 + i * 82})`}>
          <rect width={424} height={66} rx={14} fill={i % 2 ? "#fff" : "#fdf1ee"} stroke="#f2c9bf" />
          <Badge x={36} y={33} ok={false} />
          <Txt x={70} y={41} size={21} anchor="start">
            {label}
          </Txt>
        </g>
      ))}
    </>
  );
}

function Ride() {
  return (
    <>
      <g transform="translate(40 40)">
        <rect width={40} height={150} rx={6} fill="#cfd8e3" />
        <rect x={40} y={60} width={60} height={14} rx={5} fill={INK} opacity={0.85} />
        <rect x={6} y={20} width={28} height={22} rx={5} fill={BLUE} />
        <IcCard x={-6} y={-30} w={56} />
      </g>
      <Txt x={90} y={228} size={21}>Train gates</Txt>
      <g transform="translate(184 64)">
        <rect width={120} height={86} rx={16} fill="#f0a33a" />
        <rect x={10} y={14} width={30} height={26} rx={4} fill="#fff" />
        <rect x={46} y={14} width={30} height={26} rx={4} fill="#fff" />
        <rect x={82} y={14} width={30} height={26} rx={4} fill="#fff" />
        <circle cx={28} cy={88} r={12} fill={INK} />
        <circle cx={94} cy={88} r={12} fill={INK} />
      </g>
      <Txt x={244} y={228} size={21}>Buses</Txt>
      <g transform="translate(340 60)">
        <rect width={104} height={96} rx={8} fill="#fff" stroke={INK} strokeWidth={3} />
        <rect width={104} height={24} rx={8} fill={GREEN} />
        <rect x={18} y={42} width={68} height={40} rx={6} fill={SKY} />
        <Txt x={52} y={69} size={18} fill={BLUE}>Pay</Txt>
      </g>
      <Txt x={392} y={228} size={21}>Shops</Txt>
      <g transform="translate(70 264)">
        <rect width={340} height={64} rx={32} fill={SKY} />
        <IcCard x={20} y={12} w={64} />
        <Txt x={206} y={41} size={22} fill={BLUE}>
          One card, just tap
        </Txt>
      </g>
    </>
  );
}

const DIAGRAMS: Record<SuicaDiagramId, () => React.ReactElement> = {
  where: Where,
  steps: Steps,
  bring: Bring,
  compare: Compare,
  amount: Amount,
  topup: Topup,
  mistakes: Mistakes,
  ride: Ride,
};

export function SuicaDiagram({ id, title, className }: { id: SuicaDiagramId; title: string; className?: string }) {
  const Body = DIAGRAMS[id];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} className={className}>
      <rect width={W} height={H} fill="#f6f9fc" />
      <Body />
    </svg>
  );
}
