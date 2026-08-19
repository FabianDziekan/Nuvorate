export function ThemeScript() {
  const script = `
    (function () {
      try {
        var appPaths = ["/dashboard", "/reviews", "/analysis", "/responses", "/author-verification", "/nfc", "/notifications", "/settings"];
        var pathname = window.location.pathname;
        var isAppRoute = appPaths.some(function (path) {
          return pathname === path || pathname.indexOf(path + "/") === 0;
        });
        var isDark = isAppRoute && window.localStorage.getItem("nuvorate-theme") === "dark";
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
