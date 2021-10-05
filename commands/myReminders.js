import * as db_event from "../mysql_request_event.js";
import * as db_reminder from "../mysql_request_reminder.js";
import * as fs from 'fs'
import { createKeyboardArrayWithWidthOf } from '../keyboard_util.js';
import { sendMessage } from '../send_util.js';
import { secondsToTimeString, timeInputToSeconds } from '../distance_parser.js';
import { parseUserIdFromContext } from '../context_util.js';

const time_sticker_raw = fs.readFileSync('./time_sticker.json');
const time_sticker = JSON.parse(time_sticker_raw);

const CALLBACK_PREFIX_MYREMINDERS_MANAGEEVENT = 'cb_myReminders_manageEvent_';
const CALLBACK_PREFIX_MYREMINDERS_MANAGEREMINDER = 'cb_myReminders_manageReminder_';
const CALLBACK_PREFIX_MYREMINDERS_EDITREMINDER = 'cb_myReminders_editReminder_';
const CALLBACK_PREFIX_MYREMINDERS_DELETEREMINDER = 'cb_myReminders_deleteReminder_';
const CALLBACK_PREFIX_MYREMINDERS_DELETEREMINDERSAVE = 'cb_myReminders_deleteReminderSave_';
const CALLBACK_PREFIX_MYREMINDERS_INIT = 'cb_myReminders_init_';

export const init = async (ctx, isEdit = false) => {
    const events = await db_event.getEventsThatHaveRemindersSetByUser(parseUserIdFromContext(ctx));

    if (events.length === 0) {
        const messageText = `Du hast aktuell für keine Termine Erinnerungen gesetzt.

Lege mit /newReminder neue Erinnerungen an.`
        ctx.reply(messageText)
        return;
    }

    var keyboardElements = [];
    events.forEach(
        (event) => {
            keyboardElements.push({ text: event.name, callback_data: CALLBACK_PREFIX_MYREMINDERS_MANAGEEVENT + event.id });
        }
    );

    var keyboard = createKeyboardArrayWithWidthOf(2, keyboardElements);

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    };

    const messageText = 'Hier sind die Veranstaltungen, für die du Erinnerungen eingestellt hast!'

    sendMessage(ctx, messageText, options, isEdit);
}

export const manageEvent = async function (ctx, eventId, isEdit = false) {
    const event = await db_event.getEventById(eventId);
    const reminders = await db_reminder.getRemindersByEventIdAndUser(eventId, parseUserIdFromContext(ctx));

    if (reminders.length === 0) {
        ctx.reply("Diese Meldung solltest du niemals sehen. Bitte wende dich mit dem Code 'wkhJPKF7' an den Support!")
        return;
    }

    var keyboardElements = [];
    reminders.forEach(
        (reminder) => {
            const humanReadableDistance = secondsToTimeString(reminder.distance);
            keyboardElements.push({ text: humanReadableDistance.trim(), callback_data: CALLBACK_PREFIX_MYREMINDERS_MANAGEREMINDER + reminder.id });
        }
    );

    var keyboard = createKeyboardArrayWithWidthOf(2, keyboardElements);
    keyboard.push([{ text: "<< Zurück", callback_data: CALLBACK_PREFIX_MYREMINDERS_INIT + 0 }])

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    };

    const messageText = `Hier sind deine Erinnerungen für ${event.name}`;

    sendMessage(ctx, messageText, options, isEdit);
}

export const manageReminder = async function (ctx, reminderId, isEdit = false) {
    var reminder;

    try {
        reminder = await db_reminder.getReminderById(reminderId);
    } catch (e) {
        ctx.reply("Es ist ein unerwarteter Fehler aufgetreten!");
        return;
    }

    var keyboard = [
        [
            { text: "Editieren", callback_data: CALLBACK_PREFIX_MYREMINDERS_EDITREMINDER + reminder.id },
            { text: "Löschen", callback_data: CALLBACK_PREFIX_MYREMINDERS_DELETEREMINDER + reminder.id }
        ],
        [
            { text: "<< Zurück", callback_data: CALLBACK_PREFIX_MYREMINDERS_MANAGEEVENT + reminder.eventId }
        ]
    ];

    var options = {
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    };

    const humanReadableDistance = secondsToTimeString(reminder.distance);
    const messageText = `Diese Erinnerung ist auf ${humanReadableDistance.trim()} vor Termin beginn eingestellt. Was möchtest du damit tun?`;

    sendMessage(ctx, messageText, options, isEdit);
}

