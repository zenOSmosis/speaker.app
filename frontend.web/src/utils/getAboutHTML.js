/**
 * Returns the about information as obtained from the underlying HTML document.
 *
 * @return {string}
 */
export default function getAboutHTML() {
  const aboutHTML = window.__aboutHTML;

  if (!aboutHTML) {
    console.error("Unable to obtain aboutHTML");
  }

  return aboutHTML;
}
