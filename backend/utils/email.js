const nodemailer = require('nodemailer');
const { pool } = require('../config/database');

const sendEmail = async (options) => {
    try {
        // Attempt to get SMTP config from database settings
        const [settings] = await pool.execute(
            `SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN (
        'smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_username', 'smtp_password', 'mail_from_address', 'mail_from_name'
      )`
        );

        const config = {};
        settings.forEach(s => {
            config[s.setting_key] = s.setting_value;
        });

        // Fallback to user provided Gmail credentials
        const host = config.smtp_host || 'smtp.gmail.com';
        const port = config.smtp_port ? parseInt(config.smtp_port) : 465;
        const secure = config.smtp_encryption === 'ssl' || port === 465; // true for 465, false for other ports

        const user = config.smtp_username || 'arbhuiyan.pits@gmail.com';
        const pass = config.smtp_password || 'zgnd avpj klry ygpt';

        const fromAddress = config.mail_from_address || user;
        const fromName = config.mail_from_name || 'Keyhost Homes';

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });

        const mailOptions = {
            from: `"${fromName}" <${fromAddress}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.htmlMessage || options.message
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to', options.email);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
};
