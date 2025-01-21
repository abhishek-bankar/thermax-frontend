"use client";

import { createData, updateData } from "@/actions/crud-actions";
import { copyThermaxProject, createThermaxProject } from "@/actions/project";
import CustomAutoComplete from "@/components/FormInputs/AutocompleteWithCreate";
import CustomTextInput from "@/components/FormInputs/CustomInput";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import {
  CLIENT_NAME_API,
  CONSULTANT_NAME_API,
  THERMAX_USER_API,
  PROJECT_API,
  getProjectListUrl,
} from "@/configs/api-endpoints";
import { useDropdownOptions } from "@/hooks/useDropdownOptions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, message, Modal } from "antd";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { mutate } from "swr";
import * as zod from "zod";

const getProjectFormValidationSchema = (project_oc_numbers: string[]) => {
  return zod.object({
    project_name: zod
      .string({
        required_error: "Project name is required",
        message: "Project name is required",
      })
      .min(3, { message: "Project name should be atleast 3 characters" }),
    project_oc_number: zod
      .string({
        required_error: "Project OC number is required",
        message: "Project OC number is required",
      })
      .refine(
        (value) => {
          return !project_oc_numbers.includes(value);
        },
        { message: "Project OC number already exists" }
      ),
    client_name: zod
      .string({
        required_error: "Client name is required",
        message: "Client name is required",
      })
      .min(3, { message: "Please select client name." }),
    consultant_name: zod
      .string({
        required_error: "Consultant name is required",
        message: "Consultant name is required",
      })
      .min(3, { message: "Please select consultant name." }),
    approver: zod
      .string({
        required_error: "Approver is required",
        message: "Approver is required",
      })
      .min(3, { message: "Please select approver" }),
  });
};

const CopyProjectModel = ({
  open,
  setOpen,
  projectRowData,
  projectOCNos,
  userInfo,
  getProjectUrl,
}: {
  open: boolean;
  setOpen: any;
  projectRowData: any;
  projectOCNos: string[];
  userInfo: any;
  getProjectUrl: string;
}) => {
  const [loading, setLoading] = useState(false);

  const { dropdownOptions: clientNameOptions } = useDropdownOptions(
    CLIENT_NAME_API,
    "client_name"
  );
  const { dropdownOptions: consultantNameOptions } = useDropdownOptions(
    CONSULTANT_NAME_API,
    "consultant_name"
  );
  const { dropdownOptions: approverOptions } = useDropdownOptions(
    `${THERMAX_USER_API}?fields=["*"]&filters=[["division", "=",  "${userInfo?.division}"], ["email", "!=", "${userInfo?.email}"]]`,
    "name"
  );

  const ProjectFormValidationSchema =
    getProjectFormValidationSchema(projectOCNos);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(ProjectFormValidationSchema),
    defaultValues: {
      project_name: "",
      project_oc_number: "",
      client_name: "",
      consultant_name: "",
      approver: "",
    },
    mode: "onBlur",
  });

  const handleCancel = () => {
    setOpen(false);
    reset({
      project_name: "",
      project_oc_number: "",
      client_name: "",
      consultant_name: "",
      approver: "",
    });
  };

  // Helper function for handling errors
  const handleError = (error: any) => {
    try {
      const errorObj = JSON.parse(error?.message) as any;
      message.error(errorObj.message);
    } catch (parseError) {
      console.error(parseError);
      // If parsing fails, use the raw error message
      message.error(error?.message);
    }
  };

  const onSubmit: SubmitHandler<
    zod.infer<typeof ProjectFormValidationSchema>
  > = async (data: any) => {
    setLoading(true);
    data = { ...data, division: userInfo?.division };
    try {
      const oldProjectId = projectRowData?.name;
      await copyThermaxProject(oldProjectId, data, userInfo);
      setOpen(false);
      message.success("Project created successfully");
    } catch (error: any) {
      handleError(error);
    } finally {
      mutate(getProjectListUrl);
      mutate(getProjectUrl);
      setLoading(false);
      // setOpen(false)
    }
  };
  return (
    <Modal
      open={open}
      title={<h1 className="text-center font-bold">Copy Project</h1>}
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
              name="client_name"
              control={control}
              label="Client Name"
              options={clientNameOptions}
              optionKeyName="client_name"
              createOptionUrl={CLIENT_NAME_API}
              placeholder="Select or create a new client by typing..."
              reset={!open}
            />
          </div>
          <div className="flex-1">
            <CustomAutoComplete
              name="consultant_name"
              control={control}
              label="Consultant Name"
              options={consultantNameOptions}
              optionKeyName="consultant_name"
              createOptionUrl={CONSULTANT_NAME_API}
              placeholder="Select or create a new consultant by typing..."
              reset={!open}
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
        <div className="text-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CopyProjectModel;
