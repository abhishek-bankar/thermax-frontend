"use client";

import { SendOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { createData, getData, updateData } from "@/actions/crud-actions";
import { Button, message, Modal } from "antd";
import CustomTextAreaInput from "@/components/FormInputs/CustomTextArea";
import CustomUpload from "@/components/FormInputs/CustomUpload";
import {
  DESIGN_BASIS_REVISION_HISTORY_API,
  REVIEW_RESUBMISSION_EMAIL_API,
} from "@/configs/api-endpoints";
import { DB_REVISION_STATUS } from "@/configs/constants";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as zod from "zod";
import { uploadFile } from "@/actions/file-upload";
import { sendMail } from "@/actions/mail";

export default function ResubmitModel({
  open,
  setOpen,
  projectData,
  dbRevisionHistoryUrl,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectData: any;
  dbRevisionHistoryUrl: string;
}) {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(
      zod.object({
        feedback_description: zod.string().optional(),
        email_attachment: zod.any().optional(),
      })
    ),
    defaultValues: {
      feedback_description: "",
      email_attachment: [],
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    setLoading(true);
    try {
      let revisionData = await getData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${projectData.name}"], ["status", "=", "${DB_REVISION_STATUS.Submitted}"]]&fields=["*"]`
      );
      console.log(revisionData.length);
      if (revisionData.length === 0) {
        console.log(revisionData);
        revisionData = await getData(
          `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${projectData.name}"], ["status", "=", "${DB_REVISION_STATUS.ResubmittedAgain}"]]&fields=["*"]`
        );
      }
      console.log(revisionData);

      const revision_id = revisionData[0]?.name;
      if (!revision_id) {
        setLoading(false);

        return false;
      }
      await updateData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}/${revision_id}`,
        false,
        {
          status: DB_REVISION_STATUS.Resubmitted,
        }
      );
      let attachment_url = "";
      const email_attachment = data.email_attachment;
      if (email_attachment instanceof File) {
        const formData = new FormData();
        formData.append("file", email_attachment, email_attachment.name);
        const fileUploadResponse = await uploadFile(formData);
        attachment_url = fileUploadResponse.file_url;
      }

      // await createData(REVIEW_RESUBMISSION_EMAIL_API, false, {
      //   approver_email: projectData?.approver,
      //   project_owner_email: projectData?.owner,
      //   project_oc_number: projectData?.project_oc_number,
      //   project_name: projectData?.project_name,
      //   feedback_description: data.feedback_description,
      //   subject: `Design Basis Approval - EnIMAX - ${projectData?.project_oc_number}`,
      //   attachments: [{ file_url: attachment_url }],
      // });
      console.log(
        {
          recipient_email: projectData?.approver,
          project_owner_email: projectData?.owner,
          project_oc_number: projectData?.project_oc_number,
          project_name: projectData?.project_name,
          feedback_description: data.feedback_description,
          subject: `Design Basis Approval - EnIMAX - ${projectData?.project_oc_number}`,
          attachments: [{ file_url: attachment_url }],
        },
        "payload for email"
      );

      await sendMail("resubmit_for_review", {
        recipient_email: projectData?.approver,
        project_owner_email: projectData?.owner,
        project_oc_number: projectData?.project_oc_number,
        project_name: projectData?.project_name,
        feedback_description: data.feedback_description,
        subject: `Design Basis Approval - EnIMAX - ${projectData?.project_oc_number}`,
        attachments: [{ file_url: attachment_url }],
      });
      mutate(dbRevisionHistoryUrl);
      setOpen(false);
      message.success("Review submission email sent");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };
  return (
    <Modal
      open={open}
      title={<h1 className="text-center font-bold">Feedback</h1>}
      onCancel={() => setOpen(false)}
      footer={null}
      width={800}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex-1">
          <CustomTextAreaInput
            name="feedback_description"
            control={control}
            label="Description"
            placeholder="Feedback comments..."
          />
        </div>

        <div className="">
          <CustomUpload
            name="email_attachment"
            control={control}
            uploadButtonLabel="Attachment"
            accept="*"
          />
        </div>

        <div className="text-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SendOutlined />}
          >
            Send
          </Button>
        </div>
      </form>
    </Modal>
  );
}
