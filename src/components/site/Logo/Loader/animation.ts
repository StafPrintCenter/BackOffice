import type { LogoLoaderVariant } from "./config";

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
const drawMain = (name: string, [a, b]: Span) =>
  `@keyframes ${name}{0%,${pct(a)}{stroke-dashoffset:1;stroke-width:54;animation-timing-function:cubic-bezier(.5,0,.25,1)}` +
  `${pct(b)}{stroke-dashoffset:0;stroke-width:54;animation-timing-function:ease-out}${pct(b + 0.3)},100%{stroke-dashoffset:0;stroke-width:120}}`;
const move = (name: string, [a, b]: Span, from: string) =>
  `@keyframes ${name}{0%,${pct(a)}{transform:${from};animation-timing-function:cubic-bezier(.2,.7,.2,1)}${pct(b)},100%{transform:translate(0,0)}}`;

export function buildLogoLoaderCss(variant: LogoLoaderVariant, loop: boolean, sheenTravel: number) {
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
