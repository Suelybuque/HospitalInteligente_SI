export type Theme = "dark" | "light";

export function initTheme(): Theme {
    const saved = (localStorage.getItem("hutomi-theme") ?? "dark") as Theme;
    document.documentElement.dataset.theme = saved;
    return saved;
}

export function toggleTheme(): Theme {
    const current = (document.documentElement.dataset.theme ?? "dark") as Theme;
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("hutomi-theme", next);
    return next;
}
