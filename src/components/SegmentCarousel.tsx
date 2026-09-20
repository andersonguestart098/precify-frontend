import { Mountains, Package, PaintBucket, Cube, Flask, Wall, SquaresFour, Tree, Columns, Hammer, Stack as StackIcon, Circle, Umbrella, Waves, PaintBrush, Clipboard, HouseLine, Door, Pipe, Bathtub, Gear, Plugs, ShieldCheck, Lightbulb, WifiHigh, Snowflake, Fire, FireExtinguisher, SolarPanel, Drop, RoadHorizon, Plant, Flower, CraneTower, Wrench, HardHat, Factory, Thermometer, Elevator, SwimmingPool, Buildings, Shapes, Check } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, ButtonBase, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import type { CatalogMaterial } from "../domain/search";

const labels: Record<string, string> = {
  "1": "Agregados", "2": "Cimentos e gesso", "3": "Argamassas", "4": "Concretos", "5": "Aditivos",
  "6": "Alvenaria", "7": "Cerâmicos", "8": "Rochas", "9": "Madeiras", "10": "Aço e ferro",
  "11": "Metais", "12": "Ferragens", "13": "Plásticos", "14": "Borrachas", "15": "Vidros",
  "16": "Impermeabilização", "17": "Isolamento", "18": "Tintas", "19": "Adesivos", "20": "Coberturas",
  "21": "Drywall", "22": "Pisos", "23": "Portas e janelas", "24": "Hidráulica", "25": "Louças e metais",
  "26": "Bombas e válvulas", "27": "Condutores", "28": "Proteção elétrica", "29": "Iluminação",
  "30": "Automação", "31": "Climatização", "32": "Gás", "33": "Contra incêndio", "34": "Energia solar",
  "35": "Drenagem", "36": "Pavimentação", "37": "Saneamento", "38": "Paisagismo", "39": "Andaimes",
  "40": "Ferramentas", "41": "Proteção e EPIs", "42": "Refratários", "43": "Equipamentos",
  "44": "Aquecimento", "45": "Acessibilidade", "46": "Piscinas", "47": "Fachadas"
};
const segmentIcons = [Mountains, Package, PaintBucket, Cube, Flask, Wall, SquaresFour, Mountains, Tree, Columns, Cube, Hammer, StackIcon, Circle, SquaresFour, Umbrella, Waves, PaintBrush, Clipboard, HouseLine, Wall, SquaresFour, Door, Pipe, Bathtub, Gear, Plugs, ShieldCheck, Lightbulb, WifiHigh, Snowflake, Fire, FireExtinguisher, SolarPanel, Drop, RoadHorizon, Plant, Flower, CraneTower, Wrench, HardHat, Fire, Factory, Thermometer, Elevator, SwimmingPool, Buildings];
export function segmentIconFor(code: string) { return segmentIcons[Number(code) - 1] ?? Shapes; }

