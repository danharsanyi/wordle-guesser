import fs from 'fs';
import emoji from 'node-emoji';
import _ from 'lodash';

const GREEN = emoji.get('large_green_square');
const YELLOW = emoji.get('large_yellow_square');
const BLACK = emoji.get('black_large_square');

const letterRanking = ['q', 'x', 'j', 'z', 'v', 'f', 'w', 'k', 'g', 'b', 'p', 'm', 'h', 'd', 'c', 'y', 'u', 't', 'n', 'l', 's', 'o', 'i', 'r', 'e', 'a'];

const board = [
  {
    letters: ["m", "e", "t", "a", "l"],
    result: [BLACK, BLACK, BLACK, GREEN, BLACK]
  },
  {
    letters: ["r", "o", "u", "n", "d"],
    result: [BLACK, BLACK, BLACK, YELLOW, BLACK]
  },
  {
    letters: ["f", "i", "l", "m", "s"],
    result: [BLACK, YELLOW, BLACK, BLACK, BLACK]
  },
  {
    letters: ["s", "l", "i", "m", "y"],
    result: [BLACK, BLACK, GREEN, BLACK, BLACK]
  },
];

function loadWords() {
  const file = fs.readFileSync('./words.json', 'utf8');
  const words = JSON.parse(file);
  return words.map(w => w.toLowerCase().split(""));
};

function getDisplayBoard() {
  return board.map(({letters, result}) => {
    return `${letters.join("")}: ${result.map(square => square).join(" ")}`;
  }).join(" \n");
}

const knownLetters = function() {
  const known = ["", "", "", "", ""];
  board.forEach(({letters, result}) => {
    result.forEach((square, index) => {
      if (square === GREEN) {
        const letter = letters[index];
        if (known[index] !== letter) {
          known.splice(index, 1, letter);
        }
      }
    });
  });
  return known
}();

const excludedLetters = function() {
  const exclusions = [];
  board.forEach(({letters, result}) => {
    result.forEach((square, index) => {
      const letter = letters[index];
      (square === BLACK && !knownLetters.includes(letter)) && exclusions.push(letter)
    });
  });
  return exclusions;
}();

function containsExcludedLetters(word) {
  return excludedLetters.some(letter => word.includes(letter));
}

function containsCorrectLetters(word) {
  return word.every((letter, index) => {
    return knownLetters[index] === "" || knownLetters[index] === letter;
  });
}

function containsIncludedLetters(word) {
  const invalidPositions = [[], [], [], [], []];
  board.forEach(({letters, result}) => {
    result.forEach((square, index) => {
      if (square === YELLOW) {
        invalidPositions[index].splice(0, 0, letters[index]);
      }
    });
  });

  const mustContain = _.uniq(_.flatten(invalidPositions));
  const validPositions = !word.some((letter, index) => {
    return invalidPositions[index].includes(letter);
  });

  return (
    validPositions &&
    mustContain.every(letter => word.includes(letter))
  );
}

function rankWord(word) {
  return _.sum(word.map(letter => letterRanking.indexOf(letter)));
}

function filter(words) {
  return words.filter(word => (
    !containsExcludedLetters(word) &&
    containsCorrectLetters(word) &&
    containsIncludedLetters(word)
  ));
}

function guess() {
  const words = loadWords();
  const nextGuesses = _.sortBy(_.uniq(filter(words)), rankWord).reverse().map(word => word.join(''));
  const displayBoard = getDisplayBoard();
  console.log("Current board:");
  console.log(displayBoard);
  console.log("\n");
  console.log(`Next guesses (${nextGuesses.length}):`);
  nextGuesses.forEach(guess => console.log(guess));
}

guess();
