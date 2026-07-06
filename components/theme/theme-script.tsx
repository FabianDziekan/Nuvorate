export function ThemeScript() {
  const script = `
    (function () {
      try {
        var theme = window.localStorage.getItem("nuvorate-theme");
        var isDark = theme === "dark";
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.classList.toggle("light", !isDark);
        document.documentElement.style.colorScheme = isDark ? "dark" : "light";
      } catch (error) {
        document.documentElement.classList.add("light");
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
