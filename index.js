import * as  telegraf from 'telegraf'

const bot = new telegraf.Telegraf(process.env.BOT_API_TOKEN)

bot.command('quit', (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id)

    // Using context shortcut
    ctx.leaveChat()
})

bot.on('text', (ctx) => {
    // Explicit usage
    ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`)

    // Using context shortcut
    ctx.reply(`Hello ${ctx.state.role}`)
})

bot.command("remind", (ctx) => {
    console.log(ctx);
    ctx.reply(`Yo`)
})

bot.on('callback_query', (ctx) => {
    // Explicit usage
    ctx.telegram.answerCbQuery(ctx.callbackQuery.id)

    // Using context shortcut
    ctx.answerCbQuery()
})

bot.on('inline_query', (ctx) => {
    const result = []
    // Explicit usage
    ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

    // Using context shortcut
    ctx.answerInlineQuery(result)
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))