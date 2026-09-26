import { Mountains, Package, PaintBucket, Cube, Flask, Wall, SquaresFour, Tree, Columns, Hammer, Stack as StackIcon, Circle, Umbrella, Waves, PaintBrush, Clipboard, HouseLine, Door, Pipe, Bathtub, Gear, Plugs, ShieldCheck, Lightbulb, WifiHigh, Snowflake, Fire, FireExtinguisher, SolarPanel, Drop, RoadHorizon, Plant, Flower, CraneTower, Wrench, HardHat, Factory, Thermometer, Elevator, SwimmingPool, Buildings, Shapes, Check } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, ButtonBase, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import type { CatalogMaterial } from "../domain/search";
import { catalogCategoryIconSize, catalogSectionTitleSx } from "../styles/catalogVisual";

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
  const [viewMode, setViewMode] = useState<"mosaic" | "list">("mosaic");

  const segments = useMemo(() => [...new Map(catalog.map(m => [m.segmentCode, m.segmentName])).entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })), [catalog]);

  const segmentDescriptions = useMemo(() => {
    const grouped = new Map<string, { name: string; families: Set<string>; materials: Set<string>; notes: Set<string> }>();
    for (const material of catalog) {
      const entry = grouped.get(material.segmentCode) ?? {
        name: material.segmentName,
        families: new Set<string>(),
        materials: new Set<string>(),
        notes: new Set<string>(),
      };
      if (material.familyName?.trim()) entry.families.add(material.familyName.trim());
      if (material.materialName?.trim()) entry.materials.add(material.materialName.trim());
      if (material.observation?.trim() && !/material canônico/i.test(material.observation)) entry.notes.add(material.observation.trim());
      grouped.set(material.segmentCode, entry);
    }

    const result = new Map<string, string>();
    for (const [code, entry] of grouped) {
      const families = [...entry.families].slice(0, 5);
      const materials = [...entry.materials].slice(0, 4);
      const note = [...entry.notes][0];
      const parts = [
        note || `${entry.name}: grupo do catálogo técnico de materiais da construção.`,
        families.length ? `Famílias: ${families.join(", ")}.` : "",
        materials.length ? `Exemplos: ${materials.join(", ")}.` : "",
      ].filter(Boolean);
      result.set(code, parts.join(" "));
    }
    return result;
  }, [catalog]);

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

  const listMode = viewMode === "list" && !compactMobile;

  return <Box component="section" aria-label="Filtrar por segmento" sx={{ mb: 0, minWidth: 0 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 1, md: .55, xl: 1 }} sx={{ display: compactMobile ? { xs: "none", md: "flex" } : "flex" }}>
      <Typography sx={catalogSectionTitleSx}>Explore por segmento</Typography>

      <Stack direction="row" alignItems="center" gap={.45} sx={{ mr: { xs: 0, md: 6, xl: 0 } }}>
        {!compactMobile && <Box sx={{
          display: "flex", alignItems: "center", gap: .15, p: .2, mr: .25,
          border: "1px solid rgba(0,107,79,.10)", borderRadius: "9px", bgcolor: "rgba(255,255,255,.72)",
        }}>
          <Tooltip title="Exibir em mosaico" arrow>
            <IconButton size="small" aria-label="Exibir segmentos em mosaico" aria-pressed={viewMode === "mosaic"}
              onClick={() => setViewMode("mosaic")} sx={{
                width: 30, height: 30, borderRadius: "7px",
                color: viewMode === "mosaic" ? "#17664f" : "#789087",
                bgcolor: viewMode === "mosaic" ? "#e8f4ef" : "transparent",
              }}>
              <ViewModuleRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exibir em lista" arrow>
            <IconButton size="small" aria-label="Exibir segmentos em lista" aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")} sx={{
                width: 30, height: 30, borderRadius: "7px",
                color: viewMode === "list" ? "#17664f" : "#789087",
                bgcolor: viewMode === "list" ? "#e8f4ef" : "transparent",
              }}>
              <ViewListRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>}

        <Tooltip title="Segmentos anteriores" arrow>
          <IconButton size="small" aria-label="Segmentos anteriores" onClick={() => move(-1)} sx={{
            color: "#39725f", width: { xs: 34, md: 36, xl: 40 }, height: { xs: 34, md: 36, xl: 40 },
            border: "1px solid rgba(0,107,79,.11)", bgcolor: "rgba(255,255,255,.72)",
            "&:hover": { bgcolor: "#edf6f2", borderColor: "rgba(0,107,79,.22)" },
          }}><ChevronLeftRounded sx={{ fontSize: { md: 20, xl: 23 } }} /></IconButton>
        </Tooltip>
        <Tooltip title="Próximos segmentos" arrow>
          <IconButton size="small" aria-label="Próximos segmentos" onClick={() => move(1)} sx={{
            color: "#39725f", width: { xs: 34, md: 36, xl: 40 }, height: { xs: 34, md: 36, xl: 40 },
            border: "1px solid rgba(0,107,79,.11)", bgcolor: "rgba(255,255,255,.72)",
            "&:hover": { bgcolor: "#edf6f2", borderColor: "rgba(0,107,79,.22)" },
          }}><ChevronRightRounded sx={{ fontSize: { md: 20, xl: 23 } }} /></IconButton>
        </Tooltip>
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
      onPointerUp={() => { drag.current.active = false; }}
      onPointerCancel={() => { drag.current.active = false; }}
      onLostPointerCapture={() => { drag.current.active = false; }}
      onPointerLeave={() => { drag.current.active = false; }}
      onClickCapture={event => {
        if (drag.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          drag.current.moved = false;
        }
      }}
      sx={{
        display: "flex",
        gap: listMode ? .8 : compactMobile ? { xs: .55, sm: .65, md: 1.15, xl: 1.6 } : { xs: 1.35, sm: 1.6, md: 1.15, xl: 1.6 },
        overflowX: "auto",
        py: listMode ? .45 : compactMobile ? { xs: .12, md: .45, xl: .8 } : { xs: .8, md: .45, xl: .8 },
        px: compactMobile ? { xs: .08, md: 0 } : 0,
        cursor: "grab", "&:active": { cursor: "grabbing" }, userSelect: "none", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin", scrollbarColor: scrolling ? "#a9d7c8 transparent" : "transparent transparent",
        "&::-webkit-scrollbar": { height: compactMobile ? 2 : 3 },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": { backgroundColor: scrolling ? "#a9d7c8" : "transparent", borderRadius: 999 }
      }}>
      {[["", "Todos os segmentos"], ...segments].map(([code, name]) => {
        const Icon = segmentIconFor(code);
        const active = code === selected;
        const helpText = code
          ? segmentDescriptions.get(code) ?? `${name}: segmento do catálogo técnico de materiais.`
          : "Exibe todos os segmentos do catálogo sem aplicar filtro.";

        return <ButtonBase
          key={code}
          data-segment-code={code}
          aria-label={name}
          aria-pressed={active}
          onClick={() => onSelect(code === selected ? "" : code)}
          sx={{
            position: "relative",
            width: listMode ? { xs: 210, md: 220, xl: 240 } : compactMobile ? { xs: 82, sm: 88, md: 68, xl: 78 } : { xs: 78, md: 68, xl: 78 },
            minWidth: listMode ? { xs: 210, md: 220, xl: 240 } : compactMobile ? { xs: 82, sm: 88, md: 68, xl: 78 } : undefined,
            minHeight: listMode ? 56 : compactMobile ? { xs: 36, md: 78, xl: 94 } : { xs: 94, md: 78, xl: 94 },
            flexShrink: 0,
            display: "flex",
            flexDirection: listMode ? "row" : compactMobile ? { xs: "row", md: "column" } : "column",
            alignItems: "center",
            justifyContent: listMode ? "flex-start" : { xs: "flex-start", md: "center" },
            gap: listMode ? .9 : compactMobile ? { xs: .45, md: .65, xl: 1 } : { xs: 1, md: .65, xl: 1 },
            borderRadius: listMode ? "11px" : compactMobile ? { xs: "8px", md: 2 } : 2,
            px: listMode ? 1 : compactMobile ? { xs: .5, md: 0 } : 0,
            py: listMode ? .65 : compactMobile ? { xs: .18, md: .25, xl: .5 } : { xs: .5, md: .25, xl: .5 },
            border: listMode ? "1px solid" : compactMobile ? { xs: "1px solid", md: "0 solid transparent" } : "0 solid transparent",
            borderColor: listMode ? active ? "rgba(0,107,79,.24)" : "rgba(0,107,79,.09)" : compactMobile ? { xs: active ? "rgba(0,107,79,.22)" : "rgba(0,107,79,.06)", md: "transparent" } : "transparent",
            background: listMode ? active ? "#eef7f3" : "rgba(255,255,255,.78)" : compactMobile ? { xs: active ? "rgba(0,107,79,.04)" : "rgba(255,255,255,.20)", md: "transparent" } : "transparent",
            boxShadow: listMode ? "0 2px 9px rgba(24,60,48,.025)" : "none",
            "&.Mui-focusVisible": { outline: "2px solid #006b4f", outlineOffset: 1 },
            "&:hover": listMode ? { bgcolor: active ? "#e8f4ef" : "#f6faf8", borderColor: "rgba(0,107,79,.20)" } : undefined,
            "&:hover .segment-icon": { bgcolor: active ? "#e7f3ee" : "#edf5f2", borderColor: "#9acdbb", transform: "translateY(-1px)" }
          }}>
          <Box className="segment-icon" sx={{
            position: "relative", flexShrink: 0,
            width: listMode ? 36 : compactMobile ? { xs: 22, md: 44, xl: 52 } : { xs: 52, md: 44, xl: 52 },
            height: listMode ? 36 : compactMobile ? { xs: 22, md: 44, xl: 52 } : { xs: 52, md: 44, xl: 52 },
            borderRadius: listMode ? "9px" : compactMobile ? { xs: "6px", md: "50%" } : "50%",
            display: "grid", placeItems: "center",
            color: active ? "#174a39" : "#3f6759",
            background: active ? "linear-gradient(145deg,#f1f8f5,#e4f0ec)" : "linear-gradient(145deg,#f2f7f5,#e8f1ee)",
            border: "1px solid", borderColor: active ? "rgba(0,107,79,.20)" : "rgba(0,107,79,.075)",
            boxShadow: "none", transition: "background-color 180ms,border-color 180ms,transform 180ms",
            "& > svg": { width: listMode ? 20 : compactMobile ? { xs: 13, md: 24, lg: 26, xl: 28 } : catalogCategoryIconSize, height: listMode ? 20 : compactMobile ? { xs: 13, md: 24, lg: 26, xl: 28 } : catalogCategoryIconSize },
            "@media (prefers-reduced-motion: reduce)": { transition: "none" }
          }}>
            <Icon size={listMode ? 20 : compactMobile ? 13 : 28} weight="duotone" aria-hidden="true" />
            {active && !compactMobile && !listMode && <Box aria-hidden="true" sx={{
              position: "absolute", right: -2, bottom: -1,
              width: { xs: 16, md: 14, xl: 16 }, height: { xs: 16, md: 14, xl: 16 },
              borderRadius: "50%", bgcolor: "#ecf7f3", color: "#275d4b", border: "2px solid #f7f9f8",
              display: "grid", placeItems: "center"
            }}><Check size={10} weight="bold" /></Box>}
          </Box>

          <Typography component="span" sx={{
            fontSize: listMode ? { xs: 10.8, md: 11.2, xl: 11.8 } : compactMobile ? { xs: 7.8, sm: 8, md: 10, xl: 11 } : { xs: 11, md: 10, xl: 11 },
            lineHeight: listMode ? 1.25 : compactMobile ? 1 : 1.3,
            fontWeight: active ? 700 : 550,
            color: active ? "#174a39" : "#63776f",
            textAlign: listMode ? "left" : compactMobile ? { xs: "left", md: "center" } : "center",
            minWidth: 0,
            flex: listMode ? 1 : compactMobile ? { xs: 1, md: "initial" } : "initial",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: listMode ? "nowrap" : compactMobile ? { xs: "nowrap", md: "normal" } : "normal",
            pr: listMode ? 2.6 : 0,
          }}>{code ? labels[code] || name : "Todos"}</Typography>

          <Tooltip arrow enterTouchDelay={0} leaveTouchDelay={3200} title={helpText}>
            <Box component="span" role="img" aria-label={`Sobre ${code ? labels[code] || name : "todos os segmentos"}`}
              onClick={event => { event.preventDefault(); event.stopPropagation(); }}
              sx={{
                position: "absolute", top: listMode ? 8 : 2, right: listMode ? 7 : 0,
                width: listMode ? 22 : 18, height: listMode ? 22 : 18,
                borderRadius: "50%", display: "grid", placeItems: "center",
                color: "#5e7d72", bgcolor: "rgba(255,255,255,.88)",
                border: "1px solid rgba(0,107,79,.11)",
                cursor: "help", zIndex: 2,
              }}>
              <HelpOutlineRoundedIcon sx={{ fontSize: listMode ? 14 : 12 }} />
            </Box>
          </Tooltip>
        </ButtonBase>;
      })}
    </Box>
  </Box>;
}
