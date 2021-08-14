/**
 * TODO: Move this to PhantomCore as a static method (or equiv) so that the
 * logger can use this.
 *
 * Determines if the current React environment is a development environment.
 *
 * @return {boolean}
 */
export default function getIsDevelopmentMode() {
  return process.env.NODE_ENV === "development";
}
