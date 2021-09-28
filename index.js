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

    const recipes = [{
        type: 'article',
        id: 1,
        title: "mama",
        description: "descr",
        thumb_url: "https://google.com",
        input_message_content: {
            message_text: "mama"
        },
        reply_markup: Markup.inlineKeyboard([
            Markup.button.url('Go to recipe', "https://sebamomann.de")
        ])
    }]

    ctx.answerInlineQuery(recipes)
})

bot.on('callback_query', (ctx) => {
    // Explicit usage
    ctx.telegram.answerCbQuery(ctx.callbackQuery.id)

    // Using context shortcut
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