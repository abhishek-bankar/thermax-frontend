"use client";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import type { UploadFile, UploadProps } from "antd";
import React, { useState } from "react";
import { uploadBucketObject } from "@/actions/aws/s3-actions"; // Server action

const S3BucketUpload = ({
  accept,
  folderPath,
  onUploadSuccess,
}: {
  accept: string;
  folderPath: string;
  onUploadSuccess?: any;
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) return;
    setUploading(true);

    try {
      const file = fileList[0] as UploadFile;
      const formData = new FormData();
      formData.append("file", file as unknown as Blob); // Convert to Blob
      await uploadBucketObject(folderPath, formData, file.name);
      message.success(`${file.name} uploaded successfully`);
      onUploadSuccess(folderPath + "/" +  file.name);
    } catch (error) {
      // console.log("Upload failed:", error);
      message.error(`Failed to upload ${fileList[0]?.name}. ${error}`);
    } finally {
      setUploading(false);
      setFileList([]); // Reset file list after upload
    }
  };

  const props: UploadProps = {
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid)); // Remove file
    },
    beforeUpload: (file) => {
      setFileList([file]); // Allow only one file at a time
      return false; // Prevent automatic upload
    },
    fileList,
  };

  return (
    <div className="flex items-center justify-end gap-4">
      <Upload {...props} accept={accept} className="flex flex-col">
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>

      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        loading={uploading}
      >
        {uploading ? "Uploading" : "Start Upload"}
      </Button>
    </div>
  );
};

export default S3BucketUpload;
