const sendMail = require("../utils/sendMail");

exports.submitContactForm = async (req, res) => {
    const { name, email, phoneNumber, subject, message } = req.body;

    if (!name || !email || !phoneNumber || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required.",
        });
    }

    const response = await sendMail({
        name,
        email,
        phoneNumber,
        subject,
        message,
    });

    if (response.success) {
        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully.",
        });
    } else {
        return res.status(500).json({
            success: false,
            message: "Error sending message.",
            error: response.error,
        });
    }
};
