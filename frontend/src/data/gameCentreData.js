// ─────────────────────────────────────────────────────────────────────────
// Game Centre data
//
// Everything the Games tab needs is defined here as plain JS data, driving
// a small set of reusable "engines" (generic React components). Adding a
// new game is just adding one more entry to GAMES below — no new backend
// endpoints, no bespoke component per game.
//
// Engines used:
//   - memory    -> MemoryMatchGame.jsx   (flip-card concept pairs)
//   - sequence  -> SequenceRecallGame.jsx (Simon-says style recall)
//   - mathsprint-> MathSprintGame.jsx    (timed mental-maths sprint)
//   - scramble  -> WordScrambleGame.jsx  (anagram solver)
//   - mc        -> MCRoundsGame.jsx      (generic multiple-choice rounds —
//                  powers logic grid puzzles, odd-one-out, number
//                  sequences, word association, and spatial reasoning)
//   - sudoku    -> SudokuLiteGame.jsx    (4x4 / 6x6 mini sudoku)
//   - reaction  -> ReactionGame.jsx      (timed find-the-target attention game)
//   - external  -> an existing, untouched game component (Phonics Match,
//                  Quiz Sprint) rendered as-is.
//
// The total count of playable games is asserted at the bottom of this file
// (TOTAL_GAMES) and must stay >= 50.
// ─────────────────────────────────────────────────────────────────────────

import { randInt, numericOptions, sample } from '../utils/gameUtils.js';

export const CATEGORIES = [
  { id: 'memory', label: 'Memory Match', emoji: '🧠', desc: 'Flip cards and find the matching pairs.' },
  { id: 'sequence', label: 'Pattern Recall', emoji: '🔁', desc: 'Watch the pattern, then repeat it back — Simon-says style.' },
  { id: 'mathsprint', label: 'Math Sprint', emoji: '➕', desc: 'Solve as many mental-maths problems as you can before time runs out.' },
  { id: 'scramble', label: 'Word Scramble', emoji: '🔤', desc: 'Unscramble the jumbled letters to find the hidden word.' },
  { id: 'logicgrid', label: 'Logic Grid Puzzles', emoji: '🕵️', desc: 'Use the clues to deduce the one correct answer.' },
  { id: 'oddoneout', label: 'Odd One Out', emoji: '🔍', desc: 'Spot the item that does not belong with the rest.' },
  { id: 'numseq', label: 'Number Sequences', emoji: '🔢', desc: 'Work out the pattern and find the next number.' },
  { id: 'sudoku', label: 'Sudoku Lite', emoji: '🧩', desc: 'Easier 4x4 and 6x6 sudoku grids — no repeats in any row, column, or box.' },
  { id: 'vocab', label: 'Word Association', emoji: '📚', desc: 'Match words to their synonyms, antonyms, and definitions.' },
  { id: 'spatial', label: 'Spatial Reasoning', emoji: '📐', desc: 'Rotations, mirror images, and grid positions.' },
  { id: 'reaction', label: 'Reaction & Attention', emoji: '⚡', desc: 'Find the target as fast as you can before the clock runs out.' },
  { id: 'classic', label: 'Classic Word Games', emoji: '🎮', desc: 'The original Games tab favourites.' },
];

// ── Memory Match: themed concept-pair sets ─────────────────────────────────
// Each pair is [cardA, cardB] — the two cards don't have to be identical
// text, just conceptually matched (e.g. a flag emoji and its country name).
const MEMORY_SETS = [
  {
    id: 'memory-animals',
    title: 'Animal Friends',
    blurb: 'Match each animal to its name.',
    pairs: [
      ['🐶', 'Dog'], ['🐱', 'Cat'], ['🐭', 'Mouse'],
      ['🐹', 'Hamster'], ['🐰', 'Rabbit'], ['🦊', 'Fox'],
    ],
  },
  {
    id: 'memory-fruits',
    title: 'Fruit Basket',
    blurb: 'Match each fruit emoji to its name.',
    pairs: [
      ['🍎', 'Apple'], ['🍌', 'Banana'], ['🍇', 'Grapes'],
      ['🍓', 'Strawberry'], ['🍍', 'Pineapple'], ['🍒', 'Cherry'],
    ],
  },
  {
    id: 'memory-flags',
    title: 'Flags of the World',
    blurb: 'Match each flag to its country.',
    pairs: [
      ['🇺🇸', 'USA'], ['🇬🇧', 'UK'], ['🇫🇷', 'France'],
      ['🇯🇵', 'Japan'], ['🇮🇳', 'India'], ['🇧🇷', 'Brazil'],
    ],
  },
  {
    id: 'memory-shapes',
    title: 'Shape Sorter',
    blurb: 'Match each shape to its name.',
    pairs: [
      ['⭐', 'Star'], ['⚪', 'Circle'], ['⬛', 'Square'],
      ['🔺', 'Triangle'], ['❤️', 'Heart'], ['🔶', 'Diamond'],
    ],
  },
  {
    id: 'memory-numbers',
    title: 'Number Words',
    blurb: 'Match each digit to the word for it.',
    pairs: [
      ['7', 'Seven'], ['3', 'Three'], ['9', 'Nine'],
      ['1', 'One'], ['5', 'Five'], ['2', 'Two'],
    ],
  },
  {
    id: 'memory-letters',
    title: 'Upper & Lower Case',
    blurb: 'Match each capital letter to its lowercase partner.',
    pairs: [
      ['A', 'a'], ['B', 'b'], ['C', 'c'],
      ['D', 'd'], ['E', 'e'], ['F', 'f'],
    ],
  },
  {
    id: 'memory-space',
    title: 'Out in Space',
    blurb: 'Match each space emoji to its name.',
    pairs: [
      ['🌞', 'Sun'], ['🌍', 'Earth'], ['🌕', 'Moon'],
      ['🪐', 'Saturn'], ['☄️', 'Comet'], ['🚀', 'Rocket'],
    ],
  },
  {
    id: 'memory-capitals',
    title: 'World Capitals',
    blurb: 'Match each country to its capital city.',
    pairs: [
      ['France', 'Paris'], ['Japan', 'Tokyo'], ['India', 'New Delhi'],
      ['Italy', 'Rome'], ['Egypt', 'Cairo'], ['Canada', 'Ottawa'],
    ],
  },
  {
    id: 'memory-instruments',
    title: 'Musical Instruments',
    blurb: 'Match each instrument emoji to its name.',
    pairs: [
      ['🎸', 'Guitar'], ['🎹', 'Piano'], ['🥁', 'Drums'],
      ['🎻', 'Violin'], ['🎺', 'Trumpet'], ['🎷', 'Saxophone'],
    ],
  },
  {
    id: 'memory-solarsystem',
    title: 'Solar System Order',
    blurb: 'Match each planet to its position from the Sun.',
    pairs: [
      ['Mercury', '1st from the Sun'], ['Venus', '2nd from the Sun'],
      ['Earth', '3rd from the Sun'], ['Mars', '4th from the Sun'],
      ['Jupiter', '5th from the Sun'], ['Saturn', '6th from the Sun'],
    ],
  },
];

