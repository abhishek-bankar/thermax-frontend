"use client";
import { getThermaxDateFormat } from "@/utils/helpers";
import {
  CloudDownloadOutlined,
  CopyTwoTone,
  FolderOpenOutlined,
  SaveTwoTone,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Popconfirm,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UploadCableTrayDrawingModal } from "./CableTrayDrawingUploadModal";
import { useLoading } from "@/hooks/useLoading";
import { useParams } from "next/navigation";
import { getData, updateData } from "@/actions/crud-actions";
import { CABLE_TRAY_REVISION_HISTORY_API } from "@/configs/api-endpoints";
// interface Props {
// }

const useDataFetching = (project_id: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cableTrayRevisions, setCableTrayRevisions] = useState<any>();
  const [panelData, setPanelData] = useState<any>();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(false);
      //   const cableTrayRevisions = await getData(
      //     `${CABLE_TRAY_REVISION_HISTORY_API}/${project_id}`
      //   );

      const cableTrayRevisions = await getData(
        `${CABLE_TRAY_REVISION_HISTORY_API}?fields=["*"]&filters=[["project_id", "=", "${project_id}"]]`
      );
      if (cableTrayRevisions?.length) {
        setCableTrayRevisions(cableTrayRevisions);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    designBasisData: panelData,
    cableTrayRevisions,
    isLoading,
    refetch: fetchData,
  };
};
const CableTray: React.FC = ({}) => {
  const { setLoading } = useLoading();
  const revision_no = "R0";
  const params = useParams();
  const project_id = params.project_id as string;
  const [revisionToUploadFile, setRevisionToUploadFile] = useState<any>(null);
  //   CABLE_TRAY_REVISION_HISTORY_API
  const { cableTrayRevisions, designBasisData, refetch } =
    useDataFetching(project_id);
  console.log(cableTrayRevisions);

  useEffect(() => {
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (record: any) => {
    // if (record.status === SLD_REVISION_STATUS.DEFAULT) {
    //   try {
    //     const respose = await updateData(
    //       `${SLD_REVISIONS_API}/${record.key}`,
    //       false,
    //       { status: SLD_REVISION_STATUS.DOWNLOAD_READY }
    //     );
    //     console.log(respose);
    //     message.success("SLD is Being Prepared Please Wait For A While");
    //     const interval = setInterval(async () => {
    //       getSLDRevision();
    //       // const revisionData:any = await getSLDRevision();
    //       // const updatedRecord = revisionData.find((r:any) => r.key === record.key); // Find the specific record by key
    //       // if (updatedRecord && updatedRecord.status === SLD_REVISION_STATUS.SUCCESS) {
    //       //   clearInterval(interval); // Stop the interval when the status is SUCCESS
    //       //   const link = document.createElement("a");
    //       //   link.href = updatedRecord.sld_path;
    //       //   document.body.appendChild(link);
    //       //   link.click();
    //       //   document.body.removeChild(link);
    //       // }
    //     }, 30000); // 30 seconds interval
    //     setIsSLDInProcess(true);
    //     setSetIntervaId(interval);
    //   } catch (error) {
    //   } finally {
    //   }
    // } else if (record.status === SLD_REVISION_STATUS.SUCCESS) {
    //   const link = document.createElement("a");
    //   link.href = record.sld_path;
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    // }
  };
  console.log(cableTrayRevisions);

  const dataSource = useMemo(
    () =>
      cableTrayRevisions?.map((item: any, index: number) => ({
        key: item.name,
        documentName: "Cable Tray",
        status: item.status,
        documentRevision: `R${index}`,
        createdDate: item.creation,
        output_path: item.output_path,
        input_path: item.input_path,
      })),

    [cableTrayRevisions]
  );

  const columns: TableColumnsType = useMemo(
    () => [
      {
        title: () => <div className="text-center">Document Name</div>,
        dataIndex: "documentName",
        align: "center",
        render: (text, record) => (
          <Tooltip title="Edit Revision" placement="top">
            <Button
              type="link"
              iconPosition="start"
              icon={
                <FolderOpenOutlined
                  style={{ color: "#fef65b", fontSize: "1.2rem" }}
                />
              }
              //   disabled={record.status === DB_REVISION_STATUS.Released}
            >
              {text}
            </Button>
          </Tooltip>
        ),
      },
      {
        title: () => <div className="text-center">Status</div>,
        dataIndex: "status",
        render: (text) => (
          <div className="text-center">
            <Tag color="green">{text}</Tag>
          </div>
        ),
      },
      {
        title: () => <div className="text-center">Document Revision</div>,
        dataIndex: "documentRevision",
        render: (text) => <div className="text-center">{text}</div>,
      },
      {
        title: () => <div className="text-center">Created Date</div>,
        dataIndex: "createdDate",
        render: (text) => {
          const date = new Date(text);
          const stringDate = getThermaxDateFormat(date);
          return stringDate;
        },
      },
      {
        title: () => <div className="text-center">Upload</div>,
        dataIndex: "upload",
        render(text, record) {
          return (
            <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
              <div>
                <Tooltip placement="top" title="Upload File">
                  <Button
                    type="link"
                    shape="circle"
                    icon={<UploadOutlined />}
                    onClick={() => setRevisionToUploadFile(record)}
                    // disabled={record?.division !== userDivision}
                    // style={{ display: isComplete === 1 ? "none" : "" }}
                  />
                </Tooltip>
              </div>
            </div>
          );
        },
      },
      {
        title: () => <div className="text-center">Save</div>,
        dataIndex: "download",
        render(text: any, record: any) {
          //   if (
          //     record.is_copied === 1 ||
          //     record.status === LOAD_LIST_REVISION_STATUS.Released
          //   ) {
          //     return null;
          //   }

          return (
            <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
              <div>
                <Tooltip title={"Save"}>
                  <Button
                    type="link"
                    shape="circle"
                    disabled={false}
                    icon={
                      <SaveTwoTone
                        style={{
                          fontSize: "1rem",
                          color: "green",
                        }}
                      />
                    }
                    // onClick={() => handleSave(record?.key, tab)}
                  />
                </Tooltip>
              </div>
            </div>
          );
        },
      },

      {
        title: () => <div className="text-center">Download</div>,
        dataIndex: "download",
        render(text, record) {
          return (
            <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
              <div>
                <Tooltip title={"Download"}>
                  <Button
                    type="link"
                    shape="circle"
                    // disabled={
                    //   (tab === "lpbs-specs" &&
                    //     !commonConfigData?.is_local_push_button_station_selected) ||
                    //   (tab === "local-isolator" &&
                    //     !commonConfigData?.is_field_motor_isolator_selected) ||
                    //   (tab === "lpbs-specs" && !record?.is_saved) ||
                    //   (tab === "local-isolator" && !record?.is_saved) ||
                    //   (tab === "motor-specs" && !record?.is_saved)
                    // }
                    icon={
                      <CloudDownloadOutlined
                        style={{
                          fontSize: "1.3rem",
                          color: "green",
                        }}
                        spin={false}
                      />
                    }
                    onClick={() => handleDownload(record?.key)}
                  />
                </Tooltip>
              </div>
            </div>
          );
        },
      },
      {
        title: () => <div className="text-center">Create New Revision</div>,
        dataIndex: "clone",
        render: (_, record) => {
          console.log(record);
          if (record.is_copied === 1) {
            return null;
          }

          return (
            <div className="text-center">
              <Tooltip title={"Create New Revision"}>
                <Button
                  type="link"
                  shape="circle"
                  icon={
                    <CopyTwoTone
                      style={{
                        fontSize: "1rem",
                      }}
                    />
                  }
                  //   onClick={() => handleClone(record)}
                  //   disabled={
                  //     record.status !== DB_REVISION_STATUS.Released ||
                  //     userDivision !== projectDivision
                  //   }
                />
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: () => <div className="text-center">Release</div>,
        dataIndex: "release",
        render: (text, record) => {
          return (
            <div className="text-center">
              <Popconfirm
                title="Are you sure to release this revision?"
                // onConfirm={async () => handleRelease(record, tab)}
                okText="Yes"
                cancelText="No"
                placement="topRight"
                disabled={false}
              >
                <Button
                  type="primary"
                  size="small"
                  name="Release"
                  disabled={false}
                >
                  Release
                </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ],
    []
  );
  const onUploadSuccess = async (path: string) => {
    console.log(revisionToUploadFile);

    console.log(path);
    if (revisionToUploadFile) {
      try {
        const response = await updateData(
          `${CABLE_TRAY_REVISION_HISTORY_API}/${revisionToUploadFile.key}`,
          false,
          {
            input_path: path,
          }
        );
        setRevisionToUploadFile(null);
        console.log(response);
      } catch (error) {
        console.error(error);
        message.error("Error in uploading path");
      }
    }
  };
  return (
    <>
      <div className="text-end">
        <Button
          icon={<SyncOutlined color="#492971" />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>
      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
      <UploadCableTrayDrawingModal
        open={revisionToUploadFile}
        setOpen={setRevisionToUploadFile}
        revision_no={revision_no}
        onUploadSuccess={onUploadSuccess}
      />
    </>
  );
};

export default CableTray;
