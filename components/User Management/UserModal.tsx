import { zodResolver } from "@hookform/resolvers/zod";
import { Button, message, Modal } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { updateData } from "@/actions/crud-actions";
import { registerNewUser } from "@/actions/register";
import CustomUpload from "@/components/FormInputs/CustomUpload";
import { THERMAX_USER_API, USER_API } from "@/configs/api-endpoints";
import { THERMAX_USER } from "@/configs/constants";
import AlertNotification from "../AlertNotification";
import CustomTextInput from "../FormInputs/CustomInput";
import { uploadFile } from "@/actions/file-upload";

// Types and Interfaces
interface UserFormModalProps {
  open: boolean;
  setOpen: (success: boolean) => void;
  editMode: boolean;
  values?: UserFormData;
  editEventTrigger?: boolean;
  userInfo: {
    division: string;
  };
}

const userFormSchema = z.object({
  first_name: z.string({
    required_error: "First name is required",
    invalid_type_error: "First name must be a string",
  }),
  last_name: z.string({
    required_error: "Last name is required",
    invalid_type_error: "Last name must be a string",
  }),
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),
  name_initial: z
    .string({
      required_error: "Initials is required",
    })
    .max(3, "Initials should not exceed 3 characters"),
  digital_signature: z.any().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const getDefaultValues = (
  editMode: boolean,
  values?: UserFormData
): UserFormData => ({
  first_name: editMode && values ? values.first_name : "",
  last_name: editMode && values ? values.last_name : "",
  email: editMode && values ? values.email : "",
  name_initial: editMode && values ? values.name_initial : "",
  digital_signature:
    editMode && values?.digital_signature ? [values.digital_signature] : [],
});

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  setOpen,
  editMode,
  values,
  editEventTrigger,
  userInfo,
}) => {
  const [infoMessage, setInfoMessage] = useState("");
  const [status, setStatus] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: getDefaultValues(editMode, values),
    mode: "onSubmit",
  });

  useEffect(() => {
    console.log(values);

    reset(getDefaultValues(editMode, values));
  }, [editMode, reset, values, editEventTrigger]);

  const handleCancel = () => {
    setOpen(false);
    reset(getDefaultValues(false));
    setInfoMessage("");
    setStatus("");
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await uploadFile(formData);
    return response.file_url;
  };

  const handleCreateUser = async (userData: UserFormData): Promise<void> => {
    try {
      // Handle digital signature upload
      if (userData.digital_signature?.length > 0) {
        const file = userData.digital_signature[0];
        if (file instanceof File) {
          userData.digital_signature = await handleFileUpload(file);
        }
      } else {
        userData.digital_signature = "";
      }

      const registerRes = await registerNewUser(
        userData,
        THERMAX_USER,
        userInfo?.division,
        false,
        userData.name_initial
      );

      if (registerRes?.status === 409) {
        setStatus("error");
        setInfoMessage("User Already Exists");
        return;
      }

      setOpen(true);
      message.success("User Created Successfully");
    } catch (error) {
      setOpen(false);
      throw error;
    }
  };

  const handleUpdateUser = async (userData: UserFormData): Promise<void> => {
    try {
      // Handle digital signature upload
      if (userData.digital_signature?.length > 0) {
        const file = userData.digital_signature[0];
        if (file instanceof File) {
          userData.digital_signature = await handleFileUpload(file);
        } else if (typeof file === "string") {
          userData.digital_signature = file;
        }
      } else {
        userData.digital_signature = "";
      }

      await updateData(`${USER_API}/${values?.email}`, false, userData);
      await updateData(`${THERMAX_USER_API}/${values?.email}`, false, userData);

      setOpen(true); // Indicate success to parent
      message.success("User Updated Successfully");
    } catch (error) {
      setOpen(false); // Indicate failure to parent
      throw error;
    }
  };

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    setLoading(true);
    try {
      if (editMode) {
        await handleUpdateUser(data);
      } else {
        await handleCreateUser(data);
      }
    } catch (error) {
      setStatus("error");
      setInfoMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <h1 className="text-center font-bold">
          {editMode ? "Edit" : "Add New"} User
        </h1>
      }
      onCancel={handleCancel}
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <CustomTextInput
              name="first_name"
              control={control}
              label="First Name"
              type="text"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              name="last_name"
              control={control}
              label="Last Name"
              type="text"
            />
          </div>
        </div>
        <div className="flex-1">
          <CustomTextInput
            name="email"
            control={control}
            label="Email"
            type="email"
            disabled={editMode}
          />
        </div>
        <div className="flex-1">
          <CustomTextInput
            name="name_initial"
            control={control}
            label="Initials"
            type="text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <CustomUpload
              name="digital_signature"
              control={control}
              uploadButtonLabel="Digital Signature"
              accept="image/*"
            />
          </div>
          {values?.digital_signature && (
            <div>
              <Image
                src={`${process.env.FRAPPE_BASE_URL}${values.digital_signature}`}
                width={100}
                height={100}
                alt="Digital Signature"
              />
            </div>
          )}
        </div>

        <AlertNotification message={infoMessage} status={status} />
        <div className="text-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
