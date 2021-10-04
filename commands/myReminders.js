import * as db_event from "../mysql_request_event.js";
import * as db_reminder from "../mysql_request_reminder.js";
import { createKeyboardArrayWithWidthOf } from '../keyboard_util.js';
import { sendMessage } from '../send_util.js';
import { secondsToTimeString } from '../distance_parser.js';
import { parseUserIdFromContext } from '../context_util.js';

const CALLBACK_PREFIX_MYREMINDERS_MANAGEEVENT = 'cb_myReminders_manageEvent_';
const CALLBACK_PREFIX_MYREMINDERS_MANAGEREMINDER = 'cb_myReminders_manageReminder_';
const CALLBACK_PREFIX_MYREMINDERS_EDITREMINDER = 'cb_myReminders_editReminder_';
const CALLBACK_PREFIX_MYREMINDERS_DELETEREMINDER = 'cb_myReminders_deleteReminder_';
const CALLBACK_PREFIX_MYREMINDERS_INIT = 'cb_myReminders_init_';

export const init = async (ctx, isEdit = false) => {
    const events = await db_event.getEventsThatHaveRemindersSetByUser(parseUserIdFromContext(ctx));

    if (events.length === 0) {
        ctx.reply("Du hast aktuell für keine Termine Erinnerungen gesetzt.")
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

    const messageText = 'Hier sind die Veranstaltungen, für die Erinnerungen einstellbar sind!'

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