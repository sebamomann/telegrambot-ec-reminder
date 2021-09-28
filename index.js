import { Telegraf, Markup } from 'telegraf'

const bot = new Telegraf(process.env.BOT_API_TOKEN)

bot.command('quit', (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id)

    // Using context shortcut
    ctx.leaveChat()
})

/**
 * COMMANDS
 */

bot.on("command", (ctx) => {
    console.log(ctx);
})

bot.on('callback_query', (ctx) => {
    ctx.reply(`Du hast ID ${ctx.callbackQuery.data} gedrückt`);
    ctx.answerCbQuery()
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))