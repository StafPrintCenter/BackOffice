import { useId, type CSSProperties } from "react";
import { DC_CENTER, DC_MONOGRAM_TRANSFORM, DC_TEXT, MC_CENTERLINE, MC_NIB, MC_PEN, MC_SP } from "./Paths";

export const LOGO_LOADER_DEFAULT_TEXT = "Chargement…";
export type LogoLoaderVariant = "mc" | "dc";

export interface LogoLoaderProps {
  variant?: LogoLoaderVariant;
  size?: number | string;
  animated?: boolean;
  loop?: boolean;
  duration?: number;
  showText?: boolean;
  text?: string;
  fullScreen?: boolean;
  shadow?: boolean;
  inkColor?: string;
  nibColor?: string;
  centerColor?: string;
  className?: string;
  textClassName?: string;
}

/* ------------------------------------------------------------------ chronologie (s, sur un cycle de 6 s) */
type Span = [number, number];
const CYCLE = 6;
const TIMELINE = {
  mc: { sp: [0.15, 2.6], pen: [1.85, 3.0], nib: [2.7, 3.3] },
  dc: { sp: [0.15, 2.2], pen: [1.5, 2.5], nib: [2.2, 2.75], text: [2.35, 3.3], center: [2.95, 3.6] },
} as const;
const BUMP: Span = [3.1, 4.0];
const SHEEN: Span = [3.2, 4.0];
const FADE: Span = [5.2, 5.8];

const pct = (s: number) => `${+((s / CYCLE) * 100).toFixed(3)}%`;
const draw = (name: string, [a, b]: Span) =>
  `@keyframes ${name}{0%,${pct(a)}{stroke-dashoffset:1;animation-timing-function:cubic-bezier(.5,0,.25,1)}${pct(b)},100%{stroke-dashoffset:0}}`;
/** Tracé principal : masque fin pendant l'écriture (évite de révéler trop tôt le croisement), puis élargi
 *  juste après la fin pour garantir qu'aucun bord du S/P ne reste coupé. */
const drawMain = (name: string, [a, b]: Span) =>
  `@keyframes ${name}{0%,${pct(a)}{stroke-dashoffset:1;stroke-width:54;animation-timing-function:cubic-bezier(.5,0,.25,1)}` +
  `${pct(b)}{stroke-dashoffset:0;stroke-width:54;animation-timing-function:ease-out}${pct(b + 0.3)},100%{stroke-dashoffset:0;stroke-width:120}}`;
const move = (name: string, [a, b]: Span, from: string) =>
  `@keyframes ${name}{0%,${pct(a)}{transform:${from};animation-timing-function:cubic-bezier(.2,.7,.2,1)}${pct(b)},100%{transform:translate(0,0)}}`;

function buildCss(variant: LogoLoaderVariant, loop: boolean, sheenTravel: number) {
  const t = TIMELINE[variant];
  const v = variant;
  let css =
    `.spc-a{animation-duration:var(--spc-d);animation-iteration-count:var(--spc-n);animation-fill-mode:both;animation-timing-function:linear}` +
    `.spc-bump{transform-box:fill-box;transform-origin:center}` +
    `.spc-sp{animation-name:spc-sp-${v}}.spc-pen{animation-name:spc-pen-${v}}.spc-nib{animation-name:spc-nib-${v}}` +
    `.spc-nibmove{animation-name:spc-nibmove-${v}}` +
    `.spc-bump{animation-name:spc-bump-${v}}.spc-sheen{animation-name:spc-sheen-${v}}.spc-fade{animation-name:spc-fade-${v}}` +
    `@media (prefers-reduced-motion:reduce){.spc-a{animation:none!important}}`;
  css += drawMain(`spc-sp-${v}`, t.sp as Span) + draw(`spc-pen-${v}`, t.pen as Span) + draw(`spc-nib-${v}`, t.nib as Span);
  css += move(`spc-nibmove-${v}`, t.nib as Span, "translate(5.9px,-12.7px)");
  css +=
    `@keyframes spc-bump-${v}{0%{transform:scale(.95);animation-timing-function:cubic-bezier(.2,.7,.2,1)}` +
    `${pct(BUMP[0])}{transform:scale(1);animation-timing-function:ease-in-out}${pct((BUMP[0] + BUMP[1]) / 2)}{transform:scale(1.01);animation-timing-function:ease-in-out}` +
    `${pct(BUMP[1])},100%{transform:scale(1)}}`;
  css += `@keyframes spc-sheen-${v}{0%,${pct(SHEEN[0])}{transform:translateX(0);animation-timing-function:ease-in-out}${pct(SHEEN[1])},100%{transform:translateX(${sheenTravel}px)}}`;
  css += loop
    ? `@keyframes spc-fade-${v}{0%,${pct(FADE[0])}{opacity:1}${pct(FADE[1])},100%{opacity:0}}`
    : `@keyframes spc-fade-${v}{0%,100%{opacity:1}}`;
  if (v === "dc") {
    const d = TIMELINE.dc;
    css +=
      `.spc-twipe{animation-name:spc-twipe}.spc-tmove{animation-name:spc-tmove}.spc-cwipe{animation-name:spc-cwipe}.spc-cmove{animation-name:spc-cmove}` +
      `@keyframes spc-twipe{0%,${pct(d.text[0])}{transform:translateX(-800px);animation-timing-function:cubic-bezier(.2,.7,.2,1)}${pct(d.text[1])},100%{transform:translateX(0)}}` +
      `@keyframes spc-cwipe{0%,${pct(d.center[0])}{transform:translateX(-800px);animation-timing-function:cubic-bezier(.2,.7,.2,1)}${pct(d.center[1])},100%{transform:translateX(0)}}` +
      move("spc-tmove", d.text as Span, "translate(-28px,0)") +
      move("spc-cmove", d.center as Span, "translate(-18px,0)");
  }
  return css;
}

