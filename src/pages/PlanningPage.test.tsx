import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PlanningPage from "./PlanningPage";
import { SessionContext } from "../auth/session";
import type { Project } from "../services/api";
import * as api from "../services/api";

vi.mock("../services/api", async importOriginal => {
  const actual = await importOriginal<typeof import("../services/api")>();
  return { ...actual, listProjects: vi.fn(), listCompositions: vi.fn(), getLaborPlan: vi.fn(),
    saveProject: vi.fn(), workspaceFavorites: vi.fn() };
});

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Vínculo de composições na obra", () => {
  it("abre somente o seletor e preserva os demais dados ao salvar", async () => {
    const project: Project = { id: "p1", name: "Venda", projectType: "COMERCIAL", location: "Porto Alegre",
      notes: "Observação da obra", compositionIds: ["c1"] };
    vi.mocked(api.listProjects).mockResolvedValue([project]);
    vi.mocked(api.listCompositions).mockResolvedValue([
      { id: "c1", name: "Composição atual", total: 0, items: [], createdAt: "", updatedAt: "" },
      { id: "c2", name: "Nova composição", total: 0, items: [], createdAt: "", updatedAt: "" },
    ]);
    vi.mocked(api.getLaborPlan).mockResolvedValue({ projectId: "p1", mode: "", items: [] });
    vi.mocked(api.workspaceFavorites).mockResolvedValue({ WORK: [], LABOR: [], COMPOSITION: [] });
    vi.mocked(api.saveProject).mockResolvedValue({ ...project, compositionIds: ["c1", "c2"] });

    render(<SessionContext.Provider value={{
      user: { id: "planning-link-test", name: "Anderson", email: "demo@example.test", role: "ADMIN" },
      checking: false, error: null, signIn: vi.fn(), signOut: vi.fn(), retry: vi.fn(),
    }}><MemoryRouter initialEntries={["/obras"]}>
      <Routes><Route path="/obras" element={<PlanningPage />} /></Routes>
    </MemoryRouter></SessionContext.Provider>);

    fireEvent.click(await screen.findByText("Venda", { selector: ".MuiTypography-root" }));
    expect(screen.queryByRole("button", { name: "Explorar produtos" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Adicionar produtos à composição" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Vincular composição à obra Venda" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.queryByRole("textbox", { name: "Nome da obra" })).toBeNull();
    const picker = screen.getByRole("combobox", { name: "Composições" });
    fireEvent.change(picker, { target: { value: "Nova" } });
    fireEvent.click(await screen.findByRole("option", { name: "Nova composição" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar vínculos" }));
    await waitFor(() => expect(api.saveProject).toHaveBeenCalledWith({
      name: "Venda", projectType: "COMERCIAL", location: "Porto Alegre", notes: "Observação da obra",
      compositionIds: ["c1", "c2"],
    }, "p1"));
  });
});
