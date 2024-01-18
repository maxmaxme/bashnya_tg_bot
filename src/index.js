import { generate } from "random-words";
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

let word = '';
let currentChar = 0;
let wordUsers = [];

const chatId = process.env.CHAT_ID || '';
const bot = new Telegraf(process.env.BOT_TOKEN)

function setNewWord() {
  const w = generate().toString()
  word = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
  console.log('New word is: ' + word);
}

// on message
bot.on('message', (ctx) => {
  const fromId = ctx.message.from.id;
  const fromChatId = ctx.message.chat.id;
  if (fromChatId.toString() !== chatId) {
    console.log('Message from unknown chat ' + fromChatId.toString());
    return;
  }
  if (wordUsers.includes(fromId)) {
    // user already said the word, delete message
    ctx.deleteMessage();
    return;
  }
  if (ctx.message.text.toLowerCase() !== word[currentChar]) {
    ctx.reply(`No no no :) ${currentChar > 0 ? 'Try again!' : ''}`);
    wordUsers = [];
    currentChar = 0;
  } else {
    wordUsers.push(fromId);
    currentChar++;
    if (currentChar === word.length) {
      wordUsers = [];
      currentChar = 0;
      setNewWord();
      ctx.reply('Hooray! New word!');
    }
  }
});

setNewWord();
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
