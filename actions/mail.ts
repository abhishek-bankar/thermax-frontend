"use server";
import nodemailer from "nodemailer";
import { getData } from "./crud-actions";
import { USER_API } from "@/configs/api-endpoints";
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

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: "rajrajguru84080@gmail.com",
//     pass: "rtle qkit yzvk ekvp",
//   },
// });

const send_credentials_template = (payload: any) => {
  const {
    first_name,
    last_name,
    recipient_email,
    password,
    is_superuser,
    division_name,
    sent_by,
  } = payload;

  // Construct the HTML string for the email template
  const htmlString = `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <p class="h5">
            Dear ${first_name}${last_name ? ` ${last_name}` : ""},
          </p>
          <p>
            ${
              is_superuser
                ? `You have been assigned EnIMAX superuser for division ${division_name}`
                : `You have been assigned EnIMAX user for Division ${division_name}`
            }
          </p>
          <p class="mt-3">Please see your login details:</p>
          <div class="border p-3 mb-4 bg-light">
            <p class="mb-1"><strong>Email Id:</strong> ${recipient_email}</p>
            <p class="mb-1"><strong>Password:</strong> ${password}</p>
          </div>
          <p>
            Please login using the same credentials, or you can use the change password facility to set your own password.
          </p>
          <p class="mt-4">Regards,<br />${sent_by}</p>
        </div>
      </div>
    </div>
  `;
  return htmlString;
};

export const sendMail = async (type: string, payload: any) => {
  let mailOptions: any;
  console.log(type);
  console.log(payload);

  const User = await getData(`${USER_API}/${payload.recipient_email}`);
  console.log(User);

  //   const mailOptions = {
  //     from: "noreply.enimax@thermaxglobal.com", // Sender's email
  //     to: "rajrajguru84080@gmail.com", // Recipient's email
  //     subject: "Test Email from Next.js", // Email subject
  //     text: "This is a test email sent from a Next.js API route!", // Plain text body
  //     html: "<p>This is a <strong>test email</strong> sent from a Next.js API route!</p>", // HTML body
  //   };

  if (type === "send_credentials") {
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      cc: payload.cc_email,
      subject: payload.subject,
      html: send_credentials_template({
        ...payload,
        first_name: User?.first_name,
        last_name: User?.last_name,
      }),
    };
  }
  //   console.log(mailOptions, "options");

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
