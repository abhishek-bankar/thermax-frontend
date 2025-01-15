"use client";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload, UploadProps } from "antd";
import { Control, Controller } from "react-hook-form";

interface CustomUploadProps extends UploadProps {
  control: Control<any>;
  name: string;
  uploadButtonLabel: string;
  size?: "small";
  defaultChecked?: boolean;
  onChange?: UploadProps["onChange"];
}

export default function CustomUpload({
  control,
  name,
  uploadButtonLabel,
  ...props
}: CustomUploadProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        return (
          <>
            <Upload
              {...props}
              {...field}
              fileList={
                // Check if field.value is a File object or a string
                field.value instanceof File
                  ? [
                      {
                        uid: field.value.name,
                        name: field.value.name,
                        status: "done",
                        originFileObj: {
                          ...field.value,
                          uid: field.value.name,
                          lastModifiedDate: new Date(field.value.lastModified),
                        },
                      },
                    ] // If it's a File object, wrap it in an array with required properties
                  : typeof field.value === "string" // If it's a string (URL)
                  ? field.value.split(", ").map((url: string) => ({
                      uid: url,
                      name: url,
                      status: "done",
                      url: url,
                    }))
                  : [] // If neither, return an empty array
              }
              onChange={(event) => {
                field.onChange(event.file.originFileObj);
                if (props.onChange) {
                  props.onChange(event);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>{uploadButtonLabel}</Button>
            </Upload>
            {fieldState.error && (
              <p className="text-xs text-red-600">{fieldState.error.message}</p>
            )}
          </>
        );
      }}
    />
  );
}
