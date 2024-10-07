"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Modal } from "antd"
import Image from "next/image"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { mutate } from "swr"
import * as zod from "zod"
import { createData, updateData } from "actions/crud-actions"
import { registerSuperuser } from "actions/register"
import { uploadFile } from "components/FileUpload"
import CustomSingleSelect from "components/FormInputs/CustomSingleSelect"
import { DIVISION_API, USER_API } from "configs/api-endpoints"
import { BTG } from "configs/constants"
import { useGetCurrentUserRole } from "hooks/use-current-user"
import { useDropdownOptions } from "hooks/useDropdownOptions"
import AlertNotification from "../AlertNotification"
import CustomTextInput from "../FormInputs/CustomInput"

const UserFormValidationSchema = zod.object({
  first_name: zod.string({ required_error: "First name is required", message: "First name is required" }),
  last_name: zod.string({ required_error: "Last name is required", message: "Last name is required" }),
  division_superuser: zod
    .string({ required_error: "Email address is required", message: "Email address is required" })
    .email({ message: "Invalid email address" }),
  name_initial: zod.string({ required_error: "Initials is required", message: "Initials is required" }),
  digital_signature: zod.any().optional(),
  division_name: zod.string({ required_error: "Division is required", message: "Division is required" }),
})

const getDefaultValues = (editMode: boolean, values: any) => {
  return {
    first_name: editMode ? values?.first_name : null,
    last_name: editMode ? values?.last_name : null,
    division_superuser: editMode ? values?.division_superuser : null,
    name_initial: editMode ? values?.name_initial : null,
    digital_signature: editMode ? (values?.digital_signature === "" ? [] : [values?.digital_signature]) : [],
    division_name: editMode ? values?.division_name : null,
  }
}

export default function UserFormModal({ open, setOpen, editMode, values, editEventTrigger }: any) {
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const roles = useGetCurrentUserRole()

  let { dropdownOptions: divisionNames } = useDropdownOptions(DIVISION_API, "name")
  divisionNames = divisionNames?.filter((division) => division.name !== BTG)
  console.log(divisionNames)

  const { control, handleSubmit, reset, formState, watch } = useForm({
    resolver: zodResolver(UserFormValidationSchema),
    defaultValues: getDefaultValues(editMode, values),
    mode: "onBlur",
  })

  useEffect(() => {
    reset(getDefaultValues(editMode, values))
  }, [editMode, reset, values, editEventTrigger])

  const handleCancel = () => {
    setOpen(false)
    reset(getDefaultValues(false, values))
    setMessage("")
    setStatus("")
  }

  // Helper function for creating user
  const handleCreateUser = async (userData: any) => {
    const dg_sign_file = userData?.digital_signature
    try {
      if (Array.isArray(dg_sign_file)) {
        userData["digital_signature"] = ""
      } else {
        const { data } = await uploadFile(dg_sign_file as File)
        userData["digital_signature"] = data.file_url
      }
      await createData(USER_API, false, { ...userData, send_welcome_email: 0 })
      setStatus("success")
      setMessage("New user created successfully")
    } catch (error: any) {
      throw error
    }
  }

  // Helper function for updating user
  const handleUpdateUser = async (userData: any) => {
    const dg_sign_file = userData?.digital_signature
    try {
      if (typeof dg_sign_file === "string" && dg_sign_file.startsWith("/files/")) {
        userData["digital_signature"] = dg_sign_file
      } else {
        const { data } = await uploadFile(dg_sign_file[0] as File)
        userData["digital_signature"] = data.file_url
      }

      await updateData(`${USER_API}/${values.name}`, false, userData)
      setStatus("success")
      setMessage("User information updated successfully")
    } catch (error: any) {
      throw error
    }
  }

  // Helper function for handling errors
  const handleError = (error: any) => {
    setStatus("error")
    try {
      const errorObj = JSON.parse(error?.message) as any
      console.log(errorObj)
      setMessage(errorObj?.message)
    } catch (parseError) {
      // If parsing fails, use the raw error message
      setMessage(error?.message || "An unknown error occurred")
    }
  }

  const onSubmit: SubmitHandler<zod.infer<typeof UserFormValidationSchema>> = async (data) => {
    setLoading(true)
    try {
      if (editMode) {
        await handleUpdateUser(data)
      } else {
        const registerRes = await registerSuperuser(data, `Superuser ${data.division_name}`, data.division_name)
        if (registerRes?.status === 409) {
          setStatus("error")
          setMessage("User already exist")
        } else {
          handleCancel()
        }
      }
      mutate(`${DIVISION_API}?fields=["*"]`)
    } catch (error: any) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open={open}
      title={<h1 className="text-center font-bold">{`${editMode ? "Edit" : "Add New"} Superuser`}</h1>}
      onCancel={handleCancel}
      footer={null}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <CustomTextInput name="first_name" control={control} label="First Name" type="text" />
          </div>
          <div className="flex-1">
            <CustomTextInput name="last_name" control={control} label="Last Name" type="text" />
          </div>
        </div>
        <div className="flex-1">
          <CustomTextInput name="division_superuser" control={control} label="Email" type="email" disabled={editMode} />
        </div>
        <div className="flex-1">
          <CustomTextInput name="name_initial" control={control} label="Initials" type="text" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              name="division_name"
              control={control}
              label="Division"
              options={divisionNames}
              disabled={watch("division_name") === BTG}
            />
          </div>
          {values?.digital_signature && (
            <div>
              <Image
                src={`${process.env.NEXT_PUBLIC_FRAPPE_DOMAIN_NAME}${values?.digital_signature}`}
                width={100}
                height={100}
                alt="Digital Signature"
              />
            </div>
          )}
        </div>
        <AlertNotification message={message} status={status} />
        <div className="text-end">
          <Button type="primary" htmlType="submit" loading={loading} disabled={!formState.isValid}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
