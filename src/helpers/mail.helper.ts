import nodemailer from 'nodemailer';

export default class MailManager {
    static async send(email: string, subject: string, text: string) {
        const transporter = nodemailer.createTransport({
            service: process.env.NODEMAILER_SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });
    }
}