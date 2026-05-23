const RESEND_API_URL = 'https://api.resend.com/emails';

type SendEmailParams = {
    to: string;
    subject: string;
    html: string;
    text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
        throw new Error('메일 발송 설정이 없습니다.');
    }

    const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from,
            to,
            subject,
            html,
            text,
        }),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        console.error('Email send failed:', data);
        throw new Error('메일 발송에 실패했습니다.');
    }

    return data;
}
