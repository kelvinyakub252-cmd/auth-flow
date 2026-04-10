const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) console.error("Email config error", err);
  else console.log("Email server is ready!");
});

const sendResetPassword = async (email, token) => {
  const mailOptions = {
    from: `"Auth Flow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Password",
    html: `Here is your reset token <a href="http://127.0.0.1:5500/frontend/reset-password.html?token=${token}">click to reset password</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendResetPassword;
