import { DEFAULT_THEME, STORAGE_KEY, THEME_CLASS } from "@/lib/theme";

/**
 * The no-flash script.
 *
 * <body> is server-rendered with the default theme's class, because the server
 * cannot know what this reader chose. If the swap to a stored theme waited for
 * React to hydrate, a reader who picked Vibrant would see a dark page first and
 * watch it change — on every navigation, for as long as they used the site.
 *
 * So the swap happens in a blocking inline script placed as the first child of
 * <body>: it runs after <body> exists and before the browser has painted
 * anything inside it, which is the only window where the class can change
 * without being seen. It is deliberately not a <Script> component — those defer
 * by design, and deferring is precisely the bug.
 *
 * Wrapped in try/catch because localStorage throws rather than returning null
 * in Safari's private mode and under some cookie-blocking settings. The catch
 * is empty on purpose: the correct fallback is the class already in the HTML.
 */
export default function ThemeScript() {
  const js = `try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(t&&t!==${JSON.stringify(
    DEFAULT_THEME,
  )}){var c=${JSON.stringify(THEME_CLASS)};if(c[t]){document.body.className=document.body.className.replace(${JSON.stringify(
    THEME_CLASS[DEFAULT_THEME],
  )},c[t])}}}catch(e){}`;

  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}
