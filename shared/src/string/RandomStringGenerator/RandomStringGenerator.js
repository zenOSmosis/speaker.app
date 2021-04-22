/**
 * Borrowed from this idea: https://perchance.org/owh9gelu4t#edit
 */
export default class RandomStringGenerator {
  /**
   * @param {string} wordList
   * @return {Object}
   */
  static parseWordList(wordList) {
    const sections = {};

    let section = null;

    let lineNo = 0;
    for (const line of wordList.split("\n")) {
      ++lineNo;

      const trimmedLength = line.trim().length;
      const untrimmedLength = line.length;

      // Skip empty lines
      if (!trimmedLength || line.startsWith("#")) {
        continue;
      }

      if (trimmedLength === untrimmedLength) {
        section = {
          phrases: [],
        };

        sections[line.trim()] = section;
      } else {
        if (!section) {
          throw new TypeError(`Invalid line on number ${lineNo}`);
        }

        section.phrases.push(line.trim());
      }
    }

    return sections;
  }

  /**
   * @param {string} wordList
   * @param {string} template
   */
  constructor(wordList, template) {
    this._parsed = RandomStringGenerator.parseWordList(wordList);

    this._template = template;
    this._templateMatches = this._template.match(/\[.*?\]/g);
  }

  /**
   * @return {string}
   */
  generate() {
    let outputString = this._template;

    for (const match of this._templateMatches) {
      // TODO: Replace w/ regex
      const section = this._parsed[match.replace("[", "").replace("]", "")];

      outputString = outputString.replace(
        match,
        section.phrases[Math.floor(Math.random() * section.phrases.length)]
      );
    }

    return outputString;
  }
}
