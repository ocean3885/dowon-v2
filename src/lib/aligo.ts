
const ALIGO_API_KEY = process.env.ALIGO_API_KEY;
const ALIGO_USER_ID = process.env.ALIGO_USER_ID;
const ALIGO_SENDER = process.env.ALIGO_SENDER;
// If receiver is not set, we might default to a specific number or fail.
// For now, let's assume the user puts it in env or we can potentially send to the sender for testing if they want.
// But standard practice is to have a receiver.
const ALIGO_RECEIVER = process.env.ALIGO_RECEIVER;

export async function sendSMS(content: string) {
    if (!ALIGO_API_KEY || !ALIGO_USER_ID || !ALIGO_SENDER) {
        console.error('Aligo API credentials missing');
        return false;
    }

    if (!ALIGO_RECEIVER) {
        console.warn('ALIGO_RECEIVER not set. Skipping SMS.');
        return false;
    }

    try {
        const formData = new FormData();
        formData.append('key', ALIGO_API_KEY);
        formData.append('user_id', ALIGO_USER_ID);
        formData.append('sender', ALIGO_SENDER);
        formData.append('receiver', ALIGO_RECEIVER);
        formData.append('msg', content);
        // formData.append('testmode_yn', 'Y'); // Uncomment for testing without deduction if desired

        const response = await fetch('https://apis.aligo.in/send/', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.result_code === '1') {
            console.log('SMS sent successfully:', result);
            return true;
        } else {
            console.error('Aligo SMS failed:', result);
            return false;
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
        return false;
    }
}
