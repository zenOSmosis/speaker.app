import faker from "faker";

/**
 * Generates a random first and last name as a single string.
 *
 * i.e. "{first_name} {last_name}"
 *
 * @return {string}
 */
export default function generateName() {
  return `${faker.name.firstName()} ${faker.name.lastName()}`;
}
