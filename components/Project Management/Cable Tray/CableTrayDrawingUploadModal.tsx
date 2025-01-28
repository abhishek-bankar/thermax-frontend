"use client";

import { CheckCircleTwoTone, CloseCircleTwoTone } from "@ant-design/icons";
import { Modal } from "antd";
import { useEffect, useState } from "react";
import { getBucketObjects } from "@/actions/aws/s3-actions";
import S3BucketUpload from "@/components/FormInputs/S3BucketUpload";
import { S3FolderMapping } from "@/configs/constants";
import { useParams } from "next/navigation";
import { useGetData } from "@/hooks/useCRUD";
import { PROJECT_API } from "@/configs/api-endpoints";

export const UploadCableTrayDrawingModal = ({
  open,
  setOpen,
  revision_no,
  onUploadSuccess,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  revision_no: string;
  onUploadSuccess: any;
}) => {
  const params = useParams();

  const project_id = params.project_id as string;
  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);

  console.log(projectData, "project data");
  console.log(projectData?.["project_name"], "project data");

  const projectDivision = projectData?.division as keyof typeof S3FolderMapping;
  const [fileExist, setFileExist] = useState(false);

  useEffect(() => { 
    const checkFileExist = async () => {
      const cableTrayDrawing = await getBucketObjects(
        `${S3FolderMapping[projectDivision]}/${projectData?.["project_name"]}/Cable Tray/${revision_no}/Input`
      );
      setFileExist(cableTrayDrawing ? cableTrayDrawing?.length > 0 : false);
    };
    checkFileExist();
  }, [open, projectDivision, projectData, revision_no]);

  return (
    <Modal
      open={open}
      title={
        <h1 className="text-center font-bold">Upload Cable Tray Drawing</h1>
      }
      onCancel={() => setOpen(false)}
      footer={null}
      width={500}
    >
      <div className="flex flex-col gap-6 py-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {fileExist ? (
              <CheckCircleTwoTone twoToneColor="#52c41a" className="text-lg" />
            ) : null}
            <h4 className="font-semibold text-slate-700">Cable Tray Input</h4>
          </div>
          <div className="flex items-center gap-2">
            {projectData && (
              <S3BucketUpload
                accept=".pdf,.dwg"
                folderPath={`${S3FolderMapping[projectDivision]}/${projectData?.["project_name"]}/Cable Tray/${revision_no}/Input`}
                onUploadSuccess={onUploadSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
