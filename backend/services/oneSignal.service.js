const axios = require('axios');
const prisma = require('../utils/prisma'); // Need prisma to check settings

const ONESIGNAL_APP_ID = '650ff893-4616-4af8-b668-fe272cc9374c';
const ONESIGNAL_API_KEY = "fxwiuj3wnuzn4mmpyst7byizi"; // REST API Key

exports.sendNotificationToAdmins = async (title, message) => {
    try {
        // CHECK IF NOTIFICATIONS ARE ENABLED
        const setting = await prisma.systemSetting.findUnique({ where: { key: 'NOTIFICATIONS_ENABLED' } });
        const isEnabled = setting ? setting.value === 'true' : true; // Default to true

        if (!isEnabled) {
            console.log("🚫 Notifications checks: DISABLED globally by admin.");
            return;
        }

        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            {
                app_id: ONESIGNAL_APP_ID,
                headings: { "en": title, "ar": title },
                contents: { "en": message, "ar": message },
                // REVERTED: Send to ALL users to ensure delivery (User Request)
                included_segments: ["Total Subscriptions"]
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
