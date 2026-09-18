export type LaborSource = "TEAM" | "THIRD_PARTY";
export type LaborOrigin = LaborSource | "BOTH";

export interface LaborCatalogItem {
  code: string;
  title: string;
  section?: string;
}

export interface LaborCatalogGroup {
  code: string;
  title: string;
  subtitle?: string;
  items: LaborCatalogItem[];
}

const items = (rows: Array<[string, string, string?]>): LaborCatalogItem[] =>
  rows.map(([code, title, section]) => ({ code, title, ...(section ? { section } : {}) }));

export const laborTeamGroups: LaborCatalogGroup[] = [
  {
    code: "MO.1.1",
    title: "Gestão",
    subtitle: "Projeto, planejamento e responsabilidade técnica",
    items: items([
      ["MO.1.1.01", "Engenheiro Civil"],
      ["MO.1.1.02", "Arquiteto"],
      ["MO.1.1.03", "Engenheiro de Segurança do Trabalho"],
      ["MO.1.1.04", "Técnico em Edificações"],
      ["MO.1.1.05", "Engenheiro Eletricista"],
      ["MO.1.1.06", "Engenheiro Mecânico"],
      ["MO.1.1.07", "Engenheiro de Sistemas / Telefonia"],
      ["MO.1.1.08", "Engenheiro de Segurança contra Incêndio"],
    ]),
  },
  {
    code: "MO.1.2",
    title: "Supervisão",
    subtitle: "Coordenação das frentes no canteiro",
    items: items([
      ["MO.1.2.01", "Encarregado Geral / Mestre de Obras"],
      ["MO.1.2.02", "Encarregado de Sistemas Especializados"],
    ]),
  },
  {
    code: "MO.1.3",
    title: "Execução",
    subtitle: "Serviços operacionais e especializados",
    items: items([
      ["MO.1.3.01", "Pedreiro", "Estrutura e Alvenaria"],
      ["MO.1.3.02", "Carpinteiro", "Estrutura e Alvenaria"],
      ["MO.1.3.03", "Armador (Ferreiro)", "Estrutura e Alvenaria"],
      ["MO.1.3.04", "Concreteiro / Betoneiro", "Estrutura e Alvenaria"],
      ["MO.1.3.05", "Montador de Estruturas Metálicas", "Estrutura e Alvenaria"],
      ["MO.1.3.06", "Azulejista / Ladrilhador", "Acabamentos / Revestimentos"],
      ["MO.1.3.07", "Pintor", "Acabamentos / Revestimentos"],
      ["MO.1.3.08", "Gesseiro", "Acabamentos / Revestimentos"],
      ["MO.1.3.09", "Marmorista / Graniteiro", "Acabamentos / Revestimentos"],
      ["MO.1.3.10", "Vidraceiro", "Acabamentos / Revestimentos"],
      ["MO.1.3.11", "Telhadista", "Acabamentos / Revestimentos"],
      ["MO.1.3.12", "Serralheiro", "Acabamentos / Revestimentos"],
      ["MO.1.3.13", "Funileiro", "Acabamentos / Revestimentos"],
      ["MO.1.3.14", "Encanador", "Instalações Hidrossanitárias e Gás"],
      ["MO.1.3.15", "Instalador de Gás", "Instalações Hidrossanitárias e Gás"],
      ["MO.1.3.16", "Hidráulico", "Instalações Hidrossanitárias e Gás"],
      ["MO.1.3.17", "Eletricista de Baixa Tensão", "Instalações Elétricas"],
      ["MO.1.3.18", "Eletricista de Média Tensão", "Instalações Elétricas"],
      ["MO.1.3.19", "Eletricista de Alta Tensão", "Instalações Elétricas"],
      ["MO.1.3.20", "Eletrotécnico", "Instalações Elétricas"],
    ]),
  },
  {
    code: "MO.1.4",
    title: "Apoio",
    subtitle: "Suporte às frentes de trabalho e ao canteiro",
    items: items([
      ["MO.1.4.01", "Ajudante de Obra / Servente"],
      ["MO.1.4.02", "Motorista"],
      ["MO.1.4.03", "Ajudante de Sistemas Especializados"],
      ["MO.1.4.04", "Almoxarife"],
      ["MO.1.4.05", "Vigia / Porteiro de Obra"],
    ]),
  },
];

