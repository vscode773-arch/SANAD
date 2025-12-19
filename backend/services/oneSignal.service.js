const axios = require('axios');

const ONESIGNAL_APP_ID = 'acde8867-8983-478b-8e16-55d6ff644c10'; // NEW APP ID
const ONESIGNAL_REST_API_KEY = 'os_v2_app_vtpiqz4jqndyxdqwkxlp6zcmccvu5vlcu6ru5y4puwiiftgc7m6tutgcpzvvykkwv7j4ytcikrj7qk6v4lookrjoaylbotnhqu26j5q'; // NEW v2 KEY

exports.sendNotificationToAdmins = async (title, message) => {
    console.log('🔔 Attempting to send notification to NEW APP...');
    console.log('📝 Title:', title);

    try {
        const payload = {
            app_id: ONESIGNAL_APP_ID,
            headings: { "en": title, "ar": title },
            contents: { "en": message, "ar": message },
            included_segments: ["Total Subscriptions"]
        };

        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ONESIGNAL_REST_API_KEY}`
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
