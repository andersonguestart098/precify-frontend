import type { Composition } from "./composition";
import type { LaborPlan, Project } from "../services/api";

export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}

export function compositionCsv(compositions: Composition[]): string {
  return "\uFEFF" + [["Composição", "Material", "Fornecedor", "Unidade", "Quantidade", "Preço unitário", "Subtotal"], ...compositions.flatMap(c => c.items.map(i => [c.name, i.name, i.supplier, i.unit, i.quantity, i.unitPrice, Math.round(i.quantity * i.unitPrice * 100) / 100]))].map(row => row.map(csvCell).join(";")).join("\r\n");
}

function safeFileName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "obra";
}

function downloadCsv(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCompositions(compositions: Composition[]) {
  downloadCsv(compositionCsv(compositions), "composicoes.csv");
}

export function projectSnapshotCsv(project: Project, compositions: Composition[], laborPlan?: LaborPlan): string {
  const rows: unknown[][] = [
    [
      "Tipo", "Obra", "ID da obra",
      "Composição", "ID composição", "Criada em", "Atualizada em",
      "Item / necessidade", "ID item", "Código material / M.O.", "ID produto", "Imagem",
      "Fornecedor", "Unidade", "Quantidade", "Preço unitário", "Subtotal",
      "Origem M.O.", "Fonte M.O.", "Modo M.O.", "Atualização M.O.",
    ],
    [
      "RESUMO", project.name, project.id,
      "", "", "", "",
      "", "", "", "", "",
      "", "", "", "", compositions.reduce((sum, composition) => sum + composition.total, 0),
      "", "", laborPlan?.mode ?? "", laborPlan?.updatedAt ?? "",
    ],
  ];

  for (const composition of compositions) {
    rows.push([
      "COMPOSIÇÃO", project.name, project.id,
      composition.name, composition.id, composition.createdAt, composition.updatedAt,
      "", "", "", "", "",
      "", "", "", "", composition.total,
      "", "", "", "",
    ]);

    if (!composition.items.length) {
      rows.push([
        "ITEM COMPOSIÇÃO", project.name, project.id,
        composition.name, composition.id, composition.createdAt, composition.updatedAt,
        "Sem itens", "", "", "", "",
        "", "", "", "", 0,
        "", "", "", "",
      ]);
      continue;
    }

    for (const item of composition.items) {
      rows.push([
        "ITEM COMPOSIÇÃO", project.name, project.id,
        composition.name, composition.id, composition.createdAt, composition.updatedAt,
        item.name, item.id, item.materialCode, item.productId ?? "", item.imageUrl ?? "",
        item.supplier ?? "", item.unit, item.quantity, item.unitPrice,
        Math.round(item.quantity * item.unitPrice * 100) / 100,
        "", "", "", "",
      ]);
    }
  }

  if (laborPlan?.items.length) {
    for (const item of laborPlan.items) {
      rows.push([
        "MÃO DE OBRA", project.name, project.id,
        "", "", "", "",
        item.title, "", item.code, "", "",
        "", "", "", "", "",
        item.origin, item.source, laborPlan.mode, laborPlan.updatedAt ?? "",
      ]);
    }
  } else {
    rows.push([
      "MÃO DE OBRA", project.name, project.id,
      "", "", "", "",
      "Nenhuma mão de obra vinculada", "", "", "", "",
      "", "", "", "", "",
      "", "", laborPlan?.mode ?? "", laborPlan?.updatedAt ?? "",
    ]);
  }

  return "\uFEFF" + rows.map(row => row.map(csvCell).join(";")).join("\r\n");
}

export function downloadProjectSnapshot(project: Project, compositions: Composition[], laborPlan?: LaborPlan) {
  downloadCsv(projectSnapshotCsv(project, compositions, laborPlan), `obra-${safeFileName(project.name)}.csv`);
}
