import { Telegraf } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import { startConnection, saveUserIfNotExists } from './mysql_requests.js'

import * as events from './commands/events.js'
import * as reminder from './commands/reminder.js'

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

bot.on("text", async (ctx, next) => {
    if (ctx.message.entities && ctx.message.entities[0].type === "bot_command") {
        const commandName = ctx.message.text.substring(1);
        console.log(`Calling command ${commandName}`);

        handleCommand(commandName, ctx);

        return;
    }


    if (ctx.session.nextAction) {
        const nextAction = ctx.session.nextAction
        const actionSplit = nextAction.split("/");
        const command = actionSplit[0];
        const command_function = actionSplit[1];
        const command_id = ctx.session.nextActionData;

        try {
            if (command === "events") {
                await events[command_function](ctx, command_id, true);
            } else if (command === "reminder") {
                await reminder[command_function](ctx, command_id, true);
            } else {
                ctx.reply("Ja ne, das is ein Problem!")
            }
        } catch (e) {
            ctx.reply("Sorry, dass kann ich noch nicht.")
        }
    } else {
        ctx.reply("Sorry, damit kann ich aktuell nichts anfangen.")
    }
});

bot.on('callback_query', async (ctx, next) => {
    const callback_data = ctx.callbackQuery.data;

    const callback_parts = callback_data.split("_");
    const callback_command = callback_parts[1];
    const callback_function = callback_parts[2];
    const callback_id = callback_parts[3];

    try {
        if (callback_command === "events") {
            await events[callback_function](ctx, callback_id, true);
        } else if (callback_command === "reminder") {
            await reminder[callback_function](ctx, callback_id, true);
        } else {
            ctx.reply("Sorry, kenn ich nicht!")
        }
    } catch (e) {
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
        ctx.reply("Grad geht nur /remind")
    } else if (commandName === "start") {
        saveUserIfNotExists(ctx);
    } else if (commandName === "quit") {
        ctx.reply("Alles klar, bye!");
        ctx.telegram.leaveChat(ctx.message.chat.id)
        ctx.leaveChat();
    } else {
        ctx.reply("Sorry, dieses Kommando kenne ich nciht. Sende mit /help um eine Liste an verfügbaren kommandos zu erhalten")
    }
};
