const axios = require('axios');

const ONESIGNAL_APP_ID = "650ff893-4616-4af8-b668-fe272cc9374c";
const ONESIGNAL_API_KEY = "os_v2_app_muh7re2gczfprnti7ytszsjxjrn4x55g6osegwefwzrmzhcwq3vbhh7j2figjbrihezyon575ior2hfrhfbszf6feslasoru4vjaija"; // New v2 Key

exports.sendNotificationToAdmins = async (title, message) => {
    try {
        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            {
                app_id: ONESIGNAL_APP_ID,
                headings: { "en": title, "ar": title },
                contents: { "en": message, "ar": message },
                included_segments: ["Total Subscriptions"]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ONESIGNAL_API_KEY}`
                }
            }
        );
        console.log('Notification sent:', response.data);
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
    }
};
