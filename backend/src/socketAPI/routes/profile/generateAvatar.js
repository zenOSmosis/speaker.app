import axios from "axios";

// TODO: Document
export default async function generateAvatar({
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
