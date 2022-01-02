import faker from "faker";

// TODO: Rename to generateRandomName?
// TODO: Document
export default function generateName() {
  return `${faker.name.firstName()} ${faker.name.lastName()}`;
}
