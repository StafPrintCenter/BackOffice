import { useId, type CSSProperties } from "react";
import { DC_CENTER, DC_MONOGRAM_TRANSFORM, DC_TEXT, MC_CENTERLINE, MC_NIB, MC_PEN, MC_SP } from "../Paths";
import { LOGO_LOADER_DEFAULT_TEXT, buildLogoLoaderCss, NIB_WIPE, PEN_WIPE, VIEW, type LogoLoaderProps } from "./";

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

  const css = animated ? buildLogoLoaderCss(variant, loop, view.sheen.travel) : "";
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