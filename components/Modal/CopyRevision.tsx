
import { CopyOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { Button, message, Modal } from "antd"; 
import CustomTextAreaInput from "@/components/FormInputs/CustomTextArea"; 
import { useEffect, useState } from "react";
import { SubmitHandler, useForm, Control } from "react-hook-form"; 
import * as zod from "zod";
import { copyRevision } from "@/actions/electrical-load-list";

interface CopyRevisionProps {
  updateTable: (tab: string) => Promise<void>;
  version: any;
  tab: string;
  setVersionToCopy: (el: any) => void;  
}

const schema = zod.object({
  clone_notes: zod.string().optional(),
});

type FormData = zod.infer<typeof schema>;

const defaultValues: FormData = {
  clone_notes: "",
};

const CopyRevision: React.FC<CopyRevisionProps> = ({
  version,
  setVersionToCopy, 
  updateTable,
  tab, 
}) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!version) {
      reset(defaultValues);
    }
  }, [version, reset]);

  const get_tab_name = (key: string) => {
    switch (key) {
      case "1":
        return "load-list";
      case "2":
        return "cable-schedule";
      case "3":
        return "motor-canopy";
      case "4":
        return "motor-specs";
      case "5":
        return "lpbs-specs";
      case "6":
        return "local-isolator";
      case "panel_ga":
        return "panel_ga";
      default:
        return "";
    }
  };

  const handleCancel = () => { 
    reset(defaultValues);
    setVersionToCopy(null);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    try {
      const { clone_notes } = data;
      console.log(version);
      
      const revision_id = version?.key;
      copyRevision({
        revision_id,
        clone_notes,
        module_name: get_tab_name(tab),
      }).then(() => updateTable(tab));

      message.success("Revision Copied Successfully");
      handleCancel();  
    } catch (error) {
      message.error("Failed to clone revision data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={Boolean(version)}
      title={<h1 className="text-center font-bold">Create New Revision</h1>}
      onCancel={handleCancel}
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
            control={control as unknown as Control<any>}
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
};

export default CopyRevision;
