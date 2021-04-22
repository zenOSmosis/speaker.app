import RandomStringGenerator from "./RandomStringGenerator";

describe("RandomStringGenerator", () => {
  it("Parses word list", () => {
    const parsed = RandomStringGenerator.parseWordList(wordList);

    expect(Object.values(parsed).length).toEqual(14);

    for (const section of Object.values(parsed)) {
      expect(Array.isArray(section.phrases)).toEqual(true);
    }
  });

  it("Throws on invalid comment format", () => {
    expect(() => RandomStringGenerator.parseWordList(badCommentList)).toThrow();
  });

  it("Generates unique, random strings", () => {
    const generator = new RandomStringGenerator(
      wordList,
      "🚀 [number]X [adj] [job] 📈 Working on the intersection of [field] and [field] 🤩 [action] [celebrity] [location] once 🗣 [field]/[field]/[field] 💪 [moti1] [moti2] [moti3] that drive [moti4]"
    );

    const strings = [...new Array(5)].map(() => generator.generate());

    expect([...new Set(strings)].length).toBe(5);
  });
});

const badCommentList = `
# Good comment format
  # bad comment format
`;

const wordList = `

# Some sort of comment 

number
  2
  3
  4
  5

adj
  Self-made
  Inspiring
  Aspiring
  Professional
  Amateur
  Self-taught
  Angry
  Attractive
  Muscular

  

job
  Billionaire
  Trust Fund Kid
  Investor
  Day Trader
  Millenial
  Marketing Manager
  Strategist
  Planner
  Thought Leader
  Entrepeneur

  

field
  Crypto
  Bitcoin
  Ethereum
  Bullshit
  Dogecoin
  Tech
  Music
  Millionaire Mindsets
  
  
quote
  Your limitation — it’s only your imagination
  Push yourself, because no one else is going to do it for you
  Sometimes later becomes never. Do it now
  Great things never come from comfort zones
  Dream it. Wish it. Do it.
  Success doesn’t just find you. You have to go out and get it.
  The harder you work for something, the greater you’ll feel when you achieve it.
  Dream bigger. Do bigger.

  

action
  Met
  Saw
  Locked eyes with
  Shared ideas with
  Compared notes with
  Followed around
  Almost approached

  
celebrity
  Elon Musk
  Tom Brady
  The Weeknd
  Billie Eilish
  Zuck
  Drake
  Bezos
  Kim & Kanye
  the Jonas Brothers
  Harry Styles
  
  
location
  in Whole Foods
  in Walmart
  in Starbucks
  at Coachella
  at Home Depot
  at Costco

  

movement
  An Introduction to
  The Rise of
  The Fall of
  The End of

  
moti1
  Making
  Manifesting
  Creating
  Inspiring


moti2
  meaningful
  significant
  relevant

  
moti3
  connections
  relationships

  
moti4
  impact
  influence
  significance
  results


pub
  in Forbes
  in Billboard
  in I Love Cats Magazine
  in I Love Dogs Magazine

`;
