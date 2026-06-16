const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "School Hub <hiteshmalkiya88@gmail.com>",
    to: email,
    subject: "School Claim OTP Verification",
    text: `Your OTP is: ${otp}`,
  });
};

module.exports = sendOTP;