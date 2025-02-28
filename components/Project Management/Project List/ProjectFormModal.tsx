"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { mutate } from "swr";
import * as zod from "zod";
import { updateData } from "@/actions/crud-actions";
import AlertNotification from "@/components/AlertNotification";
import CustomAutoComplete from "@/components/FormInputs/AutocompleteWithCreate";
import CustomTextInput from "@/components/FormInputs/CustomInput";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import {
  CLIENT_NAME_API,
  CONSULTANT_NAME_API,
  getProjectListUrl,
  PROJECT_API,
  THERMAX_USER_API,
} from "@/configs/api-endpoints";
import {
  useDropdownOptions,
  useNewDropdownOptions,
} from "@/hooks/useDropdownOptions";
import { createThermaxProject } from "@/actions/project";

const getProjectFormValidationSchema = (
  project_oc_numbers: string[],
  editMode: boolean,
  clientNameOptions: any,
  consultantNameOptions: any
) => {
  const clientName = clientNameOptions.map((option: any) => option.value);
  const consultantName = consultantNameOptions.map(
    (option: any) => option.value
  );
  return zod.object({
    project_name: zod.string({
      required_error: "Project name is required",
      message: "Project name is required",
    }),
    project_oc_number: zod
      .string({
        required_error: "Project OC number is required",
        message: "Project OC number is required",
      })
      .refine(
        (value) => {
          return editMode || !project_oc_numbers.includes(value);
        },
        { message: "Project OC number already exists" }
      ),
    client_name: zod
      .string({
        required_error: "Client name is required",
        message: "Client name is required",
      })
      .refine(
        (value) => {
          return clientName.includes(value);
        },
        { message: "Please create client first!" }
      ),
    consultant_name: zod
      .string({
        required_error: "Consultant name is required",
        message: "Consultant name is required",
      })
      .refine(
        (value) => {
          return consultantName.includes(value);
        },
        { message: "Please create consultant first!" }
      ),

    approver: zod.string({
      required_error: "Approver is required",
      message: "Approver is required",
    }),
  });
};

const getDefaultValues = (editMode: boolean, values: any) => {
  return {
    project_name: editMode ? values?.project_name : null,
    project_oc_number: editMode ? values?.project_oc_number : null,
    client_name: editMode ? values?.client_name : null,
    consultant_name: editMode ? values?.consultant_name : null,
    approver: editMode ? values?.approver : null,
  };
};

export default function ProjectFormModal({
  open,
  setOpen,
  editMode,
  values,
  userInfo,
  getProjectUrl,
  projectOCNos,
}: any) {
  const { division } = userInfo;

  const [infoMessage, setInfoMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const getClientOptionsUrl = `${CLIENT_NAME_API}?fields=["*"]&filters=[["division", "=", "${division}"]]`;
  const getConsultantOptionsUrl = `${CONSULTANT_NAME_API}?fields=["*"]&filters=[["division", "=", "${division}"]]`;

  const { dropdownOptions: clientNameOptions } = useNewDropdownOptions(
    getClientOptionsUrl,
    "client_name"
  );
  const { dropdownOptions: consultantNameOptions } = useNewDropdownOptions(
    getConsultantOptionsUrl,
    "consultant_name"
  );
  const { dropdownOptions: approverOptions } = useDropdownOptions(
    `${THERMAX_USER_API}?fields=["*"]&filters=[["division", "=",  "${userInfo?.division}"], ["email", "!=", "${userInfo?.email}"]]`,
    "name"
  );
  console.log("clientNameOptions", clientNameOptions);
  console.log("consultantNameOptions", consultantNameOptions);

  const ProjectFormValidationSchema = getProjectFormValidationSchema(
    projectOCNos,
    editMode,
    clientNameOptions,
    consultantNameOptions
  );

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: zodResolver(ProjectFormValidationSchema),
    defaultValues: getDefaultValues(editMode, values),
    mode: "onBlur",
  });

  useEffect(() => {
    reset(getDefaultValues(editMode, values));
  }, [editMode, reset, values]);

  const handleCancel = () => {
    setOpen(false);
    reset(getDefaultValues(false, {}));
    setInfoMessage("");
    setStatus("");
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await createThermaxProject(projectData, userInfo);
      setOpen(false);
      message.success("Project created successfully");
    } catch (error: any) {
      throw error;
    } finally {
      mutate(getProjectUrl);
    }
  };

  const handleUpdateProject = async (projectData: any) => {
    try {
      await updateData(`${PROJECT_API}/${values.name}`, false, projectData);
      setOpen(false);
      message.success("Project updated successfully");
    } catch (error: any) {
      throw error;
    } finally {
      mutate(getProjectUrl);
    }
  };

  // Helper function for handling errors
  const handleError = (error: any) => {
    setStatus("error");
    try {
      const errorObj = JSON.parse(error?.message) as any;
      setInfoMessage(errorObj?.message);
    } catch (parseError) {
      console.error(parseError);
      // If parsing fails, use the raw error message
      setInfoMessage(error?.message || "An unknown error occurred");
    }
  };

  const onSubmit: SubmitHandler<
    zod.infer<typeof ProjectFormValidationSchema>
  > = async (data: any) => {
    setLoading(true);
    data = { ...data, division: userInfo?.division };
    try {
      if (editMode) {
        await handleUpdateProject(data);
      } else {
        await handleCreateProject(data);
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      mutate(getProjectListUrl);
      setLoading(false);
      // setOpen(false)
    }
  };

  return (
    <Modal
      open={open}
      title={
        <h1 className="text-center font-bold">{`${
          editMode ? "Edit" : "Add New"
        } Project`}</h1>
      }
      onCancel={handleCancel}
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <CustomTextInput
              name="project_name"
              control={control}
              label="Project Name"
              type="text"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              name="project_oc_number"
              control={control}
              label="Project OC NO."
              type="text"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <CustomAutoComplete
              defaultOption={editMode ? watch("client_name") : null}
              name="client_name"
              control={control}
              label="Client Name"
              options={clientNameOptions}
              optionKeyName="client_name"
              createOptionUrl={CLIENT_NAME_API}
              placeholder="Select or create a new client by typing..."
              mutateUrl={getClientOptionsUrl}
              extraParams={{ division }}
            />
          </div>
          <div className="flex-1">
            <CustomAutoComplete
              defaultOption={editMode ? watch("consultant_name") : null}
              name="consultant_name"
              control={control}
              label="Consultant Name"
              options={consultantNameOptions}
              optionKeyName="consultant_name"
              createOptionUrl={CONSULTANT_NAME_API}
              placeholder="Select or create a new consultant by typing..."
              mutateUrl={getConsultantOptionsUrl}
              extraParams={{ division }}
            />
          </div>
        </div>

        <div>
          <CustomSingleSelect
            name="approver"
            control={control}
            label="Approver"
            options={approverOptions}
          />
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
}
