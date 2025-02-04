"use server";
import nodemailer from "nodemailer";
import { getData } from "./crud-actions";
import { USER_API } from "@/configs/api-endpoints";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Your SMTP server
  port: Number(process.env.SMTP_PORT), // Default SMTP port for STARTTLS
  secure: false, // Use SSL/TLS? false for STARTTLS
  auth: {
    user: process.env.SMTP_EMAIL, // SMTP username
    pass: process.env.SMTP_EMAIL_PASSWORD, // SMTP password (null in your case)
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates if needed
  },
});

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
const delete_user_notification = (payload: any) => {
  const { first_name, last_name, is_superuser, division_name, sent_by } =
    payload;
  return `
      <div class="container">
        <div class="row">
          <div class="col-12">
            <p>Dear ${first_name}${last_name ? ` ${last_name}` : ""},</p>
            <p>
              ${
                is_superuser
                  ? `You have been removed as an EnIMAX superuser for division ${division_name}.`
                  : `You have been removed as an EnIMAX user for Division ${division_name}.`
              }
            </p>
            <p>Please revert to this email for conflicts, if any.</p>
            <p>
              Regards,<br />
              ${sent_by}
            </p>
          </div>
        </div>
      </div>
    `;
};

const email_verification_template = (payload: any) => {
  const { first_name, last_name, division_name, verification_link, sent_by } =
    payload;
  return `
      <div class="container">
        <div class="row">
          <div class="col-12">
            <p>Dear ${first_name}${last_name ? ` ${last_name}` : ""},</p>
            <p>You have been assigned EnIMAX superuser for Division ${division_name}.</p>
            <p>Click on the link below to verify your account.</p>
            <p>
              <a class="btn btn-primary" href="${verification_link}">
                Verify your email address
              </a>
            </p>
            <p>
              Regards,<br />
              ${sent_by}
            </p>
          </div>
        </div>
      </div>
    `;
};
const reset_password_email = (payload: any) => {
  const { first_name, last_name, link, sent_by } = payload;
  return `
     <div class="container">
    <div class="row">
      <div class="col-12">
        <p>Dear ${first_name}${last_name ? ` ${last_name}` : ""},</p>
        <p>Please click on the following link to set your new password:</p>
        <p>
          <a class="btn btn-primary" href="${link}">Reset your password</a>
        </p>
        <p>
          Thank you,<br />
          ${sent_by}
        </p>
      </div>
    </div>
  </div>
    `;
};
const approver_email_notification = (payload: any) => {
  const {
    first_name,
    last_name = "",
    project_creator_first_name,
    project_creator_last_name = "",
    project_oc_number,
    project_name,
    sent_by,
  } = payload;
  return `
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <p class="h5">
          Dear ${first_name}${last_name ? ` ${last_name}` : ""},
        </p>
        <p class="mt-3">
          You have been assigned as an approver for the following project by 
          ${project_creator_first_name}${
    project_creator_last_name ? ` ${project_creator_last_name}` : ""
  }.
        </p>
        <div class="border p-3 mb-4 bg-light">
          <p class="mb-1"><strong>Project OC No. :</strong> ${project_oc_number}</p>
          <p class="mb-1"><strong>Project Name:</strong> ${project_name}</p>
        </div>
        <p>
          You will be intimated with a separate email once the design parameters are ready for review and approval.
        </p>
        <p class="mt-4">
          Regards,<br />
          ${sent_by}
        </p>
      </div>
    </div>
  </div>
`;
};
const submit_design_basis_approval = (payload: any) => {
  const {
    approver_first_name,
    approver_last_name = "",
    project_oc_number,
    project_name,
    sent_by,
  } = payload;
  return `
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <p class="h5">
          Dear ${approver_first_name}${
    approver_last_name ? ` ${approver_last_name}` : ""
  },
        </p>
        <p class="mt-3">Design Basis for the following project is ready for review.</p>
        <div class="border p-3 mb-4 bg-light">
          <p class="mb-1"><strong>Project OC No. :</strong> ${project_oc_number}</p>
          <p class="mb-1"><strong>Project Name:</strong> ${project_name}</p>
        </div>
        <p>Please review and let me know your comments, if any.</p>
        <p>If there are no changes, then please click the approve button.</p>
        <p class="mt-4">
          Regards,<br />
          ${sent_by}
        </p>
      </div>
    </div>
  </div>
`;
};
const resubmit_for_review = (payload: any) => {
  const {
    owner_first_name,
    owner_last_name = "",
    project_oc_number,
    project_name,
    feedback_description,
    approvar_name,
  } = payload;
  return `
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <p class="h5">
          Dear ${owner_first_name}${
    owner_last_name ? ` ${owner_last_name}` : ""
  },
        </p>
        <p class="mt-3">Design Basis for the following project has some discrepancy.</p>
        <div class="border p-3 mb-4 bg-light">
          <p class="mb-1"><strong>Project OC No. :</strong> ${project_oc_number}</p>
          <p class="mb-1"><strong>Project Name:</strong> ${project_name}</p>
        </div>
        <p>${feedback_description}</p>
        <p>Please review and resubmit for approval.</p>
        <p class="mt-4">
          Regards,<br />
          ${approvar_name}
        </p>
      </div>
    </div>
  </div>
`;
};
const design_basis_approved = (payload: any) => {
  const {
    owner_first_name,
    owner_last_name = "",
    project_oc_number,
    project_name,
    approvar_name,
  } = payload;
  return `
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <p class="h5">
          Dear ${owner_first_name}${
    owner_last_name ? ` ${owner_last_name}` : ""
  },
        </p>
        <p class="mt-3">The design basis for the following project is approved.</p>
        <div class="border p-3 mb-4 bg-light">
          <p class="mb-1"><strong>Project OC No. :</strong> ${project_oc_number}</p>
          <p class="mb-1"><strong>Project Name:</strong> ${project_name}</p>
        </div>
        <p class="mt-4">Regards,<br />${approvar_name}</p>
      </div>
    </div>
  </div>
`;
};
const design_basis_approval_recall = (payload: any) => {
  const {
    owner_first_name,
    owner_last_name = "",
    project_oc_number,
    project_name,
    approvar_name,
  } = payload;
  return `
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <p class="h5">
          Dear ${approvar_name},
        </p>
        <p class="mt-3">The design basis approval request for the following project is recalled and a revised version will be submitted for your review soon.</p>
        <div class="border p-3 mb-4 bg-light">
          <p class="mb-1"><strong>Project OC No. :</strong> ${project_oc_number}</p>
          <p class="mb-1"><strong>Project Name:</strong> ${project_name}</p>
        </div>
        <p class="mt-4">Regards,<br />${owner_first_name} ${owner_last_name}</p>
      </div>
    </div>
  </div>
`;
};
const design_basis_approval_recall_approver_action = (payload: any) => {
  const {
    owner_first_name,
    owner_last_name = "",
    project_oc_number,
    project_name,
    approvar_name,
  } = payload;
  return `
  <div class="container mt-4">
    <div class="row">
      <div class="col-12">
        <p class="h5">
          Dear ${owner_first_name} ${owner_last_name},
        </p>
        <p class="mt-3">I recently reviewed and approved the below project design basis. However, upon further review, I have identified some necessary changes that need to be made before final approval.
As a result, I am reversing the approval status to allow for the required modifications. Please make the necessary updates and resubmit the document for review.</p>
        <div class="border p-3 mb-4 bg-light">
          <p class="mb-1"><strong>Project OC No. :</strong> ${project_oc_number}</p>
          <p class="mb-1"><strong>Project Name:</strong> ${project_name}</p>
        </div>
        <p class="mt-4">Regards,<br />${approvar_name}</p>
      </div>
    </div>
  </div>
`;
};

