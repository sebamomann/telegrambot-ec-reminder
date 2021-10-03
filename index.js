import { Telegraf, Markup } from 'telegraf'
import LocalSession from 'telegraf-session-local'
import * as events from './commands/events.js'
import * as reminder from './commands/reminder.js'
import { startConnection, saveUserIfNotExists } from './mysql_requests.js'

const bot = new Telegraf(process.env.BOT_API_TOKEN);

const localSession = new LocalSession({
    // Database name/path, where sessions will be located (default: 'sessions.json')
    database: 'example_db.json',
    // Name of session property object in Telegraf Context (default: 'session')
    property: 'session',
    // Type of lowdb storage (default: 'storageFileSync')
    storage: LocalSession.storageFileAsync,
    // Format of storage/database (default: JSON.stringify / JSON.parse)
    format: {
        serialize: (obj) => JSON.stringify(obj, null, 2), // null & 2 for pretty-formatted JSON
        deserialize: (str) => JSON.parse(str),
    },
    // We will use `messages` array in our database to store user messages using exported lowdb instance from LocalSession via Telegraf Context
    state: { messages: [] }
})

// Wait for database async initialization finished (storageFileAsync or your own asynchronous storage adapter)
localSession.DB.then(DB => {
    // Database now initialized, so now you can retrieve anything you want from it
    console.log('Current LocalSession DB:', DB.value())
    // console.log(DB.get('sessions').getById('1:1').value())
})

// Telegraf will use `telegraf-session-local` configured above middleware with overrided `property` name
bot.use(localSession.middleware("session"))

startConnection();

bot.command('start', (ctx, next) => {
    saveUserIfNotExists(ctx);
    next();
})

bot.command('quit', (ctx, next) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id)

    // Using context shortcut
    ctx.leaveChat();

    next();
})

/**
 * COMMANDS
 */
/*
if (ctx.message.entities && ctx.message.entities[0].type === "bot_command") {
        const commandName = ctx.message.text.substring(1);
        console.log(`Calling command ${commandName}`);
        this[commandName](ctx);
    } else {
        ctx.reply("Is no command");
    }
*/

bot.command("remind", (ctx, next) => {
    console.log("COMMAND");
    events.init(ctx);
});

bot.on("text", async (ctx, next) => {
    if (ctx.session.nextAction) {
        const nextAction = ctx.session.nextAction
        const actionSplit = nextAction.split("/");
        const command = actionSplit[0];
        const command_function = actionSplit[1];
        const command_id = ctx.session.nextActionData;

        if (command === "events") {
            await events[command_function](ctx, command_id, true);
        } else if (command === "reminder") {
            await reminder[command_function](ctx, command_id, true);
        } else {
            ctx.reply("Sorry, kenn ich nicht!")
        }
    } else {
        ctx.reply("Sorry, kenn ich nicht! lele")
    }
});

bot.on('callback_query', async (ctx, next) => {
    const callback_data = ctx.callbackQuery.data;

    const callback_parts = callback_data.split("_");
    const callback_command = callback_parts[1];
    const callback_function = callback_parts[2];
    const callback_id = callback_parts[3];

    if (callback_command === "events") {
        await events[callback_function](ctx, callback_id, true);
    } else if (callback_command === "reminder") {
        await reminder[callback_function](ctx, callback_id, true);
    } else {
        ctx.reply("Sorry, kenn ich nicht!")
    }
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))