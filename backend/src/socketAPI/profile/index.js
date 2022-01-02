import fs from "fs";
import path from "path";
import RandomStringGenerator from "@shared/string/RandomStringGenerator";
import axios from "axios";
import faker from "faker";

// TODO: Document
export async function generateAvatar({
  string = new Date().getTime(),
  engine = "male8bit",
  size = 200,
}) {
  try {
    const avatar = await axios.get(
      // TODO: Replace hardcoded config
      `http://avatar_server:3000?engine=${encodeURIComponent(
        engine
      )}&string=${encodeURIComponent(string)}&size=${parseInt(
        size,
        10
      )}&outputType=base64`
    );

    // Base64 representation of avatar
    return avatar.data;
  } catch (err) {
    console.error(err);

    throw new Error("An error occurred when trying to generate the avatar");
  }
}

// TODO: Rename to generateRandomName?
// TODO: Document
export function generateName() {
  return `${faker.name.firstName()} ${faker.name.lastName()}`;
}

const descriptionWordList = fs
  .readFileSync(path.resolve(__dirname, "descriptionWordList.txt"))
  .toString();

const descriptionTemplate =
  "🚀  [adj] [job] 📈 [jobdescbase] [field] and [field] 🤩 [action] [celebrity] [location] once 🗣 [field]/[field]/[field] 💪 [moti1] [moti2] [moti3] that drive [moti4]";

// TODO: Rename to generateRandomDescription?
// TODO: Document
export function generateDescription() {
  const generator = new RandomStringGenerator(
    descriptionWordList,
    descriptionTemplate
  );

  return generator.generate();
}