export const sendMail = async (type: string, payload: any) => {
  let mailOptions: any;

  const User = await getData(`${USER_API}/${payload.recipient_email}`);

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
  if (type === "delete_user_notification") {
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      cc: payload.cc_email,
      subject: payload.subject,
      html: delete_user_notification({
        ...payload,
        first_name: User?.first_name,
        last_name: User?.last_name,
      }),
    };
  }
  if (type === "reset_password_email") {
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      subject: payload.subject,
      html: reset_password_email({
        ...payload,
        first_name: User?.first_name,
        last_name: User?.last_name,
      }),
    };
  }
  if (type === "email_verification_email") {
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      subject: payload.subject,
      html: email_verification_template({
        ...payload,
        first_name: User?.first_name,
        last_name: User?.last_name,
      }),
    };
  }
  if (type === "approver_email_notification") {
    const project_creator = await getData(`${USER_API}/${payload.cc_email}`);
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      subject: payload.subject,
      cc: payload.cc_email,
      html: approver_email_notification({
        ...payload,
        first_name: User?.first_name,
        last_name: User?.last_name,
        project_creator_first_name: project_creator?.first_name,
        project_creator_last_name: project_creator?.last_name,
      }),
    };
  }
  if (type === "submit_design_basis_approval") {
    const project_creator = await getData(`${USER_API}/${payload.cc_email}`);
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      subject: payload.subject,
      cc: payload.cc_email,
      html: submit_design_basis_approval({
        ...payload,
        approver_first_name: User?.first_name,
        approver_last_name: User?.last_name,
        sent_by: project_creator.first_name + " " + project_creator.last_name,
      }),
    };
  }

  if (type === "resubmit_for_review") {
    const project_creator = await getData(
      `${USER_API}/${payload.project_owner_email}`
    );

    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.project_owner_email,
      subject: payload.subject,
      cc: payload.recipient_email,
      html: resubmit_for_review({
        ...payload,
        owner_first_name: project_creator?.first_name,
        owner_last_name: project_creator?.last_name,
        approvar_name: User?.first_name + " " + User?.last_name,
      }),
      attachments: [
        {
          ...payload.attachments,
          path: `${process.env.FRAPPE_BASE_URL}${payload.attachments.file_url}`,
        },
      ],
    };
  }
  if (type === "design_basis_approved") {
    const project_approver = await getData(
      `${USER_API}/${payload.approver_email}`
    );
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.recipient_email,
      subject: payload.subject,
      cc: payload.approver_email,
      html: design_basis_approved({
        ...payload,
        owner_first_name: User?.first_name,
        owner_last_name: User?.last_name,
        approvar_name:
          project_approver?.first_name + " " + project_approver?.last_name,
      }),
    };
  }
  if (type === "design_basis_approval_recall") {
    const project_approver = await getData(
      `${USER_API}/${payload.approver_email}`
    );
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.approver_email,
      subject: payload.subject,
      cc: payload.recipient_email,
      html: design_basis_approval_recall({
        ...payload,
        owner_first_name: User?.first_name,
        owner_last_name: User?.last_name,
        approvar_name:
          project_approver?.first_name + " " + project_approver?.last_name,
      }),
    };
  }
  if (type === "design_basis_approval_recall_approver_action") {
    const project_approver = await getData(
      `${USER_API}/${payload.approver_email}`
    );
    mailOptions = {
      from: "noreply.enimax@thermaxglobal.com",
      to: payload.approver_email,
      subject: payload.subject,
      cc: payload.recipient_email,
      html: design_basis_approval_recall_approver_action({
        ...payload,
        owner_first_name: User?.first_name,
        owner_last_name: User?.last_name,
        approvar_name:
          project_approver?.first_name + " " + project_approver?.last_name,
      }),
    };
  }

  try {
    const info = await transporter.sendMail(mailOptions);

    return { status: 200 };
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
