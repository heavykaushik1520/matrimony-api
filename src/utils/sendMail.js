const nodemailer = require("nodemailer");

async function sendMail({ name, email, phoneNumber, subject, message }) {
    try {
        const transporter = nodemailer.createTransport({
            host: "mail.hrudaysparshavivahamandal.com",
            port: 465,
            secure: true,
            auth: {
                user: "noreply@hrudaysparshavivahamandal.com",
                pass: "Hrudaysparsha@123",
            },
        });

        const mailOptions = {
            from: '"Website Contact" <noreply@hrudaysparshavivahamandal.com>',
            to: "kaushikmandavkar6@gmail.com",
            subject: subject || "New Message Received",
            html: `
                <h2>New Contact Inquiry</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong> ${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Email error:", error);
        return { success: false, error };
    }
}

module.exports = sendMail;
