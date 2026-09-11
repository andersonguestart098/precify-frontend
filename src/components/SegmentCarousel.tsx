import { Mountains, Package, PaintBucket, Cube, Flask, Wall, SquaresFour, Tree, Columns, Hammer, Stack as StackIcon, Circle, Umbrella, Waves, PaintBrush, Clipboard, HouseLine, Door, Pipe, Bathtub, Gear, Plugs, ShieldCheck, Lightbulb, WifiHigh, Snowflake, Fire, FireExtinguisher, SolarPanel, Drop, RoadHorizon, Plant, Flower, CraneTower, Wrench, HardHat, Factory, Thermometer, Elevator, SwimmingPool, Buildings, Shapes, Check } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, ButtonBase, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
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
function iconFor(code: string) { return segmentIcons[Number(code) - 1] ?? Shapes; }
export function SegmentCarousel({ catalog, selected, onSelect }: {
  catalog: CatalogMaterial[]; selected: string; onSelect: (code: string) => void;
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
  if (!segments.length) return null;
  const move = (direction: number) => {
    const element = rail.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth * .75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return <Box component="section" aria-label="Filtrar por segmento" sx={{ mb: 0, minWidth: 0 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
      <Typography variant="subtitle2" color="#23463b" fontWeight={700}>Explore por segmento</Typography>
      <Stack direction="row" gap={.5}>
        <IconButton size="small" aria-label="Segmentos anteriores" onClick={() => move(-1)} sx={{ color: "#39725f", width: 44, height: 44 }}><ChevronLeftRounded /></IconButton>
        <IconButton size="small" aria-label="Próximos segmentos" onClick={() => move(1)} sx={{ color: "#39725f", width: 44, height: 44 }}><ChevronRightRounded /></IconButton>
      </Stack>
    </Stack>
    <Box ref={rail} onScroll={showScrollbar} onPointerDown={event => {
      drag.current.moved = false;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, active: true, moved: false };
    }} onPointerMove={event => {
      if (!drag.current.active) return;
      const delta = event.clientX - drag.current.x;
      if (Math.abs(delta) > 6) {
        drag.current.moved = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.scrollLeft = drag.current.scroll - delta;
      }
    }} onPointerUp={() => { drag.current.active = false; }}
      onPointerCancel={() => { drag.current.active = false; }}
      onLostPointerCapture={() => { drag.current.active = false; }}
      onPointerLeave={() => { drag.current.active = false; }}
      onClickCapture={event => { if (drag.current.moved) { event.preventDefault(); event.stopPropagation(); drag.current.moved = false; } }}
      sx={{ display: "flex", gap: { xs: 1.35, sm: 1.6 }, overflowX: "auto", py: .8, px: 0, cursor: "grab",
        "&:active": { cursor: "grabbing" }, userSelect: "none", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin", scrollbarColor: scrolling ? "#a9d7c8 transparent" : "transparent transparent",
        "&::-webkit-scrollbar": { height: 3 }, "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: scrolling ? "#a9d7c8" : "transparent", borderRadius: 999 } }}>
      {[["", "Todos os segmentos"], ...segments].map(([code, name]) => {
        const Icon = iconFor(code); const active = code === selected;
        return <Tooltip key={code} title={code ? labels[code] || name : "Todos os segmentos"} arrow enterDelay={500}>
        <ButtonBase aria-label={name} aria-pressed={active}
          onClick={() => onSelect(code === selected ? "" : code)}
          sx={{ width: 78, minHeight: 94, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 1,
            borderRadius: 2, py: .5,
            "&.Mui-focusVisible": { outline: "2px solid #006b4f", outlineOffset: 1 },
            "&:hover .segment-icon": { bgcolor: active ? "#dff2ec" : "#e9f4f0", borderColor: "#8bcbb6", transform: "translateY(-2px)" }
          }}>
          <Box className="segment-icon" sx={{ position: "relative", width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center",
            color: active ? "#13382e" : "#275747", background: active ? "linear-gradient(145deg,#f3fbf8,#e1f1ec)" : "linear-gradient(145deg,#ffffff,#edf5f2)",
            border: "1px solid", borderColor: active ? "#60b196" : "#d9e9e4",
            boxShadow: active ? "0 0 0 3px rgba(38,155,120,.1),0 4px 13px rgba(0,107,79,.1)" : "0 3px 9px #183c3007",
            transition: "background-color 180ms, border-color 180ms, box-shadow 180ms, transform 180ms",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" }
          }}><Icon size={28} weight="duotone" aria-hidden="true" />
            {active && <Box aria-hidden="true" sx={{ position: "absolute", right: -2, bottom: -1, width: 16, height: 16, borderRadius: "50%", bgcolor: "#ecf7f3", color: "#275d4b", border: "2px solid #f7f9f8", display: "grid", placeItems: "center" }}><Check size={10} weight="bold" /></Box>}
          </Box>
          <Typography component="span" sx={{ fontSize: 11, lineHeight: 1.4, fontWeight: active ? 700 : 500, color: active ? "#174a39" : "#526861", textAlign: "center", px: .25, overflowWrap: "anywhere" }}>
            {code ? labels[code] || name : "Todos"}
          </Typography>
        </ButtonBase></Tooltip>;
      })}
    </Box>
  </Box>;
}