export function SegmentCarousel({ catalog, selected, onSelect, compactMobile = false }: {
  catalog: CatalogMaterial[]; selected: string; onSelect: (code: string) => void; compactMobile?: boolean;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, scroll: 0, active: false, moved: false });
  const scrollTimer = useRef<number | undefined>(undefined);
  const [scrolling, setScrolling] = useState(false);
  const segments = useMemo(() => [...new Map(catalog.map(m => [m.segmentCode, m.segmentName])).entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })), [catalog]);

  const showScrollbar = () => {
    setScrolling(true);
    window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => setScrolling(false), 700);
  };

  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  useEffect(() => {
    if (!compactMobile || !selected || !segments.length) return;
    const element = rail.current;
    if (!element) return;

    const target = Array.from(element.querySelectorAll<HTMLElement>("[data-segment-code]"))
      .find(item => item.dataset.segmentCode === selected);
    if (!target) return;

    const frame = window.requestAnimationFrame(() => {
      const left = target.offsetLeft - (element.clientWidth - target.offsetWidth) / 2;
      element.scrollTo({
        left: Math.max(0, left),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [compactMobile, selected, segments]);

  if (!segments.length) return null;

  const move = (direction: number) => {
    const element = rail.current;
    if (element) element.scrollBy({
      left: direction * element.clientWidth * .75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  };

  return <Box component="section" aria-label="Filtrar por segmento" sx={{ mb: 0, minWidth: 0 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 1, md: .55, xl: 1 }} sx={{ display: compactMobile ? { xs: "none", md: "flex" } : "flex" }}>
      <Stack direction="row" alignItems="center" gap={.35} minWidth={0}>
        <Typography sx={{
          fontSize: { xs: 14.8, md: 16, xl: 17.4 },
          fontWeight: 900,
          color: "#1f4c3d",
          letterSpacing: "-.02em",
        }}>Explore por segmento</Typography>
        <Tooltip arrow enterTouchDelay={0} leaveTouchDelay={2800} title="Escolha um segmento para ver apenas materiais daquela categoria. Você pode deslizar a lista para explorar todas as opções.">
          <IconButton size="small" aria-label="Como funciona a navegação por segmentos" sx={{
            width: { xs: 28, md: 24, xl: 28 }, height: { xs: 28, md: 24, xl: 28 }, ml: .15,
            color: "#4f7569", bgcolor: "rgba(0,107,79,.045)", border: "1px solid rgba(0,107,79,.10)",
            transition: "transform 180ms ease, background-color 180ms ease",
            "&:hover": { bgcolor: "rgba(0,107,79,.09)", transform: "translateY(-1px) rotate(-4deg)" },
            "&:focus-visible": { outline: "2px solid #269b78", outlineOffset: 2 },
          }}><HelpOutlineRoundedIcon sx={{ fontSize: { xs: 17, md: 15, xl: 17 } }} /></IconButton>
        </Tooltip>
      </Stack>
      <Stack direction="row" gap={.5} sx={{ mr: { xs: 0, md: 6, xl: 0 } }}>
        <IconButton size="small" aria-label="Segmentos anteriores" onClick={() => move(-1)} sx={{ color: "#39725f", width: { md: 36, xl: 44 }, height: { md: 36, xl: 44 } }}><ChevronLeftRounded sx={{ fontSize: { md: 20, xl: 24 } }} /></IconButton>
        <IconButton size="small" aria-label="Próximos segmentos" onClick={() => move(1)} sx={{ color: "#39725f", width: { md: 36, xl: 44 }, height: { md: 36, xl: 44 } }}><ChevronRightRounded sx={{ fontSize: { md: 20, xl: 24 } }} /></IconButton>
      </Stack>
    </Stack>

    <Box ref={rail} onScroll={showScrollbar}
      onPointerDown={event => {
        drag.current.moved = false;
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, active: true, moved: false };
      }}
      onPointerMove={event => {
        if (!drag.current.active) return;
        const delta = event.clientX - drag.current.x;
        if (Math.abs(delta) > 6) {
          drag.current.moved = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.scrollLeft = drag.current.scroll - delta;
        }
      }}
      onPointerUp={() => { drag.current.active = false; }} onPointerCancel={() => { drag.current.active = false; }}
      onLostPointerCapture={() => { drag.current.active = false; }} onPointerLeave={() => { drag.current.active = false; }}
      onClickCapture={event => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false; } }}
      sx={{
        display: "flex",
        gap: compactMobile ? { xs: .55, sm: .65, md: 1.15, xl: 1.6 } : { xs: 1.35, sm: 1.6, md: 1.15, xl: 1.6 },
        overflowX: "auto",
        py: compactMobile ? { xs: .12, md: .45, xl: .8 } : { xs: .8, md: .45, xl: .8 },
        px: compactMobile ? { xs: .08, md: 0 } : 0,
        cursor: "grab", "&:active": { cursor: "grabbing" }, userSelect: "none", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin", scrollbarColor: scrolling ? "#a9d7c8 transparent" : "transparent transparent",
        "&::-webkit-scrollbar": { height: compactMobile ? 2 : 3 }, "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: scrolling ? "#a9d7c8" : "transparent", borderRadius: 999 }
      }}>
      {[["", "Todos os segmentos"], ...segments].map(([code, name]) => {
        const Icon = segmentIconFor(code);
        const active = code === selected;
        return <Tooltip key={code} title={code ? labels[code] || name : "Todos os segmentos"} arrow enterDelay={500}>
          <ButtonBase data-segment-code={code} aria-label={name} aria-pressed={active} onClick={() => onSelect(code === selected ? "" : code)} sx={{
            width: compactMobile ? { xs: 82, sm: 88, md: 68, xl: 78 } : { xs: 78, md: 68, xl: 78 },
            minWidth: compactMobile ? { xs: 82, sm: 88, md: 68, xl: 78 } : undefined,
            minHeight: compactMobile ? { xs: 36, md: 78, xl: 94 } : { xs: 94, md: 78, xl: 94 },
            flexShrink: 0, display: "flex", flexDirection: compactMobile ? { xs: "row", md: "column" } : "column",
            alignItems: "center", justifyContent: { xs: "flex-start", md: "center" },
            gap: compactMobile ? { xs: .45, md: .65, xl: 1 } : { xs: 1, md: .65, xl: 1 },
            borderRadius: compactMobile ? { xs: "8px", md: 2 } : 2,
            px: compactMobile ? { xs: .5, md: 0 } : 0,
            py: compactMobile ? { xs: .18, md: .25, xl: .5 } : { xs: .5, md: .25, xl: .5 },
            border: compactMobile ? { xs: "1px solid", md: "0 solid transparent" } : "0 solid transparent",
            borderColor: compactMobile ? { xs: active ? "rgba(0,107,79,.22)" : "rgba(0,107,79,.06)", md: "transparent" } : "transparent",
            background: compactMobile ? { xs: active ? "rgba(0,107,79,.04)" : "rgba(255,255,255,.20)", md: "transparent" } : "transparent",
            boxShadow: "none",
            "&.Mui-focusVisible": { outline: "2px solid #006b4f", outlineOffset: 1 },
            "&:hover .segment-icon": { bgcolor: active ? "#e7f3ee" : "#edf5f2", borderColor: "#9acdbb", transform: "translateY(-1px)" }
          }}>
            <Box className="segment-icon" sx={{
              position: "relative", flexShrink: 0,
              width: compactMobile ? { xs: 22, md: 44, xl: 52 } : { xs: 52, md: 44, xl: 52 },
              height: compactMobile ? { xs: 22, md: 44, xl: 52 } : { xs: 52, md: 44, xl: 52 },
              borderRadius: compactMobile ? { xs: "6px", md: "50%" } : "50%", display: "grid", placeItems: "center",
              color: active ? "#174a39" : "#3f6759",
              background: active ? "linear-gradient(145deg,#f1f8f5,#e4f0ec)" : "linear-gradient(145deg,#f2f7f5,#e8f1ee)",
              border: "1px solid", borderColor: active ? "rgba(0,107,79,.20)" : "rgba(0,107,79,.075)",
              boxShadow: "none", transition: "background-color 180ms,border-color 180ms,transform 180ms",
              "& > svg": { width: compactMobile ? { xs: 13, md: 24, xl: 28 } : { md: 24, xl: 28 }, height: compactMobile ? { xs: 13, md: 24, xl: 28 } : { md: 24, xl: 28 } },
              "@media (prefers-reduced-motion: reduce)": { transition: "none" }
            }}><Icon size={compactMobile ? 13 : 28} weight="duotone" aria-hidden="true" />
              {active && !compactMobile && <Box aria-hidden="true" sx={{ position: "absolute", right: -2, bottom: -1, width: { xs: 16, md: 14, xl: 16 }, height: { xs: 16, md: 14, xl: 16 }, borderRadius: "50%", bgcolor: "#ecf7f3", color: "#275d4b", border: "2px solid #f7f9f8", display: "grid", placeItems: "center" }}><Check size={10} weight="bold" /></Box>}
            </Box>
            <Typography component="span" sx={{
              fontSize: compactMobile ? { xs: 7.8, sm: 8, md: 10, xl: 11 } : { xs: 11, md: 10, xl: 11 },
              lineHeight: compactMobile ? 1 : 1.3, fontWeight: active ? 700 : 550,
              color: active ? "#174a39" : "#63776f", textAlign: compactMobile ? { xs: "left", md: "center" } : "center",
              minWidth: 0, flex: compactMobile ? { xs: 1, md: "initial" } : "initial", overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: compactMobile ? { xs: "nowrap", md: "normal" } : "normal"
            }}>{code ? labels[code] || name : "Todos"}</Typography>
          </ButtonBase>
        </Tooltip>;
      })}
    </Box>
  </Box>;
}
