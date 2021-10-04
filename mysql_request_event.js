import { con } from './mysql_requests.js'

export async function getEventsThatHaveRemindersSetByUser(userId) {
    var sql = `SELECT * FROM event JOIN reminder ON event.id = reminder.eventId WHERE reminder.userId = ?`;

    var results, fields;

    try {
        [results, fields] = await con.execute(sql, [userId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch events that have reminders set by user");
        console.log("[SQL - ERROR] Reason: " + err)
        throw new Error(err);
    }

    return results;
};

export async function getEventById(eventId) {
    var sql = 'SELECT * FROM event WHERE id = ?';

    const [results] = await con.execute(sql, [eventId]);

    return results[0];
}