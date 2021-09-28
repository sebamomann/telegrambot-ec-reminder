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

bot.command("remind", (ctx) => {
    ctx.reply(`Yo ${ctx.message.from.username}`)
    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Some button text 1', callback_data: '1' }, { text: 'Some button text 2', callback_data: '2' }],
                [{ text: 'Some button text 3', callback_data: '3' }]
            ]
        })
    };

    ctx.reply('Moin',
        options
    )
})

bot.on('callback_query', (ctx) => {
    ctx.reply(`Du hast ID ${ctx.callbackQuery.id} mit Text ${ctx.callbackQuery.message} gedrückt`);
    ctx.answerCbQuery()
})

bot.on('inline_query', (ctx) => {
    const result = ["Ja", "Ne", "Lass Mal"]
    // Explicit usage
    ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

    // Using context shortcut
    ctx.answerInlineQuery(result)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))