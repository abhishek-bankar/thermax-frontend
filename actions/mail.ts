"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "192.168.255.200", // Your SMTP server
  port: 25, // Default SMTP port for STARTTLS
  secure: false, // Use SSL/TLS? false for STARTTLS
  auth: {
    user: "noreply.enimax@thermaxglobal.com", // SMTP username
    pass: "", // SMTP password (null in your case)
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
});

export default async function sendMail() {
  // Configure Nodemailer with your custom SMTP settings

  // Email details
  const mailOptions = {
    from: "noreply.enimax@thermaxglobal.com", // Sender's email
    to: "abhishek.bankar@inventivebizsol.com", // Recipient's email
    subject: "Test Email from Next.js", // Email subject
    text: "This is a test email sent from a Next.js API route!", // Plain text body
    html: "<p>This is a <strong>test email</strong> sent from a Next.js API route!</p>", // HTML body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error sending email:", error);
  }
}
