import nodemailer from 'nodemailer';

export default class MailManager {
    static getTransporter() {
        return nodemailer.createTransport({
            service: process.env.NODEMAILER_SERVICE,
            port: 587,
            secure: true,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });
    }
    static async send(email: string, subject: string, text: string) {
        const transporter = MailManager.getTransporter();

        await transporter.sendMail({
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: subject,
            text: text,
        });
    }

    static async sendFrom(email: string, subject: string, text: string) {
        const transporter = MailManager.getTransporter();

        await transporter.sendMail({
            from: process.env.NODEMAILER_USER,
            to: process.env.NODEMAILER_USER,
            subject: subject,
            text: `Message de ${email}\n\n` + text,
        });
    }
}