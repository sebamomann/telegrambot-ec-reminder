import * as db from "../mysql_requests.js";

const CALLBACK_PREFIX_EVENTLIST = 'cb_events_init_0'
const CALLBACK_PREFIX_EVENTMENU = 'cb_events_event_'
const CALLBACK_PREFIX_REMINDERCREATE = 'cb_reminder_create_'
const CALLBACK_PREFIX_REMINDERLIST = 'cb_reminder_list_'

export const init = async (ctx, isEdit = false) => {
    const events = await db.getAllEvents();

    if (events.length === 0) {
        ctx.reply("Sorry, aktuell gibt es keine Veranstaltung für die eine Erinnerung einstellbar ist!")
        return;
    }

    var nrOfElements = events.length;
    var events_output = [];

    const until = nrOfElements % 2 === 0 ? nrOfElements : nrOfElements - 1;

    for (var i = 0; i <= until - 1; i += 2) {
        const element1 = { text: events[i].name, callback_data: CALLBACK_PREFIX_EVENTMENU + events[i].id };
        const element2 = { text: events[i + 1].name, callback_data: CALLBACK_PREFIX_EVENTMENU + events[i + 1].id };

        events_output.push([element1, element2]);
    }

    if (until !== nrOfElements) {
        events_output.push([{ text: events[nrOfElements - 1].name, callback_data: CALLBACK_PREFIX_EVENTMENU + events[nrOfElements - 1].id }]);
    }

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: events_output
        })
    };

    const messageText = 'Hier sind die Veranstaltungen, für die Erinnerungen einstellbar sind!'

    if (isEdit) {
        ctx.editMessageText(messageText, options)
    } else {
        ctx.reply(messageText, options)
    }
}

export const event = async (ctx, eventId, isEdit = false) => {
    const event = await db.getEventById(eventId);
    const reminders = await db.getRemindersByEventIdAndUserId(eventId, ctx.callbackQuery.from.id);

    const keyboardLayout = [];
    const keyboardRow1 = [];
    const keyboardBack = [];

    keyboardRow1.push({ text: "Neue Erinnerung", callback_data: CALLBACK_PREFIX_REMINDERCREATE + eventId })
    if (reminders.length >= 1) {
        keyboardRow1.push({ text: "Meine Erinnerungen", callback_data: CALLBACK_PREFIX_REMINDERLIST + eventId })
    }

    keyboardBack.push({ text: "<< Zurück", callback_data: CALLBACK_PREFIX_EVENTLIST })

    keyboardLayout.push(keyboardRow1);
    keyboardLayout.push(keyboardBack);

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboardLayout
        })
    };

    const messageText = `Was möchtest du für das Event *${event.name}* tun`

    if (isEdit) {
        ctx.editMessageText(messageText, options)
    } else {
        ctx.reply(messageText, options)
    }
}