/* ------------------------------------------------------------------ géométrie des balayages (repère MC, 1080 px) */
const PEN_WIPE = { x1: 700.3, y1: 363, x2: 469.6, y2: 859, width: 320 };
const NIB_WIPE = { x1: 479.7, y1: 837.2, x2: 417.8, y2: 970.5, width: 220 };

const VIEW = {
  mc: { box: "20 80 1030 910", w: 1030, h: 910, shadow: { dy: 3, std: 5, o: 0.4 }, sheen: { x: -310, w: 330, y: -500, h: 2200, travel: 1700 } },
  dc: { box: "0 0 1054 340", w: 1054, h: 340, shadow: { dy: 1.2, std: 1.6, o: 0.45 }, sheen: { x: -130, w: 130, y: -300, h: 900, travel: 1340 } },
} as const;

export function LogoLoader({
  variant = "mc",
  size,
  animated = true,
  loop = true,
  duration = 4.5,
  showText = true,
  text = LOGO_LOADER_DEFAULT_TEXT,
  fullScreen = false,
  shadow = true,
  inkColor = "#1b1464",
  nibColor = "#754c24",
  centerColor = "#000",
  className,
  textClassName,
}: LogoLoaderProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (n: string) => `spc${uid}-${n}`;
  const url = (n: string) => `url(#${id(n)})`;
  const dc = variant === "dc";
  const view = VIEW[variant];
  const a = animated ? "spc-a " : "";
  const width = size ?? (dc ? 300 : 144);

  const css = animated ? buildCss(variant, loop, view.sheen.travel) : "";
  const svgStyle = {
    "--spc-d": `${duration}s`,
    "--spc-n": loop ? "infinite" : 1,
  } as CSSProperties;

  // dasharray « 1 2 » + pathLength=1 : tracé masqué à dashoffset=1, entièrement visible à 0
  const drawProps = { pathLength: 1, strokeDasharray: "1 2", strokeDashoffset: 0, fill: "none", stroke: "#fff" } as const;
  const maskBox = dc ? { x: 0, y: 0, width: 1054, height: 340 } : { x: 0, y: 0, width: 1080, height: 1080 };

  const monogram = (
    <>
      <path d={MC_SP} fill={inkColor} fillRule="evenodd" mask={url("sp")} />
      <path d={MC_PEN} fill={inkColor} fillRule="evenodd" mask={url("pen")} />
      <g className={`${a}spc-nibmove`}>
        <path d={MC_NIB} fill={nibColor} fillRule="evenodd" mask={url("nib")} />
      </g>
    </>
  );

  const textWipeMask = (name: "twipe" | "cwipe", cls: string, y: number, h: number) => (
    <mask id={id(name)} maskUnits="userSpaceOnUse" x={0} y={0} width={1054} height={340}>
      <rect className={`${a}${cls}`} x={330} y={y} width={740} height={h} fill={url(`${name}-g`)} />
    </mask>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={showText ? text : LOGO_LOADER_DEFAULT_TEXT}
      className={[
        "flex flex-col items-center justify-center gap-3",
        fullScreen ? "min-h-screen bg-background text-foreground" : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}
    >
      <svg
        viewBox={view.box}
        aria-hidden="true"
        focusable="false"
        className="block h-auto max-w-full"
        style={{ ...svgStyle, width }}
      >
        {animated && <style dangerouslySetInnerHTML={{ __html: css }} />}
        <defs>
          {/* masques d'écriture du monogramme (repère MC) */}
          <mask id={id("sp")} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1080}>
            <path className={`${a}spc-sp`} d={MC_CENTERLINE} strokeWidth={120} strokeLinecap="round" strokeLinejoin="round" {...drawProps} />
          </mask>
          <mask id={id("pen")} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1080}>
            <line className={`${a}spc-pen`} x1={PEN_WIPE.x1} y1={PEN_WIPE.y1} x2={PEN_WIPE.x2} y2={PEN_WIPE.y2} strokeWidth={PEN_WIPE.width} {...drawProps} />
          </mask>
          <mask id={id("nib")} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1080}>
            <line className={`${a}spc-nib`} x1={NIB_WIPE.x1} y1={NIB_WIPE.y1} x2={NIB_WIPE.x2} y2={NIB_WIPE.y2} strokeWidth={NIB_WIPE.width} {...drawProps} />
          </mask>

          {dc && (
            <>
              <linearGradient id={id("twipe-g")} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.92" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>
              <linearGradient id={id("cwipe-g")} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.92" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>
              {textWipeMask("twipe", "spc-twipe", 60, 160)}
              {textWipeMask("cwipe", "spc-cwipe", 195, 80)}
            </>
          )}

          {shadow && (
            <filter id={id("shadow")} filterUnits="userSpaceOnUse" x={-60} y={-60} width={view.w + 160} height={view.h + 160 + (dc ? 0 : 80)} colorInterpolationFilters="sRGB">
              <feDropShadow dx={0} dy={view.shadow.dy} stdDeviation={view.shadow.std} floodColor="#000" floodOpacity={view.shadow.o} />
            </filter>
          )}

          {/* reflet : bande lumineuse limitée à la forme du logo */}
          <linearGradient id={id("sheen-g")} x1="0" x2="1" y1="0" y2="0" gradientTransform="rotate(20 .5 .5)">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={id("clip")}>
            <path d={MC_SP} fillRule="evenodd" transform={dc ? DC_MONOGRAM_TRANSFORM : undefined} />
            <path d={MC_PEN} fillRule="evenodd" transform={dc ? DC_MONOGRAM_TRANSFORM : undefined} />
            <path d={MC_NIB} fillRule="evenodd" transform={dc ? DC_MONOGRAM_TRANSFORM : undefined} />
            {dc && <path d={DC_TEXT} fillRule="evenodd" />}
            {dc && <path d={DC_CENTER} fillRule="evenodd" />}
          </clipPath>
        </defs>

        <g className={`${a}spc-fade`}>
          <g className={`${a}spc-bump`}>
            <g filter={shadow ? url("shadow") : undefined}>
              {dc ? <g transform={DC_MONOGRAM_TRANSFORM}>{monogram}</g> : monogram}
              {dc && (
                <>
                  <g mask={url("twipe")}>
                    <g className={`${a}spc-tmove`}>
                      <path d={DC_TEXT} fill={inkColor} fillRule="evenodd" />
                    </g>
                  </g>
                  <g mask={url("cwipe")}>
                    <g className={`${a}spc-cmove`}>
                      <path d={DC_CENTER} fill={centerColor} fillRule="evenodd" />
                    </g>
                  </g>
                </>
              )}
            </g>
            {animated && (
              <g clipPath={url("clip")}>
                <rect className="spc-a spc-sheen" x={view.sheen.x} y={view.sheen.y} width={view.sheen.w} height={view.sheen.h} fill={url("sheen-g")} />
              </g>
            )}
          </g>
        </g>
      </svg>

      {showText && text ? (
        <p className={textClassName ?? "text-sm text-muted-foreground"}>{text}</p>
      ) : null}
    </div>
  );
}

export default LogoLoader;