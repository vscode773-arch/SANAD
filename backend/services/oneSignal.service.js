const axios = require('axios');

const ONESIGNAL_APP_ID = '650ff893-4616-4af8-b668-fe272cc9374c';
const ONESIGNAL_REST_API_KEY = 'fxwiuj3unuzn4mmpyst7byizi'; // Full REST API Key

exports.sendNotificationToAdmins = async (title, message) => {
    console.log('🔔 Attempting to send notification...');
    console.log('📝 Title:', title);
    console.log('📝 Message:', message);

    try {
        const payload = {
            app_id: ONESIGNAL_APP_ID,
            headings: { "en": title, "ar": title },
            contents: { "en": message, "ar": message },
            included_segments: ["Total Subscriptions"]
        };

        console.log('📤 Sending to OneSignal with payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
                }
            }
        );

        console.log('✅ Notification sent successfully!');
        console.log('📊 Response:', JSON.stringify(response.data, null, 2));
        console.log('👥 Recipients:', response.data.recipients);

        return response.data;
    } catch (error) {
        console.error('❌ Error sending notification:');
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error message:', error.message);
        }
        throw error;
    }
};
