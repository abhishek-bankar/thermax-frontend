import { CopyOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { copyDesignBasisRevision } from "@/actions/design-basis_revision";
import { Button, message, Modal } from "antd";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import CustomTextAreaInput from "@/components/FormInputs/CustomTextArea";
import { THERMAX_USER_API } from "@/configs/api-endpoints";
import { useDropdownOptions } from "@/hooks/useDropdownOptions";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as zod from "zod";

export default function CopyRevisionModel({
  open,
  setOpen,
  projectData,
  oldRevisionId,
  dbRevisionHistoryUrl,
  setCopyRevisionId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  projectData: any;
  oldRevisionId: string;
  dbRevisionHistoryUrl: string;
  setCopyRevisionId: (revision_id: string) => void;
}) {
  const { name: project_id, approver } = projectData || {};
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(
      zod.object({
        clone_notes: zod.string().optional(),
      })
    ),
    defaultValues: {
      clone_notes: "",
    },
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    setLoading(true);
    try {
      // API call
      const { clone_notes } = data;
      await copyDesignBasisRevision(
        project_id,
        approver,
        oldRevisionId,
        clone_notes
      );
      mutate(dbRevisionHistoryUrl);
      message.success("Revision Copied Successfully");
      setOpen(false);
    } catch (error) {
      message.error("Failed to clone revision data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      title={<h1 className="text-center font-bold">Create New Revision</h1>}
      onCancel={() => {
        setCopyRevisionId("");
        reset({
          clone_notes: "",
        });
        setOpen(false);
      }}
      footer={null}
    >
      <form
        onSubmit={(event) => {
          event.stopPropagation();
          handleSubmit(onSubmit)(event);
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex-1">
          <CustomTextAreaInput
            name="clone_notes"
            control={control}
            label="Revision Description"
            placeholder="Revision Description..."
          />
        </div>

        <div className="text-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<CopyOutlined />}
          >
            Copy Revision
          </Button>
        </div>
      </form>
    </Modal>
  );
}