export const laborThirdPartyPhases: LaborCatalogGroup[] = [
  {
    code: "MO.2.1",
    title: "Preliminares",
    items: items([
      ["MO.2.1.01", "Sondagem e Geotecnia"],
      ["MO.2.1.02", "Topografia e Agrimensura"],
      ["MO.2.1.03", "Terraplenagem e Escavação"],
      ["MO.2.1.04", "Fundações Especiais e Contenções"],
      ["MO.2.1.05", "Segurança, Laudos e Consultorias"],
    ]),
  },
  {
    code: "MO.2.2",
    title: "Estrutura",
    items: items([
      ["MO.2.2.01", "Concreto e Bombeamento"],
      ["MO.2.2.02", "Armação e Fôrmas"],
      ["MO.2.2.03", "Estruturas Pré-Moldadas"],
      ["MO.2.2.04", "Estruturas Metálicas e Montagem"],
      ["MO.2.2.05", "Impermeabilização Estrutural"],
    ]),
  },
  {
    code: "MO.2.3",
    title: "Instalações",
    items: items([
      ["MO.2.3.01", "Instalações Elétricas e SPDA"],
      ["MO.2.3.02", "Hidrossanitário e Gás"],
      ["MO.2.3.03", "Combate a Incêndio"],
      ["MO.2.3.04", "Climatização, Ventilação e Exaustão"],
      ["MO.2.3.05", "Refrigeração / Frio Alimentar"],
      ["MO.2.3.06", "Energia Solar e Eficiência Energética"],
      ["MO.2.3.07", "Transporte Vertical"],
      ["MO.2.3.08", "Automação, Dados, CFTV e Telecom"],
    ]),
  },
  {
    code: "MO.2.4",
    title: "Vedações / Fachadas",
    items: items([
      ["MO.2.4.01", "Alvenaria e Painéis"],
      ["MO.2.4.02", "Drywall, Forros e Sistemas Leves"],
      ["MO.2.4.03", "Fachadas e Envelopamento"],
      ["MO.2.4.04", "Esquadrias e Vidraçaria"],
      ["MO.2.4.05", "Coberturas, Calhas e Rufos"],
    ]),
  },
  {
    code: "MO.2.5",
    title: "Acabamentos / Interiores",
    items: items([
      ["MO.2.5.01", "Revestimentos e Marmoraria"],
      ["MO.2.5.02", "Pisos Especiais e Industriais"],
      ["MO.2.5.03", "Pintura e Tratamento de Superfícies"],
      ["MO.2.5.04", "Marcenaria e Serralheria Fina"],
      ["MO.2.5.05", "Comunicação Visual"],
    ]),
  },
  {
    code: "MO.2.6",
    title: "Logística / Apoio / Encerramento",
    items: items([
      ["MO.2.6.01", "Andaimes, Escoramentos e Acesso"],
      ["MO.2.6.02", "Içamento e Movimentação de Cargas"],
      ["MO.2.6.03", "Gestão de Resíduos"],
      ["MO.2.6.04", "Limpeza Pós-Obra"],
      ["MO.2.6.05", "Paisagismo e Urbanização"],
      ["MO.2.6.06", "Pavimentação e Infraestrutura Externa"],
    ]),
  },
];

export const laborCatalogByCode = new Map(
  [...laborTeamGroups, ...laborThirdPartyPhases].flatMap(group =>
    group.items.map(item => [item.code, item] as const)
  )
);
