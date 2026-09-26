import { Mountains, Package, PaintBucket, Cube, Flask, Wall, SquaresFour, Tree, Columns, Hammer, Stack as StackIcon, Circle, Umbrella, Waves, PaintBrush, Clipboard, HouseLine, Door, Pipe, Bathtub, Gear, Plugs, ShieldCheck, Lightbulb, WifiHigh, Snowflake, Fire, FireExtinguisher, SolarPanel, Drop, RoadHorizon, Plant, Flower, CraneTower, Wrench, HardHat, Factory, Thermometer, Elevator, SwimmingPool, Buildings, Shapes, Check } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Box, ButtonBase, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
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
const segmentHelp: Record<string, { title: string; description: string }> = {
  "1": { title: "Agregados, Solos e Minerais", description: "Materiais de origem mineral, naturais ou beneficiados, provenientes de jazidas, pedreiras e processamento de solos e agregados." },
  "2": { title: "Cimentos, Cal e Gesso", description: "Materiais minerais produzidos industrialmente por moagem e/ou calcinação, utilizados principalmente como ligantes na construção." },
  "3": { title: "Argamassas, Grautes e Rejuntes", description: "Misturas industrializadas à base de cimento, agregados e aditivos, destinadas a assentamento, preenchimento, regularização e acabamento." },
  "4": { title: "Concretos e Pré-moldados", description: "Produtos à base de cimento, agregados e armaduras, moldados em obra ou industrialmente para uso estrutural e construtivo." },
  "5": { title: "Aditivos e Químicos de Construção", description: "Produtos químicos industrializados utilizados para modificar, proteger ou melhorar o desempenho de materiais e sistemas construtivos." },
  "6": { title: "Alvenaria e Vedação", description: "Blocos, tijolos e componentes destinados à execução de paredes, divisórias e sistemas de vedação." },
  "7": { title: "Cerâmicos e Porcelanatos", description: "Produtos obtidos do processamento e queima de massas cerâmicas, destinados principalmente a pisos, paredes e revestimentos." },
  "8": { title: "Rochas Ornamentais e Naturais", description: "Pedras naturais extraídas de jazidas e beneficiadas por corte, polimento ou acabamento para aplicação construtiva e decorativa." },
  "9": { title: "Madeira e Derivados", description: "Produtos provenientes da madeira natural ou reconstituída, incluindo peças serradas, painéis e componentes industrializados." },
  "10": { title: "Aço e Ferro", description: "Produtos siderúrgicos derivados do ferro e do aço, como barras, perfis, chapas, tubos e componentes estruturais." },
  "11": { title: "Metais Não Ferrosos", description: "Produtos fabricados a partir de metais como alumínio, cobre, zinco e suas ligas, em diferentes formas e aplicações." },
  "12": { title: "Fixadores, Ferragens e Elementos Mecânicos", description: "Componentes metálicos fabricados para união, fixação, montagem e funcionamento mecânico de sistemas e estruturas." },
  "13": { title: "Plásticos e Polímeros", description: "Produtos fabricados a partir de resinas e polímeros, transformados em tubos, chapas, perfis, peças e componentes." },
  "14": { title: "Borrachas, Elastômeros e Vedações", description: "Materiais à base de borrachas naturais ou sintéticas destinados principalmente a vedação, isolamento, absorção e proteção." },
  "15": { title: "Vidros, Espelhos e Chapas Transparentes", description: "Produtos obtidos da fusão e transformação de matérias-primas minerais, utilizados em fechamentos, revestimentos e elementos transparentes." },
  "16": { title: "Impermeabilização", description: "Produtos e sistemas destinados à proteção contra água e umidade, incluindo mantas, membranas, argamassas e produtos químicos." },
  "17": { title: "Isolamento Térmico, Acústico e Proteção Passiva", description: "Materiais desenvolvidos para reduzir transferência de calor, ruído ou propagação de incêndio em edificações." },
  "18": { title: "Tintas, Vernizes e Revestimentos", description: "Produtos líquidos, pastosos ou preparados industrialmente para proteção, acabamento e tratamento de superfícies." },
  "19": { title: "Adesivos, Selantes e Espumas", description: "Produtos químicos utilizados para colagem, vedação, preenchimento e isolamento de juntas e interfaces." },
  "20": { title: "Coberturas, Calhas e Rufos", description: "Componentes destinados à cobertura de edificações e à proteção, coleta e condução das águas pluviais." },
  "21": { title: "Drywall, Forros e Divisórias", description: "Sistemas industrializados leves compostos por placas, perfis e acessórios para paredes, forros e divisórias internas." },
  "22": { title: "Pisos e Revestimentos Não Cerâmicos", description: "Materiais de acabamento para pisos e superfícies, como madeira, vinílicos, laminados, borracha e materiais compostos." },
  "23": { title: "Portas, Janelas, Esquadrias e Ferragens", description: "Sistemas de fechamento e acesso fabricados em madeira, alumínio, aço, PVC, vidro e outros materiais, incluindo acessórios." },
  "24": { title: "Hidráulica, Sanitária e Águas Pluviais", description: "Tubos, conexões e componentes destinados à condução, distribuição, coleta e descarte de água e efluentes." },
  "25": { title: "Louças, Metais Sanitários e Acessórios", description: "Produtos e acessórios destinados aos ambientes sanitários, fabricados principalmente em cerâmica, metais, polímeros e materiais compostos." },
  "26": { title: "Bombas, Válvulas e Controle de Fluidos", description: "Equipamentos e componentes destinados a movimentar, controlar, regular ou bloquear líquidos e outros fluidos." },
  "27": { title: "Elétrica - Condutores e Infraestrutura", description: "Cabos, fios, eletrodutos, canaletas, leitos e demais componentes para condução e infraestrutura elétrica." },
  "28": { title: "Elétrica - Proteção, Comando e Distribuição", description: "Equipamentos e componentes para proteção, comando, controle e distribuição de energia elétrica." },
  "29": { title: "Iluminação", description: "Luminárias, lâmpadas, fontes, drivers e sistemas destinados à iluminação de ambientes internos e externos." },
  "30": { title: "Telecomunicações, Dados, Segurança e Automação", description: "Equipamentos e componentes para comunicação, transmissão de dados, monitoramento, segurança e automação predial." },
  "31": { title: "Climatização, Ventilação e Refrigeração", description: "Equipamentos e componentes destinados a climatizar, ventilar, filtrar, renovar ou refrigerar ambientes." },
  "32": { title: "Gás Combustível e Instalações", description: "Tubos, conexões, válvulas, reguladores e componentes utilizados na condução e controle de gases combustíveis." },
  "33": { title: "Segurança Contra Incêndio", description: "Equipamentos e sistemas destinados à prevenção, detecção, alarme, proteção e combate a incêndios." },
  "34": { title: "Energia Solar, Geração e Armazenamento", description: "Equipamentos destinados à geração e armazenamento de energia, incluindo sistemas solares, inversores, baterias e componentes." },
  "35": { title: "Geossintéticos, Drenagem e Contenção", description: "Materiais sintéticos e componentes utilizados em drenagem, estabilização de solos, contenção e proteção de obras de terra." },
  "36": { title: "Pavimentação e Materiais Asfálticos", description: "Materiais e componentes utilizados na execução, recuperação e manutenção de pavimentos e vias." },
  "37": { title: "Saneamento e Infraestrutura Urbana", description: "Tubos, conexões, equipamentos e componentes destinados a redes de água, esgoto, drenagem e infraestrutura urbana." },
  "38": { title: "Paisagismo, Irrigação e Urbanização", description: "Materiais, equipamentos e componentes destinados a áreas externas, paisagismo, irrigação, espaços públicos e urbanização." },
  "39": { title: "Formas, Escoramentos e Andaimes", description: "Sistemas temporários ou reutilizáveis utilizados para moldagem, sustentação, apoio e acesso durante a execução de obras." },
  "40": { title: "Ferramentas, Abrasivos e Consumíveis", description: "Ferramentas e materiais de desgaste utilizados para cortar, perfurar, lixar, desbastar, fixar e executar serviços de obra." },
  "41": { title: "EPIs, EPCs e Sinalização de Segurança", description: "Equipamentos e materiais destinados à proteção individual e coletiva, isolamento, orientação e sinalização de riscos." },
  "42": { title: "Refratários e Alta Temperatura", description: "Materiais minerais e cerâmicos desenvolvidos para suportar altas temperaturas em equipamentos e processos térmicos." },
  "43": { title: "Máquinas e Equipamentos de Obra", description: "Equipamentos mecânicos, elétricos, hidráulicos ou motorizados utilizados na execução, movimentação e apoio às obras." },
  "44": { title: "Aquecimento de Água e Sistemas Térmicos", description: "Equipamentos e componentes destinados ao aquecimento, armazenamento e distribuição de água quente e energia térmica." },
  "45": { title: "Transporte Vertical e Acessibilidade", description: "Equipamentos e sistemas destinados ao transporte de pessoas e à acessibilidade, incluindo elevadores, plataformas e componentes." },
  "46": { title: "Piscinas, Spas e Tratamento de Água", description: "Equipamentos, componentes, revestimentos e produtos destinados à construção, circulação, filtragem e tratamento de água de piscinas e spas." },
  "47": { title: "Fachadas, Brises e Revestimentos Técnicos", description: "Sistemas e componentes externos destinados à proteção, acabamento, controle solar e desempenho técnico de fachadas." },
};
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
      <Typography sx={catalogSectionTitleSx}>Explore por segmento</Typography>

      <Stack direction="row" alignItems="center" gap={.45} sx={{ mr: { xs: 0, md: 6, xl: 0 } }}>
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
        gap: compactMobile ? { xs: .55, sm: .65, md: 1.15, xl: 1.6 } : { xs: 1.35, sm: 1.6, md: 1.15, xl: 1.6 },
        overflowX: "auto",
        py: compactMobile ? { xs: .12, md: .45, xl: .8 } : { xs: .8, md: .45, xl: .8 },
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
        const help = code ? segmentHelp[code] : undefined;
        const helpText = help
          ? `${help.title}. ${help.description}`
          : code
            ? `${name}: segmento do catálogo técnico de materiais.`
            : "Exibe todos os segmentos do catálogo sem aplicar filtro.";

        return <ButtonBase
          key={code}
          data-segment-code={code}
          aria-label={name}
          aria-pressed={active}
          onClick={() => onSelect(code === selected ? "" : code)}
          sx={{
            position: "relative",
            width: compactMobile ? { xs: 82, sm: 88, md: 68, xl: 78 } : { xs: 78, md: 68, xl: 78 },
            minWidth: compactMobile ? { xs: 82, sm: 88, md: 68, xl: 78 } : undefined,
            minHeight: compactMobile ? { xs: 36, md: 78, xl: 94 } : { xs: 94, md: 78, xl: 94 },
            flexShrink: 0,
            display: "flex",
            flexDirection: compactMobile ? { xs: "row", md: "column" } : "column",
            alignItems: "center",
            justifyContent: { xs: "flex-start", md: "center" },
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
            borderRadius: compactMobile ? { xs: "6px", md: "50%" } : "50%",
            display: "grid", placeItems: "center",
            color: active ? "#174a39" : "#3f6759",
            background: active ? "linear-gradient(145deg,#f1f8f5,#e4f0ec)" : "linear-gradient(145deg,#f2f7f5,#e8f1ee)",
            border: "1px solid", borderColor: active ? "rgba(0,107,79,.20)" : "rgba(0,107,79,.075)",
            boxShadow: "none", transition: "background-color 180ms,border-color 180ms,transform 180ms",
            "& > svg": { width: compactMobile ? { xs: 13, md: 24, lg: 26, xl: 28 } : catalogCategoryIconSize, height: compactMobile ? { xs: 13, md: 24, lg: 26, xl: 28 } : catalogCategoryIconSize },
            "@media (prefers-reduced-motion: reduce)": { transition: "none" }
          }}>
            <Icon size={compactMobile ? 13 : 28} weight="duotone" aria-hidden="true" />
            {active && !compactMobile && <Box aria-hidden="true" sx={{
              position: "absolute", right: -2, bottom: -1,
              width: { xs: 16, md: 14, xl: 16 }, height: { xs: 16, md: 14, xl: 16 },
              borderRadius: "50%", bgcolor: "#ecf7f3", color: "#275d4b", border: "2px solid #f7f9f8",
              display: "grid", placeItems: "center"
            }}><Check size={10} weight="bold" /></Box>}
          </Box>

          <Typography component="span" sx={{
            fontSize: compactMobile ? { xs: 7.8, sm: 8, md: 10, xl: 11 } : { xs: 11, md: 10, xl: 11 },
            lineHeight: compactMobile ? 1 : 1.3,
            fontWeight: active ? 700 : 550,
            color: active ? "#174a39" : "#63776f",
            textAlign: compactMobile ? { xs: "left", md: "center" } : "center",
            minWidth: 0,
            flex: compactMobile ? { xs: 1, md: "initial" } : "initial",
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: compactMobile ? { xs: "nowrap", md: "normal" } : "normal",
            pr: 0,
          }}>{code ? labels[code] || name : "Todos"}</Typography>

          <Tooltip arrow enterTouchDelay={0} leaveTouchDelay={3200} title={helpText}>
            <Box component="span" role="img" aria-label={`Sobre ${code ? labels[code] || name : "todos os segmentos"}`}
              onClick={event => { event.preventDefault(); event.stopPropagation(); }}
              sx={{
                position: "absolute", top: 2, right: 0,
                width: 18, height: 18,
                borderRadius: "50%", display: compactMobile ? { xs: "none", md: "grid" } : "grid", placeItems: "center",
                color: "#5e7d72", bgcolor: "rgba(255,255,255,.88)",
                border: "1px solid rgba(0,107,79,.11)",
                cursor: "help", zIndex: 2,
              }}>
              <HelpOutlineRoundedIcon sx={{ fontSize: 12 }} />
            </Box>
          </Tooltip>
        </ButtonBase>;
      })}
    </Box>
  </Box>;
}
