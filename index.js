import { Telegraf } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import { startConnection, saveUserIfNotExists } from './mysql_requests.js'

import * as myReminders from './commands/myReminders.js'
import * as newReminder from './commands/newReminder.js'

import dotenv from 'dotenv'
dotenv.config()

const bot = new Telegraf(process.env.BOT_API_TOKEN);

const localSession = new LocalSession({
    database: 'session_db.json',
    property: 'session',
    storage: LocalSession.storageFileAsync,
    format: {
        serialize: (obj) => JSON.stringify(obj, null, 2), // null & 2 for pretty-formatted JSON
        deserialize: (str) => JSON.parse(str),
    },
    // We will use `messages` array in our database to store user messages using exported lowdb instance from LocalSession via Telegraf Context
    state: { messages: [] }
})

// Telegraf will use `telegraf-session-local` configured above middleware with overrided `property` name
bot.use(localSession.middleware("session"))

startConnection();

bot.on("sticker", async (ctx, next) => {
    ctx.reply(ctx.message.sticker.file_id);
});

bot.on("text", async (ctx, next) => {
    if (ctx.message.entities && ctx.message.entities[0].type === "bot_command") {
        const commandName = ctx.message.text.substring(1);
        console.log(`Calling command ${commandName}`);

        handleCommand(commandName, ctx);

        return;
    }

    if (ctx.session.nextAction) {
        const nextAction = ctx.session.nextAction
        const actionSplit = nextAction.split("_");
        const command = actionSplit[0];
        const command_function = actionSplit[1];
        const command_data = ctx.session.nextActionData;

        try {
            if (command === "events") {
                await events[command_function](ctx, command_data, true);
            } else if (command === "myReminders") {
                await myReminders[command_function](ctx, command_data, true);
            } else if (command === "newReminder") {
                await newReminder[command_function](ctx, command_data, true);
            } else {
                ctx.reply("Ja ne, das is ein Problem!")
            }
        } catch (e) {
            console.log(e);
            ctx.replyWithSticker('CAACAgIAAxkBAAPaYVyYJUq8Qkxl5P6Zmd8ZXaXsEjUAAhcBAAIiN44EZ1J_iHvDbNAhBA');
            ctx.reply("Sorry, dass kann ich noch nicht.")
        }
    } else {
        ctx.replyWithSticker('CAACAgIAAxkBAAPaYVyYJUq8Qkxl5P6Zmd8ZXaXsEjUAAhcBAAIiN44EZ1J_iHvDbNAhBA');
        ctx.reply("Sorry, damit kann ich aktuell nichts anfangen.")
        ctx.reply("Geiler Sticker ge?")
    }
});

bot.on('callback_query', async (ctx, next) => {
    const callback_data = ctx.callbackQuery.data;

    const callback_parts = callback_data.split("_");
    const callback_command = callback_parts[1];
    const callback_function = callback_parts[2];
    const callback_id = callback_parts[3];

    console.log(callback_data);

    try {
        if (callback_command === "events") {
            await events[callback_function](ctx, callback_id, true);
        } else if (callback_command === "myReminders") {
            if (callback_function === "init") {
                await myReminders[callback_function](ctx, true);
            } else {
                await myReminders[callback_function](ctx, callback_id, true);
            }
        } else if (callback_command === "newReminder") {
            if (callback_function === "init") {
                await newReminder[callback_function](ctx, true);
            } else {
                await newReminder[callback_function](ctx, callback_id, true);
            }
        } else {
            ctx.replyWithSticker('CAACAgIAAxkBAAPaYVyYJUq8Qkxl5P6Zmd8ZXaXsEjUAAhcBAAIiN44EZ1J_iHvDbNAhBA');
            ctx.reply("Sorry, kenne ich nicht!")
        }
    } catch (e) {
        console.log(e);
        ctx.replyWithSticker('CAACAgIAAxkBAAPaYVyYJUq8Qkxl5P6Zmd8ZXaXsEjUAAhcBAAIiN44EZ1J_iHvDbNAhBA');
        ctx.reply("Sorry, dass kann ich noch nicht.")
        ctx.answerCbQuery();
    }

    ctx.answerCbQuery();
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


function handleCommand(commandName, ctx) {
    ctx.session = null;

    if (commandName === "remind") {
        events.init(ctx);
    } else if (commandName === "help") {
        ctx.reply(`/myReminders Bearbeite deine Erinnerungen
/newReminder Erstelle neue Erinnerungen`)
    } else if (commandName === "start") {
        saveUserIfNotExists(ctx);
    } else if (commandName === "myreminders") {
        myReminders.init(ctx);
    } else if (commandName === "myreminders") {
        newReminder.init(ctx);
    } else if (commandName === "quit") {
        ctx.reply("Alles klar, bye!");
        ctx.telegram.leaveChat(ctx.message.chat.id)
        ctx.leaveChat();
    } else {
        ctx.replyWithSticker('CAACAgIAAxkBAAPaYVyYJUq8Qkxl5P6Zmd8ZXaXsEjUAAhcBAAIiN44EZ1J_iHvDbNAhBA');
        ctx.reply("Sorry, dieses Kommando kenne ich nicht. Sende mir /help um eine Liste an verfügbaren Kommandos zu erhalten")
    }
};
