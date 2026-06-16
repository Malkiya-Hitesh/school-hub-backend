const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "School Hub <no-reply@schoolhub.com>",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};

module.exports = sendOTPEmail;