// ── Pattern / Sequence Recall: Simon-says tile sets ────────────────────────
const SEQUENCE_SETS = [
  {
    id: 'sequence-colours',
    title: 'Colour Sequence',
    blurb: 'Watch the colours light up, then tap them back in the same order.',
    tiles: [
      { id: 'red', label: 'Red', className: 'bg-red-500' },
      { id: 'blue', label: 'Blue', className: 'bg-blue-500' },
      { id: 'green', label: 'Green', className: 'bg-green-500' },
      { id: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
    ],
  },
  {
    id: 'sequence-shapes',
    title: 'Shape Sequence',
    blurb: 'Watch the shapes flash, then tap them back in the same order.',
    tiles: [
      { id: 'star', label: '⭐', className: 'bg-indigo-100' },
      { id: 'circle', label: '⚪', className: 'bg-indigo-100' },
      { id: 'square', label: '⬛', className: 'bg-indigo-100' },
      { id: 'triangle', label: '🔺', className: 'bg-indigo-100' },
    ],
  },
  {
    id: 'sequence-numbers',
    title: 'Number Sequence',
    blurb: 'Watch the numbers light up, then tap them back in the same order.',
    tiles: [
      { id: 'n1', label: '1', className: 'bg-purple-100' },
      { id: 'n2', label: '2', className: 'bg-purple-100' },
      { id: 'n3', label: '3', className: 'bg-purple-100' },
      { id: 'n4', label: '4', className: 'bg-purple-100' },
    ],
  },
];

// ── Math Sprint: generators ────────────────────────────────────────────────
// Each generator takes an optional difficulty tier ('easy' | 'medium' | 'hard')
// that widens the number ranges — 'medium' always matches the original,
// pre-difficulty ranges so default behaviour is unchanged.
const MATH_DIFFICULTY_RANGES = {
  addition: { easy: [1, 20], medium: [1, 50], hard: [1, 200] },
  subtraction: { easy: [5, 20], medium: [10, 60], hard: [20, 300] },
  multiplication: { easy: [2, 6], medium: [2, 12], hard: [4, 20] },
  division: { easy: [2, 6], medium: [2, 12], hard: [4, 20] },
  squares: { easy: [2, 8], medium: [2, 15], hard: [2, 25] },
};
const MATH_DIFFICULTY_FRACTION_POOLS = {
  easy: [4, 5],
  medium: [4, 5, 6, 8, 10],
  hard: [6, 8, 10, 12, 16],
};

function additionQ(difficulty = 'medium') {
  const [lo, hi] = MATH_DIFFICULTY_RANGES.addition[difficulty] || MATH_DIFFICULTY_RANGES.addition.medium;
  const a = randInt(lo, hi), b = randInt(lo, hi);
  const answer = a + b;
  return { question: `${a} + ${b} = ?`, answer: String(answer), options: numericOptions(answer) };
}
function subtractionQ(difficulty = 'medium') {
  const [lo, hi] = MATH_DIFFICULTY_RANGES.subtraction[difficulty] || MATH_DIFFICULTY_RANGES.subtraction.medium;
  const a = randInt(lo, hi), b = randInt(1, a);
  const answer = a - b;
  return { question: `${a} − ${b} = ?`, answer: String(answer), options: numericOptions(answer) };
}
function multiplicationQ(difficulty = 'medium') {
  const [lo, hi] = MATH_DIFFICULTY_RANGES.multiplication[difficulty] || MATH_DIFFICULTY_RANGES.multiplication.medium;
  const a = randInt(lo, hi), b = randInt(lo, hi);
  const answer = a * b;
  return { question: `${a} × ${b} = ?`, answer: String(answer), options: numericOptions(answer, 4, 12) };
}
function divisionQ(difficulty = 'medium') {
  const [lo, hi] = MATH_DIFFICULTY_RANGES.division[difficulty] || MATH_DIFFICULTY_RANGES.division.medium;
  const b = randInt(lo, hi), answer = randInt(lo, hi);
  const a = b * answer;
  return { question: `${a} ÷ ${b} = ?`, answer: String(answer), options: numericOptions(answer, 4, 6) };
}
function mixedQ(difficulty = 'medium') {
  return sample([additionQ, subtractionQ, multiplicationQ, divisionQ])(difficulty);
}
function fractionsQ(difficulty = 'medium') {
  const pool = MATH_DIFFICULTY_FRACTION_POOLS[difficulty] || MATH_DIFFICULTY_FRACTION_POOLS.medium;
  const d = sample(pool);
  const n1 = randInt(1, d - 2);
  const n2 = randInt(1, d - 1 - n1);
  const sum = n1 + n2;
  const answer = `${sum}/${d}`;
  const options = new Set([answer]);
  while (options.size < 4) {
    const fake = randInt(1, d - 1);
    if (fake !== sum) options.add(`${fake}/${d}`);
  }
  return {
    question: `${n1}/${d} + ${n2}/${d} = ?`,
    answer,
    options: [...options].sort(() => Math.random() - 0.5),
  };
}
function squaresRootsQ(difficulty = 'medium') {
  const [lo, hi] = MATH_DIFFICULTY_RANGES.squares[difficulty] || MATH_DIFFICULTY_RANGES.squares.medium;
  if (Math.random() < 0.5) {
    const n = randInt(lo, hi);
    const answer = n * n;
    return { question: `What is ${n}²?`, answer: String(answer), options: numericOptions(answer, 4, 15) };
  }
  const n = randInt(lo, hi);
  const answer = n;
  return { question: `What is √${n * n}?`, answer: String(answer), options: numericOptions(answer, 4, 4) };
}

const MATH_SPRINT_GAMES = [
  { id: 'math-addition', title: 'Addition Sprint', blurb: 'Add two numbers before the clock runs out.', generate: additionQ },
  { id: 'math-subtraction', title: 'Subtraction Sprint', blurb: 'Subtract as fast as you can.', generate: subtractionQ },
  { id: 'math-multiplication', title: 'Multiplication Sprint', blurb: 'Times tables under time pressure.', generate: multiplicationQ },
  { id: 'math-division', title: 'Division Sprint', blurb: 'Quick division facts, no remainders.', generate: divisionQ },
  { id: 'math-mixed', title: 'Mixed Operations Sprint', blurb: 'Addition, subtraction, multiplication, and division all mixed together.', generate: mixedQ },
  { id: 'math-fractions', title: 'Fractions Sprint', blurb: 'Add fractions that share a denominator.', generate: fractionsQ },
  { id: 'math-squares', title: 'Squares & Roots Sprint', blurb: 'Square numbers and square roots.', generate: squaresRootsQ },
];

// ── Word Scramble: themed word lists ───────────────────────────────────────
const SCRAMBLE_SETS = [
  { id: 'scramble-animals', title: 'Animal Anagrams', blurb: 'Unscramble the animal names.', words: ['ELEPHANT', 'GIRAFFE', 'DOLPHIN', 'PENGUIN', 'KANGAROO', 'CHEETAH', 'OCTOPUS', 'SQUIRREL'] },
  { id: 'scramble-countries', title: 'Country Anagrams', blurb: 'Unscramble the country names.', words: ['CANADA', 'BRAZIL', 'JAPAN', 'EGYPT', 'FRANCE', 'KENYA', 'MEXICO', 'NORWAY'] },
  { id: 'scramble-fruits', title: 'Fruit Anagrams', blurb: 'Unscramble the fruit names.', words: ['BANANA', 'ORANGE', 'MANGO', 'PAPAYA', 'LYCHEE', 'APRICOT', 'COCONUT', 'AVOCADO'] },
  { id: 'scramble-subjects', title: 'School Subject Anagrams', blurb: 'Unscramble the school subjects.', words: ['SCIENCE', 'HISTORY', 'GEOGRAPHY', 'GRAMMAR', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS', 'ENGLISH'] },
  { id: 'scramble-sports', title: 'Sports Anagrams', blurb: 'Unscramble the sports.', words: ['FOOTBALL', 'CRICKET', 'TENNIS', 'HOCKEY', 'SWIMMING', 'BADMINTON', 'ARCHERY', 'CYCLING'] },
  { id: 'scramble-space', title: 'Space Anagrams', blurb: 'Unscramble the space words.', words: ['GALAXY', 'PLANET', 'METEOR', 'ASTEROID', 'SATELLITE', 'TELESCOPE', 'ROCKET', 'NEBULA'] },
];

// ── Logic Grid Puzzles (MCRoundsGame data) ─────────────────────────────────
const LOGICGRID_GAMES = [
  {
    id: 'logic-pets', title: 'Pet Owners', blurb: 'Use the clues to work out who owns which pet.',
    rounds: [
      { clues: ['Amy, Ben, and Cara each own a different pet: a cat, a dog, or a fish.', 'Amy does not own the dog or the cat.', 'Ben does not own the cat.'], prompt: 'Who owns the cat?', options: ['Amy', 'Ben', 'Cara'], answer: 'Cara', explanation: 'Clue 2 gives Amy the fish. Clue 3 rules out Ben having the cat, so Ben has the dog, leaving Cara with the cat.' },
      { clues: ['Diego, Elena, and Farah each own a different pet: a rabbit, a parrot, or a turtle.', "Diego's pet can talk.", "Elena's pet is slower than Farah's pet."], prompt: 'Which pet does Farah have?', options: ['Rabbit', 'Parrot', 'Turtle'], answer: 'Rabbit', explanation: "Diego's talking pet is the parrot. Between the remaining two, the turtle is slower than the rabbit, so Elena has the turtle and Farah has the rabbit." },
      { clues: ['Gita, Hassan, and Iris each own a different pet: a hamster, a snake, or a goldfish.', "Hassan's pet has no legs.", "Gita's pet lives in water."], prompt: 'Who owns the hamster?', options: ['Gita', 'Hassan', 'Iris'], answer: 'Iris', explanation: "Hassan's legless pet is the snake. Gita's water pet is the goldfish. That leaves Iris with the hamster." },
      { clues: ['Jon, Kira, and Leo each own a different pet: a puppy, a kitten, or a lizard.', "Jon's pet is cold-blooded.", "Leo's pet barks."], prompt: 'What pet does Kira have?', options: ['Puppy', 'Kitten', 'Lizard'], answer: 'Kitten', explanation: "Jon's cold-blooded pet is the lizard. Leo's barking pet is the puppy. That leaves Kira with the kitten." },
    ],
  },
  {
    id: 'logic-fruitsellers', title: 'Fruit Sellers', blurb: 'Use the clues to work out who sells which fruit.',
    rounds: [
      { clues: ['Maya, Noah, and Omar each sell a different fruit: mango, apple, or grapes.', 'Noah sells small round fruit that grow in bunches.', "Omar's fruit is red and shaped like a ball."], prompt: 'Which fruit does Maya sell?', options: ['Mango', 'Apple', 'Grapes'], answer: 'Mango', explanation: "Noah's fruit growing in bunches is grapes. Omar's red ball-shaped fruit is the apple. That leaves Maya with mango." },
      { clues: ['Priya, Quinn, and Rosa each sell a different fruit: banana, melon, or pear.', "Quinn's fruit is long and yellow.", "Rosa's fruit is very large and round."], prompt: 'What does Priya sell?', options: ['Banana', 'Melon', 'Pear'], answer: 'Pear', explanation: "Quinn's long yellow fruit is the banana. Rosa's large round fruit is the melon. That leaves Priya with the pear." },
      { clues: ['Sam, Tara, and Uma each sell a different fruit: pineapple, cherry, or kiwi.', "Sam's fruit is small, dark red, and sold in pairs.", "Tara's fruit is fuzzy and green inside."], prompt: 'Who sells the pineapple?', options: ['Sam', 'Tara', 'Uma'], answer: 'Uma', explanation: "Sam's fruit is cherry. Tara's fuzzy fruit is kiwi. That leaves Uma with the pineapple." },
      { clues: ['Vik, Wren, and Xena each sell a different fruit: papaya, fig, or plum.', "Vik's fruit is small, purple, and smooth-skinned.", "Wren's fruit is soft with tiny seeds, often dried."], prompt: 'Which fruit does Xena sell?', options: ['Papaya', 'Fig', 'Plum'], answer: 'Papaya', explanation: "Vik's fruit is plum. Wren's fruit is fig. That leaves Xena with papaya." },
    ],
  },
  {
    id: 'logic-birthdays', title: 'Birthday Months', blurb: 'Use the clues to work out who was born in which month.',
    rounds: [
      { clues: ['Ana, Bo, and Chen were each born in a different month: January, June, or October.', "Ana's birthday is in the first month of the year.", "Chen's birthday comes after Bo's."], prompt: "Which month is Chen's birthday?", options: ['January', 'June', 'October'], answer: 'October', explanation: 'Ana is January. Between June and October, Chen comes after Bo, so Bo is June and Chen is October.' },
      { clues: ['Dev, Ela, and Finn were each born in a different month: March, July, or December.', "Finn's birthday is in the last month of the year.", "Dev's birthday comes before Ela's."], prompt: "Which month is Ela's birthday?", options: ['March', 'July', 'December'], answer: 'July', explanation: 'Finn is December. Between March and July, Dev comes before Ela, so Dev is March and Ela is July.' },
      { clues: ['Gus, Hana, and Ivy were each born in a different month: February, May, or September.', "Gus's birthday is in the shortest month of the year.", "Ivy's birthday comes after Hana's."], prompt: "Which month is Hana's birthday?", options: ['February', 'May', 'September'], answer: 'May', explanation: 'Gus is February. Between May and September, Ivy comes after Hana, so Hana is May and Ivy is September.' },
      { clues: ['Jia, Kwan, and Lina were each born in a different month: April, August, or November.', "Jia's birthday is in the 11th month of the year.", "Kwan's birthday comes before Lina's."], prompt: "Which month is Lina's birthday?", options: ['April', 'August', 'November'], answer: 'August', explanation: 'Jia is November. Between April and August, Kwan comes before Lina, so Kwan is April and Lina is August.' },
    ],
  },
  {
    id: 'logic-colours', title: 'Favourite Colours', blurb: 'Use the clues to work out everyone\'s favourite colour.',
    rounds: [
      { clues: ['Mia, Nico, and Owen each have a different favourite colour: red, blue, or green.', "Mia's favourite is the colour of the sky on a clear day.", "Owen's favourite is the colour of grass."], prompt: "What is Nico's favourite colour?", options: ['Red', 'Blue', 'Green'], answer: 'Red', explanation: "Mia likes blue (the sky) and Owen likes green (grass), leaving Nico with red." },
      { clues: ['Paz, Quon, and Rhea each have a different favourite colour: yellow, purple, or orange.', "Paz's favourite is made by mixing red and blue.", "Quon's favourite is the colour of a ripe banana."], prompt: "What is Rhea's favourite colour?", options: ['Yellow', 'Purple', 'Orange'], answer: 'Orange', explanation: 'Paz likes purple (red+blue) and Quon likes yellow (banana), leaving Rhea with orange.' },
      { clues: ['Sana, Theo, and Uzo each have a different favourite colour: pink, brown, or black.', "Sana's favourite is a pale mix of red and white.", "Theo's favourite is the darkest of the three."], prompt: "What is Uzo's favourite colour?", options: ['Pink', 'Brown', 'Black'], answer: 'Brown', explanation: 'Sana likes pink and Theo likes black (the darkest), leaving Uzo with brown.' },
      { clues: ['Vera, Wynn, and Xander each have a different favourite colour: teal, maroon, or silver.', "Vera's favourite is a shiny grey metallic shade.", "Wynn's favourite is a deep brownish red."], prompt: "What is Xander's favourite colour?", options: ['Teal', 'Maroon', 'Silver'], answer: 'Teal', explanation: 'Vera likes silver and Wynn likes maroon, leaving Xander with teal.' },
    ],
  },
];

// ── Odd One Out (MCRoundsGame data) ────────────────────────────────────────
const ODDONEOUT_GAMES = [
  {
    id: 'odd-shapes', title: 'Odd Shape Out', blurb: 'Which shape does not belong with the rest?',
    rounds: [
      { prompt: 'Which one is different?', options: ['🔴', '🔴', '🔺', '🔴'], answer: '🔺', explanation: 'The rest are circles.' },
      { prompt: 'Which one is different?', options: ['⬛', '⬛', '⬛', '⚪'], answer: '⚪', explanation: 'The rest are squares.' },
      { prompt: 'Which one is different?', options: ['🔷', '🔷', '🔶', '🔷'], answer: '🔶', explanation: 'The rest are blue diamonds.' },
      { prompt: 'Which one is different?', options: ['⭐', '⭐', '⭐', '🌙'], answer: '🌙', explanation: 'The rest are stars.' },
      { prompt: 'Which one is different?', options: ['🟢', '🟢', '🟡', '🟢'], answer: '🟡', explanation: 'The rest are green circles.' },
      { prompt: 'Which one is different?', options: ['▲', '▲', '▲', '●'], answer: '●', explanation: 'The rest are triangles.' },
    ],
  },
  {
    id: 'odd-numbers', title: 'Odd Number Out', blurb: 'Which number breaks the pattern?',
    rounds: [
      { prompt: 'Which number does not belong?', options: ['4', '6', '8', '9', '12'], answer: '9', explanation: 'All the others are even.' },
      { prompt: 'Which number does not belong?', options: ['3', '9', '15', '21', '20'], answer: '20', explanation: 'All the others are odd multiples of 3.' },
      { prompt: 'Which number does not belong?', options: ['10', '20', '30', '45', '50'], answer: '45', explanation: 'All the others are multiples of 10.' },
      { prompt: 'Which number does not belong?', options: ['2', '3', '5', '7', '8'], answer: '8', explanation: 'All the others are prime numbers.' },
      { prompt: 'Which number does not belong?', options: ['16', '25', '36', '49', '50'], answer: '50', explanation: 'All the others are perfect squares.' },
      { prompt: 'Which number does not belong?', options: ['11', '22', '33', '44', '46'], answer: '46', explanation: 'All the others are multiples of 11.' },
    ],
  },
  {
    id: 'odd-words', title: 'Odd Word Out', blurb: 'Which word does not belong with the category?',
    rounds: [
      { prompt: 'Which word does not belong?', options: ['Apple', 'Banana', 'Carrot', 'Mango'], answer: 'Carrot', explanation: 'The rest are fruits; carrot is a vegetable.' },
      { prompt: 'Which word does not belong?', options: ['Dog', 'Cat', 'Sparrow', 'Rabbit'], answer: 'Sparrow', explanation: 'The rest are mammals; sparrow is a bird.' },
      { prompt: 'Which word does not belong?', options: ['Square', 'Triangle', 'Circle', 'Cube'], answer: 'Cube', explanation: 'The rest are 2D shapes; a cube is 3D.' },
      { prompt: 'Which word does not belong?', options: ['Guitar', 'Violin', 'Cello', 'Trumpet'], answer: 'Trumpet', explanation: 'The rest are string instruments; trumpet is brass.' },
      { prompt: 'Which word does not belong?', options: ['Salt', 'Sugar', 'Pepper', 'Chair'], answer: 'Chair', explanation: 'The rest are things found in the kitchen; a chair is furniture.' },
      { prompt: 'Which word does not belong?', options: ['Monday', 'Tuesday', 'March', 'Friday'], answer: 'March', explanation: 'The rest are days of the week; March is a month.' },
    ],
  },
  {
    id: 'odd-colours', title: 'Odd Colour Out', blurb: 'Which colour breaks the group?',
    rounds: [
      { prompt: 'Which colour does not belong?', options: ['Red', 'Orange', 'Yellow', 'Blue'], answer: 'Blue', explanation: 'The rest are warm colours.' },
      { prompt: 'Which colour does not belong?', options: ['Blue', 'Green', 'Purple', 'Red'], answer: 'Red', explanation: 'The rest are cool colours.' },
      { prompt: 'Which colour does not belong?', options: ['Black', 'White', 'Grey', 'Pink'], answer: 'Pink', explanation: 'The rest are neutral tones.' },
      { prompt: 'Which colour does not belong?', options: ['Maroon', 'Crimson', 'Scarlet', 'Navy'], answer: 'Navy', explanation: 'The rest are shades of red; navy is blue.' },
      { prompt: 'Which colour does not belong?', options: ['Gold', 'Silver', 'Bronze', 'Emerald'], answer: 'Emerald', explanation: 'The rest are metallic tones; emerald is a gemstone green.' },
      { prompt: 'Which colour does not belong?', options: ['Lime', 'Olive', 'Forest', 'Coral'], answer: 'Coral', explanation: 'The rest are shades of green.' },
    ],
  },
];

// ── Number Sequences (MCRoundsGame data) ───────────────────────────────────
const NUMSEQ_GAMES = [
  {
    id: 'numseq-arithmetic', title: 'Arithmetic Sequences', blurb: 'Find the next number — the gap between numbers stays constant.',
    rounds: [
      { prompt: '2, 4, 6, 8, ?', options: ['9', '10', '11', '12'], answer: '10', explanation: 'Each number increases by 2.' },
      { prompt: '5, 10, 15, 20, ?', options: ['22', '24', '25', '28'], answer: '25', explanation: 'Each number increases by 5.' },
      { prompt: '100, 90, 80, 70, ?', options: ['55', '58', '60', '65'], answer: '60', explanation: 'Each number decreases by 10.' },
      { prompt: '3, 7, 11, 15, ?', options: ['17', '18', '19', '21'], answer: '19', explanation: 'Each number increases by 4.' },
      { prompt: '50, 45, 40, 35, ?', options: ['25', '28', '30', '32'], answer: '30', explanation: 'Each number decreases by 5.' },
      { prompt: '1, 4, 7, 10, ?', options: ['11', '12', '13', '14'], answer: '13', explanation: 'Each number increases by 3.' },
    ],
  },
  {
    id: 'numseq-geometric', title: 'Geometric Sequences', blurb: 'Find the next number — each term is multiplied (or divided) by the same amount.',
    rounds: [
      { prompt: '2, 4, 8, 16, ?', options: ['24', '28', '30', '32'], answer: '32', explanation: 'Each number is doubled.' },
      { prompt: '3, 9, 27, 81, ?', options: ['162', '200', '243', '270'], answer: '243', explanation: 'Each number is multiplied by 3.' },
      { prompt: '1, 2, 4, 8, ?', options: ['12', '14', '16', '18'], answer: '16', explanation: 'Each number is doubled.' },
      { prompt: '256, 128, 64, 32, ?', options: ['8', '16', '24', '32'], answer: '16', explanation: 'Each number is halved.' },
      { prompt: '5, 10, 20, 40, ?', options: ['60', '70', '80', '90'], answer: '80', explanation: 'Each number is doubled.' },
      { prompt: '2, 6, 18, 54, ?', options: ['108', '144', '162', '180'], answer: '162', explanation: 'Each number is multiplied by 3.' },
    ],
  },
  {
    id: 'numseq-fibonacci', title: 'Fibonacci-Style Sequences', blurb: 'Find the next number — each term is the sum of the two before it.',
    rounds: [
      { prompt: '1, 1, 2, 3, 5, ?', options: ['7', '8', '9', '11'], answer: '8', explanation: '3 + 5 = 8.' },
      { prompt: '2, 2, 4, 6, 10, ?', options: ['12', '14', '16', '18'], answer: '16', explanation: '6 + 10 = 16.' },
      { prompt: '1, 2, 3, 5, 8, ?', options: ['11', '12', '13', '15'], answer: '13', explanation: '5 + 8 = 13.' },
      { prompt: '3, 3, 6, 9, 15, ?', options: ['18', '21', '24', '27'], answer: '24', explanation: '9 + 15 = 24.' },
      { prompt: '0, 1, 1, 2, 3, ?', options: ['4', '5', '6', '8'], answer: '5', explanation: '2 + 3 = 5.' },
      { prompt: '5, 5, 10, 15, 25, ?', options: ['30', '35', '40', '45'], answer: '40', explanation: '15 + 25 = 40.' },
    ],
  },
  {
    id: 'numseq-squares', title: 'Square & Triangular Numbers', blurb: 'Find the next number in these special number patterns.',
    rounds: [
      { prompt: '1, 4, 9, 16, ?', options: ['20', '22', '25', '30'], answer: '25', explanation: 'These are square numbers: 1², 2², 3², 4², 5².' },
      { prompt: '1, 8, 27, 64, ?', options: ['81', '100', '125', '150'], answer: '125', explanation: 'These are cube numbers: 1³, 2³, 3³, 4³, 5³.' },
      { prompt: '4, 9, 16, 25, ?', options: ['30', '33', '36', '40'], answer: '36', explanation: 'These are square numbers: 2², 3², 4², 5², 6².' },
      { prompt: '2, 8, 18, 32, ?', options: ['40', '45', '50', '60'], answer: '50', explanation: 'Each term is 2 × a square number: 2×1, 2×4, 2×9, 2×16, 2×25.' },
      { prompt: '1, 3, 6, 10, ?', options: ['12', '14', '15', '18'], answer: '15', explanation: 'These are triangular numbers, adding one more each time.' },
      { prompt: '100, 81, 64, 49, ?', options: ['30', '33', '36', '40'], answer: '36', explanation: 'These are descending square numbers: 10², 9², 8², 7², 6².' },
    ],
  },
];

// ── Sudoku Lite: fixed 4x4 / 6x6 puzzles ───────────────────────────────────
const SUDOKU_GAMES = [
  {
    id: 'sudoku-4x4-easy', title: '4x4 Sudoku — Easy', blurb: 'Fill in the grid so every row, column, and 2x2 box has 1-4 exactly once.',
    size: 4, boxRows: 2, boxCols: 2,
    puzzle: [
      [1, 2, 0, 4],
      [0, 4, 1, 0],
      [2, 0, 4, 3],
      [0, 3, 2, 0],
    ],
    solution: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
  },
  {
    id: 'sudoku-4x4-medium', title: '4x4 Sudoku — Medium', blurb: 'A trickier 4x4 grid with fewer starting numbers.',
    size: 4, boxRows: 2, boxCols: 2,
    puzzle: [
      [0, 0, 4, 0],
      [4, 0, 0, 1],
      [0, 2, 3, 0],
      [3, 0, 0, 2],
    ],
    solution: [
      [2, 1, 4, 3],
      [4, 3, 2, 1],
      [1, 2, 3, 4],
      [3, 4, 1, 2],
    ],
  },
  {
    id: 'sudoku-6x6-easy', title: '6x6 Sudoku — Easy', blurb: 'Fill in the grid so every row, column, and 2x3 box has 1-6 exactly once.',
    size: 6, boxRows: 2, boxCols: 3,
    puzzle: [
      [1, 0, 3, 4, 0, 6],
      [0, 5, 6, 0, 2, 3],
      [2, 3, 0, 6, 4, 0],
      [5, 0, 4, 3, 0, 2],
      [0, 1, 2, 0, 6, 4],
      [6, 4, 0, 2, 3, 0],
    ],
    solution: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 1, 6, 4, 5],
      [5, 6, 4, 3, 1, 2],
      [3, 1, 2, 5, 6, 4],
      [6, 4, 5, 2, 3, 1],
    ],
  },
  {
    id: 'sudoku-6x6-medium', title: '6x6 Sudoku — Medium', blurb: 'A trickier 6x6 grid with fewer starting numbers.',
    size: 6, boxRows: 2, boxCols: 3,
    puzzle: [
      [0, 5, 0, 1, 0, 3],
      [1, 0, 3, 0, 5, 0],
      [0, 6, 0, 3, 0, 2],
      [2, 0, 1, 0, 4, 0],
      [0, 4, 0, 2, 0, 1],
      [3, 0, 2, 0, 6, 0],
    ],
    solution: [
      [4, 5, 6, 1, 2, 3],
      [1, 2, 3, 4, 5, 6],
      [5, 6, 4, 3, 1, 2],
      [2, 3, 1, 6, 4, 5],
      [6, 4, 5, 2, 3, 1],
      [3, 1, 2, 5, 6, 4],
    ],
  },
];

// ── Word Association / Vocabulary (MCRoundsGame data) ──────────────────────
const VOCAB_GAMES = [
  {
    id: 'vocab-synonyms', title: 'Synonym Match', blurb: 'Pick the word that means the same thing.',
    rounds: [
      { prompt: "Which word means the same as 'Happy'?", options: ['Sad', 'Joyful', 'Angry', 'Tired'], answer: 'Joyful' },
      { prompt: "Which word means the same as 'Big'?", options: ['Large', 'Tiny', 'Short', 'Narrow'], answer: 'Large' },
      { prompt: "Which word means the same as 'Fast'?", options: ['Slow', 'Quick', 'Lazy', 'Heavy'], answer: 'Quick' },
      { prompt: "Which word means the same as 'Smart'?", options: ['Intelligent', 'Foolish', 'Weak', 'Loud'], answer: 'Intelligent' },
      { prompt: "Which word means the same as 'Brave'?", options: ['Courageous', 'Scared', 'Shy', 'Quiet'], answer: 'Courageous' },
      { prompt: "Which word means the same as 'Begin'?", options: ['Start', 'End', 'Pause', 'Stop'], answer: 'Start' },
    ],
  },
  {
    id: 'vocab-antonyms', title: 'Antonym Match', blurb: 'Pick the word that means the opposite.',
    rounds: [
      { prompt: "Which word means the opposite of 'Hot'?", options: ['Cold', 'Warm', 'Boiling', 'Mild'], answer: 'Cold' },
      { prompt: "Which word means the opposite of 'Up'?", options: ['Down', 'High', 'Above', 'Top'], answer: 'Down' },
      { prompt: "Which word means the opposite of 'Full'?", options: ['Empty', 'Complete', 'Whole', 'Packed'], answer: 'Empty' },
      { prompt: "Which word means the opposite of 'Light' (weight)?", options: ['Heavy', 'Bright', 'Pale', 'Thin'], answer: 'Heavy' },
      { prompt: "Which word means the opposite of 'Ancient'?", options: ['Modern', 'Old', 'Historic', 'Vintage'], answer: 'Modern' },
      { prompt: "Which word means the opposite of 'Difficult'?", options: ['Easy', 'Hard', 'Complex', 'Tough'], answer: 'Easy' },
    ],
  },
  {
    id: 'vocab-definitions', title: 'Word-Definition Match', blurb: 'Pick the word that matches the definition.',
    rounds: [
      { prompt: "Which word means 'a place where books are kept'?", options: ['Library', 'Museum', 'Market', 'Studio'], answer: 'Library' },
      { prompt: "Which word means 'a person who teaches students'?", options: ['Teacher', 'Doctor', 'Farmer', 'Pilot'], answer: 'Teacher' },
      { prompt: "Which word means 'the study of living things'?", options: ['Biology', 'Geology', 'Astronomy', 'Chemistry'], answer: 'Biology' },
      { prompt: "Which word means 'a large area of sand, often hot and dry'?", options: ['Desert', 'Valley', 'Glacier', 'Marsh'], answer: 'Desert' },
      { prompt: "Which word means 'a word that describes an action'?", options: ['Verb', 'Noun', 'Adjective', 'Adverb'], answer: 'Verb' },
      { prompt: "Which word means 'an instrument used to see distant objects in space'?", options: ['Telescope', 'Microscope', 'Binoculars', 'Periscope'], answer: 'Telescope' },
    ],
  },
];

// ── Spatial Reasoning (MCRoundsGame data) ──────────────────────────────────
const SPATIAL_GAMES = [
  {
    id: 'spatial-rotation', title: 'Shape Rotation', blurb: 'Work out which direction an arrow points after it is rotated.',
    rounds: [
      { prompt: 'If ↑ is rotated 90° clockwise, which way does it point?', options: ['↑', '→', '↓', '←'], answer: '→' },
      { prompt: 'If → is rotated 90° clockwise, which way does it point?', options: ['→', '↓', '←', '↑'], answer: '↓' },
      { prompt: 'If ↓ is rotated 90° clockwise, which way does it point?', options: ['↓', '←', '↑', '→'], answer: '←' },
      { prompt: 'If ← is rotated 90° clockwise, which way does it point?', options: ['←', '↑', '→', '↓'], answer: '↑' },
      { prompt: 'If ↑ is rotated 180°, which way does it point?', options: ['↑', '↓', '→', '←'], answer: '↓' },
      { prompt: 'If → is rotated 180°, which way does it point?', options: ['→', '←', '↑', '↓'], answer: '←' },
    ],
  },
  {
    id: 'spatial-mirror', title: 'Mirror Match', blurb: 'Work out mirror images and spot the symmetrical word.',
    rounds: [
      { prompt: "Which letter is the left-right mirror image of 'b'?", options: ['d', 'p', 'q', 'b'], answer: 'd' },
      { prompt: "Which letter is the left-right mirror image of 'p'?", options: ['q', 'd', 'b', 'p'], answer: 'q' },
      { prompt: "Which letter is the left-right mirror image of 'd'?", options: ['b', 'q', 'p', 'd'], answer: 'b' },
      { prompt: "Which letter is the left-right mirror image of 'q'?", options: ['p', 'b', 'd', 'q'], answer: 'p' },
      { prompt: 'Which word reads the same forwards and backwards?', options: ['LEVEL', 'WATER', 'HAPPY', 'SUNNY'], answer: 'LEVEL' },
      { prompt: 'Which word reads the same forwards and backwards?', options: ['NOON', 'TABLE', 'MUSIC', 'GLASS'], answer: 'NOON' },
    ],
  },
  {
    id: 'spatial-pattern', title: 'Pattern Completion', blurb: 'Work out which shape continues the repeating pattern.',
    rounds: [
      { prompt: '⭐ 🔺 ⭐ 🔺 ⭐ ?', options: ['⭐', '🔺', '⬛', '⚪'], answer: '🔺' },
      { prompt: '🔵 🔵 🔴 🔵 🔵 🔴 ?', options: ['🔵', '🔴', '⚪', '⬛'], answer: '🔵' },
      { prompt: '⬛ ⬜ ⬛ ⬜ ⬛ ?', options: ['⬛', '⬜', '⚪', '🔺'], answer: '⬜' },
      { prompt: '🔺 🔺 ⭐ 🔺 🔺 ⭐ ?', options: ['🔺', '⭐', '⬛', '⚪'], answer: '🔺' },
      { prompt: '🟢 🟡 🟢 🟡 🟢 ?', options: ['🟢', '🟡', '🔴', '⚪'], answer: '🟡' },
      { prompt: '⚪ ⚪ ⚪ 🔺 ⚪ ⚪ ⚪ 🔺 ?', options: ['⚪', '🔺', '⭐', '⬛'], answer: '⚪' },
    ],
  },
  {
    id: 'spatial-grid', title: 'Grid Position', blurb: 'Work out cell positions on a 3x3 grid.',
    rounds: [
      { prompt: 'A shape sits in the top-left corner of a 3x3 grid. Which cell is directly to its right?', options: ['Top-middle', 'Top-right', 'Middle-left', 'Centre'], answer: 'Top-middle' },
      { prompt: 'A shape sits in the centre of a 3x3 grid. Which cell is directly above it?', options: ['Top-middle', 'Top-left', 'Middle-left', 'Bottom-middle'], answer: 'Top-middle' },
      { prompt: 'A shape sits in the bottom-right corner. Which cell is directly to its left?', options: ['Bottom-middle', 'Bottom-left', 'Middle-right', 'Centre'], answer: 'Bottom-middle' },
      { prompt: 'A shape sits in the top-right corner. Which cell is directly below it?', options: ['Middle-right', 'Middle-left', 'Centre', 'Bottom-right'], answer: 'Middle-right' },
      { prompt: 'A shape sits in the middle-left cell. Which cell is directly to its right?', options: ['Centre', 'Top-left', 'Bottom-left', 'Middle-right'], answer: 'Centre' },
      { prompt: 'A shape sits in the bottom-middle cell. Which cell is directly above it?', options: ['Centre', 'Top-middle', 'Bottom-left', 'Bottom-right'], answer: 'Centre' },
    ],
  },
];

// ── Reaction & Attention ────────────────────────────────────────────────────
const REACTION_GAMES = [
  { id: 'reaction-oddshape', title: 'Find the Odd Shape', blurb: 'Tap the shape that is different before the clock runs out.', target: '⭐', distractorPool: ['🔵'], gridSize: 16 },
  { id: 'reaction-apple', title: 'Find the Apple', blurb: 'Tap the apple hiding among the other fruit.', target: '🍎', distractorPool: ['🍌', '🍇', '🍓', '🍊', '🥝', '🍍'], gridSize: 16 },
  { id: 'reaction-letter', title: 'Find the Letter d', blurb: "Tap the letter 'd' hiding among the 'b's.", target: 'd', distractorPool: ['b'], gridSize: 20 },
];

// ── Master catalog ──────────────────────────────────────────────────────────
// Each entry: { id, categoryId, title, emoji, blurb, engine, data }
export const GAMES = [
  ...MEMORY_SETS.map((g) => ({ id: g.id, categoryId: 'memory', title: g.title, emoji: '🧠', blurb: g.blurb, engine: 'memory', data: g })),
  ...SEQUENCE_SETS.map((g) => ({ id: g.id, categoryId: 'sequence', title: g.title, emoji: '🔁', blurb: g.blurb, engine: 'sequence', data: g })),
  ...MATH_SPRINT_GAMES.map((g) => ({ id: g.id, categoryId: 'mathsprint', title: g.title, emoji: '➕', blurb: g.blurb, engine: 'mathsprint', data: g })),
  ...SCRAMBLE_SETS.map((g) => ({ id: g.id, categoryId: 'scramble', title: g.title, emoji: '🔤', blurb: g.blurb, engine: 'scramble', data: g })),
  ...LOGICGRID_GAMES.map((g) => ({ id: g.id, categoryId: 'logicgrid', title: g.title, emoji: '🕵️', blurb: g.blurb, engine: 'mc', data: g })),
  ...ODDONEOUT_GAMES.map((g) => ({ id: g.id, categoryId: 'oddoneout', title: g.title, emoji: '🔍', blurb: g.blurb, engine: 'mc', data: g })),
  ...NUMSEQ_GAMES.map((g) => ({ id: g.id, categoryId: 'numseq', title: g.title, emoji: '🔢', blurb: g.blurb, engine: 'mc', data: g })),
  ...SUDOKU_GAMES.map((g) => ({ id: g.id, categoryId: 'sudoku', title: g.title, emoji: '🧩', blurb: g.blurb, engine: 'sudoku', data: g })),
  ...VOCAB_GAMES.map((g) => ({ id: g.id, categoryId: 'vocab', title: g.title, emoji: '📚', blurb: g.blurb, engine: 'mc', data: g })),
  ...SPATIAL_GAMES.map((g) => ({ id: g.id, categoryId: 'spatial', title: g.title, emoji: '📐', blurb: g.blurb, engine: 'mc', data: g })),
  ...REACTION_GAMES.map((g) => ({ id: g.id, categoryId: 'reaction', title: g.title, emoji: '⚡', blurb: g.blurb, engine: 'reaction', data: g })),
  { id: 'classic-phonics', categoryId: 'classic', title: 'Phonics Match', emoji: '🔤', blurb: 'Pick the word that starts with the letter shown.', engine: 'external', data: { component: 'PhonicsMatchGame' } },
  { id: 'classic-quizsprint', categoryId: 'classic', title: 'Quiz Sprint', emoji: '⏱️', blurb: "Answer as many of this grade's practice questions as you can in 30 seconds.", engine: 'external', data: { component: 'QuizSprintGame' } },
];

// Number of games available per category, for the picker UI.
export function gamesByCategory(categoryId) {
  return GAMES.filter((g) => g.categoryId === categoryId);
}

export const TOTAL_GAMES = GAMES.length;

// Sanity check: this Game Centre is built to have at least 50 distinct
// playable games/puzzles across its engine categories.
if (TOTAL_GAMES < 50) {
  console.warn(`Game Centre only has ${TOTAL_GAMES} games — expected at least 50.`);
}

// ── Daily Challenge ─────────────────────────────────────────────────────────
// Deterministically picks the same game (and difficulty, for engines that
// support one) for every player on a given calendar day — the same
// day-indexed approach as FactOfTheDay.jsx: count whole days since a fixed
// epoch and index into the catalog with it, so it's stable across reloads
// and identical for every child, but rolls over automatically at midnight.
const DAY_EPOCH = new Date(2024, 0, 1);
export const DIFFICULTY_TIERS = ['easy', 'medium', 'hard'];

export function dayIndex(date = new Date()) {
  return Math.floor((date - DAY_EPOCH) / (1000 * 60 * 60 * 24));
}

export function dailyChallenge(date = new Date()) {
  const idx = dayIndex(date);
  const game = GAMES[idx % GAMES.length];
  const difficulty = DIFFICULTY_TIERS[idx % DIFFICULTY_TIERS.length];
  return { game, difficulty };
}
