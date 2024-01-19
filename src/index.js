import { generate } from "random-words";
import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

let word = '';
let currentChar = 0;
let wordUsers = [];

const chatId = process.env.CHAT_ID || '';
const bot = new Telegraf(process.env.BOT_TOKEN)
const canUserSaySeveralChars = process.env.CAN_USER_SAY_SEVERAL_CHARS === 'true';

function setNewWord() {
  const w = generate().toString()
  word = w.replace(/[^a-zA-Z]/g, '').toLowerCase();
  console.log('New word is: ' + word);
  bot.telegram.sendMessage(chatId, `First letter is: ${word[0]}`);
}

// on message
bot.on('message', (ctx) => {
  const fromId = ctx.message.from.id;
  const fromChatId = ctx.message.chat.id;
  const text = ctx.message.text;
  if (!text) {
    return;
  }
  if (fromChatId.toString() !== chatId) {
    console.log('Message from unknown chat ' + fromChatId.toString());
    return;
  }
  if (wordUsers.includes(fromId) && !canUserSaySeveralChars) {
    // user already said the word, delete message
    ctx.deleteMessage();
    return;
  }
  if (text.toLowerCase() !== word[currentChar]) {
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
      ctx.reply('Hooray!');
    }
  }
});

bot.launch();
setNewWord();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
