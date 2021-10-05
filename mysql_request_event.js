import { con } from './mysql_requests.js'

export async function getAllEvents() {
    var sql = 'SELECT * FROM event';

    var results, fields;

    try {
        [results, fields] = await con.execute(sql,);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch all events");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(e);
    }

    return results;
}

export async function getEventsThatHaveRemindersSetByUser(userId) {
    var sql = `SELECT DISTINCT e.* FROM event e JOIN reminder ON e.id = reminder.eventId WHERE reminder.userId = ?`;

    var results, fields;

    try {
        [results, fields] = await con.execute(sql, [userId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch events that have reminders set by user");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(e);
    }

    return results;
};

export async function getEventById(eventId) {
    var sql = 'SELECT * FROM event WHERE id = ?';

    var results, fields;

    try {
        [results, fields] = await con.execute(sql, [eventId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch event by id");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(e);
    }

    return results[0];
}