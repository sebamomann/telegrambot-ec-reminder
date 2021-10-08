import { pool } from './mysql_connection.js'

export async function createReminder(eventId, userId, distance) {
    var sql = 'INSERT INTO reminder (userId, eventId, distance) VALUES (?, ?, ?)';

    var result, field;

    try {
        [result, field] = await pool.execute(sql, [userId, eventId, distance]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not create reminder");
        console.log("[SQL - ERROR] Reason: " + err)
        throw new Error(err);
    }
}


export async function getRemindersByEventIdAndUser(eventId, userId) {
    var sql = `SELECT * FROM reminder WHERE eventId = ? and userId = ? ORDER BY distance DESC`;

    var results, fields;

    try {
        [results, fields] = await pool.execute(sql, [eventId, userId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch reminders by event and user");
        console.log("[SQL - ERROR] Reason: " + err)
        throw new Error(err);
    }

    return results;
};

export async function getReminderById(reminderId) {
    var sql = 'SELECT * FROM reminder WHERE id = ?';

    var results, fields;

    try {
        [results, fields] = await pool.execute(sql, [reminderId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch reminder by id");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(err);
    }

    return results[0];
}

export async function getReminderJoinEventById(reminderId) {
    var sql = 'SELECT r.*, e.name as name FROM reminder r JOIN event e ON r.eventId = e.id WHERE r.id = ?';

    var results, fields;

    try {
        [results, fields] = await pool.execute(sql, [reminderId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch reminder join event by id");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(err);
    }

    return results[0];
}

export async function updateReminderDistanceById(reminderId, userId, distance) {
    var sql = 'UPDATE reminder SET distance = ? WHERE id = ? and userId = ?';

    var results, fields;

    try {
        [results, fields] = await pool.execute(sql, [distance, reminderId, userId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not fetch reminder join event by id");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(err);
    }

    return results[0];
}

export async function deleteReminderById(reminderId, userId) {
    var sql = 'DELETE FROM reminder WHERE id = ? and userId = ?';

    var results, fields;

    try {
        [results, fields] = await pool.execute(sql, [reminderId, userId]);
    } catch (e) {
        console.log("[SQL - ERROR] Could not delete reminder by id");
        console.log("[SQL - ERROR] Reason: " + e)
        throw new Error(err);
    }

    return results[0];
}