export const editReminder = async function (ctx, reminderId, isEdit = false) {
    var reminder;

    try {
        reminder = await db_reminder.getReminderById(reminderId);
    } catch (e) {
        console.log("[SQL - ERROR] (editReminder)");
        ctx.reply("Es ist ein unerwarteter Fehler aufgetreten!");
        return;
    }

    ctx.session.nextAction = "myReminders_editReminderSave";
    ctx.session.nextActionData = reminderId;

    const humanReadableDistance = secondsToTimeString(reminder.distance);
    const messageText = `Alles klar, bitte sende mir ein neues Zeitintervall, sodass ich deine ***${humanReadableDistance.trim()}*** Erinnerung ändern kann.
    
Zum Beispiel

    - ***1d*** für 1 Tag vorher
    - ***10m*** für 10 Minuten vorher
    - ***01d03h*** für 1 Tag und 3 Stunden vorher`;

    sendMessage(ctx, messageText, { parse_mode: "Markdown" }, isEdit);
    ctx.replyWithSticker(time_sticker[getRandomInt(time_sticker.length)]);
}

export const editReminderSave = async function (ctx, reminderId, isEdit = false) {
    const reminder = await db_reminder.getReminderJoinEventById(reminderId);

    const input = ctx.message.text;

    const secondsBefore = timeInputToSeconds(input);
    if (secondsBefore === 0) {
        ctx.reply("Das hat nicht geklappt. Bitte gebe eine korrekte Zeitangabe an!");
    } else {
        try {
            await db_reminder.updateReminderDistanceById(reminderId, parseUserIdFromContext(ctx), secondsBefore);

            const humanReadableDistance = secondsToTimeString(secondsBefore).trim();
            var message = `Cool, das war's. Ich werde dich ***${humanReadableDistance}*** vorher an das Event ***${reminder.name}*** erinnern! Du kannst mit /myreminders deine aktuellen Erinnerungen einsehen.`;
            ctx.reply(message, { parse_mode: "Markdown" });
        } catch (e) {
            console.log("[SQL - ERROR] (editReminderSave)");
            ctx.reply("Es ist ein unerwarteter Fehler aufgetreten!");
        }

        ctx.session = null;
    }
}

export const deleteReminder = async function (ctx, reminderId, isEdit = false) {
    var reminder;

    try {
        reminder = await db_reminder.getReminderJoinEventById(reminderId);
    } catch (e) {
        console.log("[SQL - ERROR] (editReminder)");
        ctx.reply("Es ist ein unerwarteter Fehler aufgetreten!");
        return;
    }


    var keyboard = [
        [
            { text: "JA!", callback_data: CALLBACK_PREFIX_MYREMINDERS_DELETEREMINDERSAVE + reminder.id },
            { text: "Zurück", callback_data: CALLBACK_PREFIX_MYREMINDERS_DELETEREMINDER + reminder.id }
        ]
    ];

    var options = {
        parse_mode: "Markdown",
        reply_markup: JSON.stringify({
            inline_keyboard: keyboard
        })
    };

    const humanReadableDistance = secondsToTimeString(reminder.distance).trim();
    const messageText = `Bist du sicher, dass du die ***${humanReadableDistance}*** Erinnerung vom Termin ***${reminder.name}*** löschen möchtest?
    
Dieser Vorgang kann nicht Rückgängig gemacht werden!`;

    sendMessage(ctx, messageText, options, isEdit);
}

export const deleteReminderSave = async function (ctx, reminderId, isEdit = false) {
    const reminder = await db_reminder.getReminderJoinEventById(reminderId);

    try {
        await db_reminder.deleteReminderById(reminderId, parseUserIdFromContext(ctx));

        const humanReadableDistance = secondsToTimeString(reminder.distance).trim();
        var message = `Alles klar! Ich habe die ***${humanReadableDistance}*** Erinnerung vom Event ***${reminder.name}*** soeben gelöscht.`;
        sendMessage(ctx, message, { parse_mode: "Markdown" }, isEdit);
    } catch (e) {
        console.log(e);
        console.log("[SQL - ERROR] (deleteReminderSave)");
        ctx.reply("Es ist ein unerwarteter Fehler aufgetreten!");
    }
}