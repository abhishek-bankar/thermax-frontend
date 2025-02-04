"use client";
import { convertToFrappeDatetime, getThermaxDateFormat } from "@/utils/helpers";
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
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
} from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UploadCableTrayDrawingModal } from "./CableTrayDrawingUploadModal";
import { useLoading } from "@/hooks/useLoading";
import { useParams } from "next/navigation";
import { getData, updateData } from "@/actions/crud-actions";
import {
  CABLE_TRAY_REVISION_HISTORY_API,
  PROJECT_API,
} from "@/configs/api-endpoints";
import { getLatestCableScheduleRevision } from "@/actions/electrical-load-list";
import { getLatestDesignBasisRevision } from "@/actions/design-basis";
import CopyRevision from "@/components/Modal/CopyRevision";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { SLD_REVISION_STATUS } from "@/configs/constants";
// interface Props {
// }
const REFRESH_INTERVAL = 30000; // 30 seconds
const useDataFetching = (project_id: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [cableTrayRevisions, setCableTrayRevisions] = useState<any>();
  const [projectData, setProjectData] = useState<any>();
  const [cableScheduleRevisionId, setCableScheduleRevisionId] = useState<any>();
  const [designBasisRevisionId, setDesignBasisRevisionId] = useState<any>();
  const [hasInProcessItems, setHasInProcessItems] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      // setIsLoading(true);
      const projectData = await getData(`${PROJECT_API}/${project_id}`);

      const cableTrayRevisions = await getData(
        `${CABLE_TRAY_REVISION_HISTORY_API}?fields=["*"]&filters=[["project_id", "=", "${project_id}"]]`
      );
      const cable_schedule_data: any = await getLatestCableScheduleRevision(
        project_id
      );
      const design_basis_data = await getLatestDesignBasisRevision(project_id);

      if (design_basis_data.length > 0) {
        setDesignBasisRevisionId(design_basis_data[0].name);
      }
      if (cable_schedule_data.length > 0) {
        setCableScheduleRevisionId(cable_schedule_data[0].name);
      }
      if (cableTrayRevisions?.length) {
        const sortedData = cableTrayRevisions.sort((a: any, b: any) => {
          const dateA = new Date(a.creation);
          const dateB = new Date(b.creation);
          return dateA.getTime() - dateB.getTime();
        });
        setCableTrayRevisions(sortedData);
        const hasProcessingItems = sortedData.some(
          (item: any) =>
            item.status === SLD_REVISION_STATUS.IN_PROCESS ||
            item.status === SLD_REVISION_STATUS.IN_QUEUE
        );
        setHasInProcessItems(hasProcessingItems);
      }
      if (projectData) {
        setProjectData(projectData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [project_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    cableTrayRevisions,
    cableScheduleRevisionId,
    designBasisRevisionId,
    isLoading,
    projectData,
    hasInProcessItems,
    refetch: fetchData,
  };
};
const CableTray: React.FC = ({}) => {
  const { setLoading } = useLoading();
  // let revision_no = "R0";
  const userInfo = useCurrentUser();
  const revision = useRef("R0");
  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const params = useParams();
  const [versionToCopy, setVersionToCopy] = useState(null);

  const project_id = params.project_id as string;
  const [revisionToUploadFile, setRevisionToUploadFile] = useState<any>(null);
  //   CABLE_TRAY_REVISION_HISTORY_API
  const {
    cableTrayRevisions,
    cableScheduleRevisionId,
    projectData,
    designBasisRevisionId,
    isLoading,
    hasInProcessItems,
    refetch,
  } = useDataFetching(project_id);
  const userDivision = userInfo?.division;
  const projectDivision = projectData?.division;
  // console.log(projectDivision);
  console.log(cableScheduleRevisionId);
  console.log(designBasisRevisionId);
  console.log(cableTrayRevisions);
  // let revisionNo = 0;
  useEffect(() => {
    if (hasInProcessItems) {
      refreshIntervalRef.current = setInterval(refetch, REFRESH_INTERVAL);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [hasInProcessItems, refetch]);
  useEffect(() => {
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (record: any) => {
    if (record.status === SLD_REVISION_STATUS.DEFAULT) {
      try {
        const respose = await updateData(
          `${CABLE_TRAY_REVISION_HISTORY_API}/${record.key}`,
          false,
          { status: SLD_REVISION_STATUS.IN_QUEUE }
        );
        refetch();
        console.log(respose);
        message.success("Cable Tray is Being Prepared Please Wait For A While");
      } catch (error) {
      } finally {
      }
    } else if (record.status === SLD_REVISION_STATUS.SUCCESS) {
      const link = document.createElement("a");
      link.href = record.output_path;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
        is_copied: item.is_copied,
        is_released: item.is_released,
        is_saved: item.is_saved,
      })),

    [cableTrayRevisions]
  );
  useEffect(() => {
    if (revisionToUploadFile) {
      dataSource?.forEach((item: any, index: number) => {
        if (item.key === revisionToUploadFile?.key) {
          revision.current = "R" + index;
        }
      });
    }
  }, [dataSource, revisionToUploadFile]);

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
                    disabled={record.is_released}

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
                    disabled={record.is_released}
                    icon={
                      <SaveTwoTone
                        style={{
                          fontSize: "1rem",
                          color: "green",
                        }}
                      />
                    }
                    onClick={() => handleSave(record)}
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
          if (
            record.status === SLD_REVISION_STATUS.IN_PROCESS ||
            record.status === SLD_REVISION_STATUS.IN_QUEUE
          ) {
            return (
              <div className="flex justify-center">
                <Spin />
              </div>
            );
          }
          return (
            <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
              <div>
                <Tooltip title={"Download"}>
                  <Button
                    type="link"
                    shape="circle"
                    disabled={
                      !record?.is_saved ||
                      record.status === SLD_REVISION_STATUS.ERROR
                    }
                    icon={
                      <CloudDownloadOutlined
                        style={{
                          fontSize: "1.3rem",
                          color: "green",
                        }}
                        spin={false}
                      />
                    }
                    onClick={() => handleDownload(record)}
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
                  onClick={() => handleClone(record)}
                  disabled={
                    !record.is_released || userDivision !== projectDivision
                  }
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
          console.log(record, "vishalling");

          return (
            <div className="text-center">
              <Popconfirm
                title="Are you sure to release this revision?"
                onConfirm={async () => handleRelease(record.key)}
                okText="Yes"
                cancelText="No"
                placement="topRight"
                disabled={record.is_released}
              >
                <Button
                  type="primary"
                  size="small"
                  name="Release"
                  disabled={record.is_released}
                >
                  Release
                </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ],
    [designBasisRevisionId, cableScheduleRevisionId]
  );
  console.log(designBasisRevisionId, "Design basis data save");
  console.log(cableScheduleRevisionId, "Design basis data save");
  // const handleSave = async (record: any) => {
  //   console.log(record);
  //   if (record.input_path.length < 5) {
  //     message.error("Please Upload Drawing File");
  //     return;
  //   }
  //   if (!designBasisRevisionId) {

  //     message.error("Design Basis Id Missing");
  //     return;
  //   }
  //   if (!cableScheduleRevisionId) {

  //     message.error("Cable Schedule Id Missing");
  //     return;
  //   }
  //   const key = record.key;
  //   console.log(designBasisRevisionId, "Design basis data save");
  //   console.log(cableScheduleRevisionId, "Design basis data save");

  //   const payload = {
  //     design_basis_revision_id: designBasisRevisionId,
  //     cable_schedule_revision_id: cableScheduleRevisionId,
  //     is_saved: 1,
  //     status: SLD_REVISION_STATUS.DEFAULT,
  //   };
  //   try {
  //     console.log(payload);
  //     // console.log(`${GA_REVISIONS_API}/${key}`);

  //     const response = await updateData(
  //       `${CABLE_TRAY_REVISION_HISTORY_API}/${key}`,
  //       false,
  //       payload
  //     );
  //     if (response) {
  //       const lastModified = convertToFrappeDatetime(
  //         new Date(response?.modified)
  //       );
  //       // setLastModified(lastModified);
  //     }
  //     console.log(response);
  //     refetch();
  //     message.success("Cable Tray Saved");
  //   } catch (error) {
  //     message.error("Unable to Save Cable Tray");
  //   }
  // };

  const handleSave = useCallback(
    async (record: any) => {
      console.log(record);
      if (record.input_path.length < 5) {
        message.error("Please Upload Drawing File");
        return;
      }
      if (!designBasisRevisionId) {
        message.error("Design Basis Id Missing");
        return;
      }
      if (!cableScheduleRevisionId) {
        message.error("Cable Schedule Id Missing");
        return;
      }

      const key = record.key;
      console.log(designBasisRevisionId, "Design basis data save");
      console.log(cableScheduleRevisionId, "Design basis data save");

      const payload = {
        design_basis_revision_id: designBasisRevisionId,
        cable_schedule_revision_id: cableScheduleRevisionId,
        is_saved: 1,
        status: SLD_REVISION_STATUS.DEFAULT,
      };

      try {
        console.log(payload);

        const response = await updateData(
          `${CABLE_TRAY_REVISION_HISTORY_API}/${key}`,
          false,
          payload
        );

        if (response) {
          const lastModified = convertToFrappeDatetime(
            new Date(response?.modified)
          );
          // setLastModified(lastModified);
        }

        console.log(response);
        refetch();
        message.success("Cable Tray Saved");
      } catch (error) {
        message.error("Unable to Save Cable Tray");
      }
    },
    [designBasisRevisionId, cableScheduleRevisionId, refetch] // Dependencies
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
            // status:
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
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }
  const handleRelease = async (key: any) => {
    // console.log(record);
    try {
      const respose = await updateData(
        `${CABLE_TRAY_REVISION_HISTORY_API}/${key}`,
        false,
        {
          is_released: 1,
        }
      );
      console.log(respose);
      message.success("Revision is Released and Locked");
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      // setModalLoading(false);
    }
  };
  const handleClone = async (record: any) => {
    setVersionToCopy(record);
    // console.log(record);
  };

  console.log(revision.current);

  return (
    <>
      <div className="text-end">
        <Button icon={<SyncOutlined color="#492971" />} onClick={refetch}>
          Refresh
        </Button>
      </div>
      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
      {revisionToUploadFile && (
        <UploadCableTrayDrawingModal
          open={revisionToUploadFile}
          setOpen={setRevisionToUploadFile}
          revision_no={revision.current}
          onUploadSuccess={onUploadSuccess}
        />
      )}
      <CopyRevision
        version={versionToCopy}
        setVersionToCopy={setVersionToCopy}
        tab={"cable_tray"}
        updateTable={refetch}
      />
    </>
  );
};

export default CableTray;
