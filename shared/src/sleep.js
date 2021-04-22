/**
 * @param {number} time? [default = 1000] Milliseconds worth of sleep time.
 * @return {Promise<void>} Resolves when sleep cycle has finished
 */
export default async function sleep(time = 1000) {
  await new Promise((resolve) => setTimeout(resolve, time));
}
