/**
 * Determines if the current React environment is a development environment.
 *
 * @return {boolean}
 */
export default function getIsDevelopmentMode() {
  return process.env.NODE_ENV === "development";
}
