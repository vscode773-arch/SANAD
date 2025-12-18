const axios = require('axios');

const ONESIGNAL_APP_ID = '650ff893-4616-4af8-b668-fe272cc9374c';
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY || 'fxwiuj3wnuzn4mmpyst7byizi';

exports.sendNotificationToAdmins = async (title, message) => {
    try {
        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            {
                app_id: ONESIGNAL_APP_ID,
                headings: { "en": title, "ar": title },
                contents: { "en": message, "ar": message },
                // TEMPORARY: Send to everyone to test connectivity
                included_segments: ["Total Subscriptions"],
                // filters: [
                //     { field: "tag", key: "role", relation: "=", value: "ADMIN" }
                // ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${ONESIGNAL_API_KEY}`
                }
            }
        );
        console.log('Notification sent:', response.data);
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
    }
};
