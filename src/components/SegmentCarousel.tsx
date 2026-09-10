import LandscapeOutlined from "@mui/icons-material/LandscapeOutlined";
import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import FormatColorFillOutlined from "@mui/icons-material/FormatColorFillOutlined";
import FoundationOutlined from "@mui/icons-material/FoundationOutlined";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import ViewModuleOutlined from "@mui/icons-material/ViewModuleOutlined";
import GridViewOutlined from "@mui/icons-material/GridViewOutlined";
import TerrainOutlined from "@mui/icons-material/TerrainOutlined";
import ForestOutlined from "@mui/icons-material/ForestOutlined";
import ViewWeekOutlined from "@mui/icons-material/ViewWeekOutlined";
import HexagonOutlined from "@mui/icons-material/HexagonOutlined";
import HardwareOutlined from "@mui/icons-material/HardwareOutlined";
import LayersOutlined from "@mui/icons-material/LayersOutlined";
import DonutLargeOutlined from "@mui/icons-material/DonutLargeOutlined";
import WindowOutlined from "@mui/icons-material/WindowOutlined";
import UmbrellaOutlined from "@mui/icons-material/UmbrellaOutlined";
import GraphicEqOutlined from "@mui/icons-material/GraphicEqOutlined";
import FormatPaintOutlined from "@mui/icons-material/FormatPaintOutlined";
import ContentPasteOutlined from "@mui/icons-material/ContentPasteOutlined";
import RoofingOutlined from "@mui/icons-material/RoofingOutlined";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";
import TextureOutlined from "@mui/icons-material/TextureOutlined";
import DoorSlidingOutlined from "@mui/icons-material/DoorSlidingOutlined";
import PlumbingOutlined from "@mui/icons-material/PlumbingOutlined";
import BathtubOutlined from "@mui/icons-material/BathtubOutlined";
import SettingsInputComponentOutlined from "@mui/icons-material/SettingsInputComponentOutlined";
import CableOutlined from "@mui/icons-material/CableOutlined";
import ElectricalServicesOutlined from "@mui/icons-material/ElectricalServicesOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import RouterOutlined from "@mui/icons-material/RouterOutlined";
import AcUnitOutlined from "@mui/icons-material/AcUnitOutlined";
import PropaneTankOutlined from "@mui/icons-material/PropaneTankOutlined";
import FireExtinguisherOutlined from "@mui/icons-material/FireExtinguisherOutlined";
import SolarPowerOutlined from "@mui/icons-material/SolarPowerOutlined";
import WaterOutlined from "@mui/icons-material/WaterOutlined";
import AddRoadOutlined from "@mui/icons-material/AddRoadOutlined";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import YardOutlined from "@mui/icons-material/YardOutlined";
import ArchitectureOutlined from "@mui/icons-material/ArchitectureOutlined";
import BuildOutlined from "@mui/icons-material/BuildOutlined";
import HealthAndSafetyOutlined from "@mui/icons-material/HealthAndSafetyOutlined";
import LocalFireDepartmentOutlined from "@mui/icons-material/LocalFireDepartmentOutlined";
import PrecisionManufacturingOutlined from "@mui/icons-material/PrecisionManufacturingOutlined";
import HotTubOutlined from "@mui/icons-material/HotTubOutlined";
import ElevatorOutlined from "@mui/icons-material/ElevatorOutlined";
import PoolOutlined from "@mui/icons-material/PoolOutlined";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import { useMemo, useRef } from "react";
import { Box, ButtonBase, IconButton, Stack, Typography } from "@mui/material";
import CategoryOutlined from "@mui/icons-material/CategoryOutlined";
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
const segmentIcons = [LandscapeOutlined, Inventory2Outlined, FormatColorFillOutlined, FoundationOutlined, ScienceOutlined, ViewModuleOutlined, GridViewOutlined, TerrainOutlined, ForestOutlined, ViewWeekOutlined, HexagonOutlined, HardwareOutlined, LayersOutlined, DonutLargeOutlined, WindowOutlined, UmbrellaOutlined, GraphicEqOutlined, FormatPaintOutlined, ContentPasteOutlined, RoofingOutlined, SpaceDashboardOutlined, TextureOutlined, DoorSlidingOutlined, PlumbingOutlined, BathtubOutlined, SettingsInputComponentOutlined, CableOutlined, ElectricalServicesOutlined, LightbulbOutlined, RouterOutlined, AcUnitOutlined, PropaneTankOutlined, FireExtinguisherOutlined, SolarPowerOutlined, WaterOutlined, AddRoadOutlined, AccountBalanceOutlined, YardOutlined, ArchitectureOutlined, BuildOutlined, HealthAndSafetyOutlined, LocalFireDepartmentOutlined, PrecisionManufacturingOutlined, HotTubOutlined, ElevatorOutlined, PoolOutlined, ApartmentOutlined];
function iconFor(code: string) { return segmentIcons[Number(code) - 1] ?? CategoryOutlined; }
export function SegmentCarousel({ catalog, selected, onSelect }: {
  catalog: CatalogMaterial[]; selected: string; onSelect: (code: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ x: 0, scroll: 0, active: false, moved: false });
  const segments = useMemo(() => [...new Map(catalog.map(m => [m.segmentCode, m.segmentName])).entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })), [catalog]);
  if (!segments.length) return null;
  const move = (direction: number) => {
    const element = rail.current;
    if (element) element.scrollBy({ left: direction * element.clientWidth * .75,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return <Box component="section" aria-label="Filtrar por segmento" sx={{ mb: 2.5, minWidth: 0 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
      <Typography variant="subtitle2" color="#24583b" fontWeight={700}>Explore por segmento</Typography>
      <Stack direction="row" gap={.5}>
        <IconButton size="small" aria-label="Segmentos anteriores" onClick={() => move(-1)} sx={{ color: "#397251" }}><ChevronLeftRounded /></IconButton>
        <IconButton size="small" aria-label="Próximos segmentos" onClick={() => move(1)} sx={{ color: "#397251" }}><ChevronRightRounded /></IconButton>
      </Stack>
    </Stack>
    <Box ref={rail} onPointerDown={event => {
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
      sx={{ display: "flex", gap: 1, overflowX: "auto", py: 1, px: .5, cursor: "grab",
        "&:active": { cursor: "grabbing" }, userSelect: "none", WebkitOverflowScrolling: "touch",
        scrollbarWidth: "thin", scrollbarColor: "#d4e5d9 transparent" }}>
      {[["", "Todos os segmentos"], ...segments].map(([code, name]) => {
        const Icon = iconFor(code); const active = code === selected;
        return <ButtonBase key={code} aria-label={name} aria-pressed={active} title={name}
          onClick={() => onSelect(code === selected ? "" : code)}
          sx={{ width: 78, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1,
            borderRadius: "16px", py: .5, alignSelf: "stretch", justifyContent: "flex-start",
            "&.Mui-focusVisible": { outline: "2px solid #198a4a", outlineOffset: 1 },
            "&:hover .segment-icon": { bgcolor: active ? "#16713d" : "#e5f2e9", transform: "translateY(-2px)" }
          }}>
          <Box className="segment-icon" sx={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center",
            color: active ? "#fff" : "#276e45", bgcolor: active ? "#198a4a" : "#f2f8f4",
            border: "1px solid", borderColor: active ? "#198a4a" : "#d9e9df",
            boxShadow: active ? "0 5px 14px #198a4a25" : "0 3px 9px #174c3207",
            transition: "background-color 180ms, transform 180ms",
            "@media (prefers-reduced-motion: reduce)": { transition: "none" }
          }}><Icon sx={{ fontSize: 23 }} /></Box>
          <Typography component="span" sx={{ fontSize: 10.5, lineHeight: 1.4, fontWeight: active ? 700 : 500,
            color: active ? "#145f33" : "#617567", textAlign: "center", px: .25, overflowWrap: "anywhere" }}>
            {code ? labels[code] || name : "Todos"}
          </Typography>
        </ButtonBase>;
      })}
    </Box>
  </Box>;
}
