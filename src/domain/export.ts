import type { Composition } from "./composition";
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
export function compositionCsv(compositions: Composition[]): string {
  return '\uFEFF' + [["Composição", "Material", "Fornecedor", "Unidade", "Quantidade", "Preço unitário", "Subtotal"], ...compositions.flatMap(c => c.items.map(i => [c.name, i.name, i.supplier, i.unit, i.quantity, i.unitPrice, Math.round(i.quantity * i.unitPrice * 100) / 100]))].map(row => row.map(csvCell).join(";")).join("\r\n");
}
export function downloadCompositions(compositions: Composition[]) {
  const url = URL.createObjectURL(new Blob([compositionCsv(compositions)], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "composicoes.csv"; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
