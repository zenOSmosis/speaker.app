import fs from "fs";
import path from "path";
import RandomStringGenerator from "@shared/string/RandomStringGenerator";

const descriptionWordList = fs
  .readFileSync(path.resolve(__dirname, "descriptionWordList.txt"))
  .toString();

const descriptionTemplate =
  "🚀  [adj] [job] 📈 [jobdescbase] [field] and [field] 🤩 [action] [celebrity] [location] once 🗣 [field]/[field]/[field] 💪 [moti1] [moti2] [moti3] that drive [moti4]";

/**
 * Generates a random profile description.
 *
 * @return {string}
 */
export default function generateDescription() {
  const generator = new RandomStringGenerator(
    descriptionWordList,
    descriptionTemplate
  );

  return generator.generate();
}
