"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Modal } from "antd"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { mutate } from "swr"
import * as zod from "zod"
import { createData, updateData } from "actions/crud-actions"
import AlertNotification from "components/AlertNotification"
import CustomTextInput from "components/FormInputs/CustomInput"
import CustomSingleSelect from "components/FormInputs/CustomSingleSelect"
import {
  DYNAMIC_DOCUMENT_API,
  getProjectListUrl,
  MCC_CUM_PCC_MCC_PANEL,
  MCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  PANEL_TYPE_API,
  PCC_PANEL,
  PROJECT_PANEL_API,
} from "configs/api-endpoints"
import { MCC_PANEL_TYPE, MCCcumPCC_PANEL_TYPE, PCC_PANEL_TYPE } from "configs/constants"
import { useDropdownOptions } from "hooks/useDropdownOptions"

const PanelFormValidationSchema = zod.object({
  panel_name: zod
    .string({ required_error: "Panel name is required", message: "Panel name is required" })
    .min(1, { message: "Panel name is required" }),
  panel_sub_type: zod.string({ required_error: "Panel type is required", message: "Panel type is required" }).min(1, {
    message: "Panel type is required",
  }),
  panel_main_type: zod.string({ required_error: "Panel type is required", message: "Panel type is required" }).min(1, {
    message: "Panel type is required",
  }),
})

const getDefaultValues = (editMode: boolean, values: any) => {
  return {
    panel_name: editMode ? values?.panel_name : null,
    panel_sub_type: editMode ? values?.panel_sub_type : null,
    panel_main_type: editMode ? values?.panel_main_type : null,
  }
}

export default function PanelFormModal({ open, setOpen, editMode, values, getProjectPanelUrl, revisionId }: any) {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const { dropdownOptions: panelTypeOptions } = useDropdownOptions(`${PANEL_TYPE_API}?fields=["*"]`, "panel_name")
  const {
    control: panelControl,
    handleSubmit: panelHandleSubmit,
    reset: panelReset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(PanelFormValidationSchema),
    defaultValues: getDefaultValues(editMode, values),
    mode: "onSubmit",
  })

  useEffect(() => {
    panelReset(getDefaultValues(editMode, values))
  }, [editMode, panelReset, values])

  const handleCancel = () => {
    setOpen(false)
    panelReset(getDefaultValues(false, values))
    setMessage("")
    setStatus("")
  }

  // Watch panel_sub_type changes
  const panelSubType = watch("panel_sub_type")

  // Effect to set panel_main_type based on panel_sub_type selection
  useEffect(() => {
    if (panelSubType) {
      const selectedPanelType = panelTypeOptions.find((option: any) => option.name === panelSubType)
      setValue("panel_main_type", selectedPanelType?.panel_type)
    }
  }, [panelSubType, panelTypeOptions, setValue])

  const handleCreatePanel = async (panelData: any) => {
    const panelType = panelData?.panel_main_type
    try {
      const panelRes = await createData(PROJECT_PANEL_API, false, panelData)
      await createData(DYNAMIC_DOCUMENT_API, false, { panel_id: panelRes.name })

      const panelCreateData = {
        panel_id: panelRes.name,
        revision_id: revisionId,
      }
      if (panelType === MCC_PANEL_TYPE) {
        await createData(MCC_PANEL, false, panelCreateData)
      }
      if (panelType === PCC_PANEL_TYPE) {
        await createData(PCC_PANEL, false, panelCreateData)
      }
      if (panelType === MCCcumPCC_PANEL_TYPE) {
        await createData(MCC_CUM_PCC_MCC_PANEL, false, panelCreateData)
        await createData(MCC_PCC_PLC_PANEL_1, false, panelCreateData)
        await createData(MCC_PCC_PLC_PANEL_2, false, panelCreateData)
      }
      setStatus("success")
      setMessage("New panel created successfully")
    } catch (error: any) {
      throw error
    } finally {
      mutate(getProjectPanelUrl)
    }
  }

  const handleUpdatePanel = async (panelData: any) => {
    try {
      await updateData(`${PROJECT_PANEL_API}/${values.name}`, false, panelData)
      setStatus("success")
      setMessage("Panel information updated successfully")
    } catch (error: any) {
      throw error
    } finally {
      mutate(getProjectPanelUrl)
    }
  }

  // Helper function for handling errors
  const handleError = (error: any) => {
    setStatus("error")
    try {
      const errorObj = JSON.parse(error?.message) as any
      setMessage(errorObj?.message)
    } catch (parseError) {
      // If parsing fails, use the raw error message
      setMessage(error?.message || "An unknown error occurred")
    }
  }

  const onSubmit: SubmitHandler<zod.infer<typeof PanelFormValidationSchema>> = async (data: any) => {
    setLoading(true)
    data = { ...data, revision_id: revisionId }
    try {
      if (editMode) {
        await handleUpdatePanel(data)
      } else {
        await handleCreatePanel(data)
      }
    } catch (error: any) {
      handleError(error)
    } finally {
      mutate(getProjectListUrl)
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={<h1 className="text-center font-bold">{`${editMode ? "Edit" : "Add New"} Panel`}</h1>}
      onCancel={handleCancel}
      footer={null}
    >
      <form onSubmit={panelHandleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex-1">
            <CustomTextInput name="panel_name" control={panelControl} label="Panel Name" type="text" />
          </div>
          <div>
            <CustomSingleSelect
              name="panel_sub_type"
              control={panelControl}
              label="Panel Type"
              options={panelTypeOptions}
            />
          </div>
          <div className="hidden">
            <CustomTextInput name="panel_main_type" control={panelControl} label="Panel Type" disabled />
          </div>
        </div>
        <AlertNotification message={message} status={status} />
        <div className="text-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
