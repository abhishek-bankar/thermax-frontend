import { getData, updateData } from "@/actions/crud-actions";
import CopyRevision from "@/components/Modal/CopyRevision";
import {
  PANEL_SPECS_REVISIONS_API,
  PROJECT_API,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { useGetData } from "@/hooks/useCRUD";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  convertToFrappeDatetime,
  getThermaxDateFormat,
  sortDatewise,
} from "@/utils/helpers";
import {
  CloudDownloadOutlined,
  CopyTwoTone,
  FolderOpenOutlined,
  SaveTwoTone,
  SyncOutlined,
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
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const useDataFetching = (
  project_id: string,
  panel: any,
  sld_revision_id: any
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [panelSpecificationRevisions, setPanelSpecificationRevisions] =
    useState<any[]>([]);
  const [sldData, setSldData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const panelSpecificationRevisionsResponse = await getData(
        `${PANEL_SPECS_REVISIONS_API}?fields=["*"]&filters=[["panel_id", "=", "${panel?.name}"]]`
      );
      const sldDataResponse = await getData(
        `${SLD_REVISIONS_API}/${sld_revision_id}`
      );

      setPanelSpecificationRevisions(
        sortDatewise(panelSpecificationRevisionsResponse) || []
      );

      // Safely extract busbar sizing data
      const busbarData = sldDataResponse?.busbar_sizing_data?.[0];
      setSldData(busbarData || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
      setPanelSpecificationRevisions([]);
      setSldData(null);
    } finally {
      setIsLoading(false);
    }
  }, [panel?.name, sld_revision_id]);

  useEffect(() => {
    if (panel?.name && sld_revision_id) {
      fetchData();
    }
  }, [fetchData, panel?.name, sld_revision_id]);

  return {
    panelSpecificationRevisions,
    sldData,
    isLoading,
    refetch: fetchData,
  };
};
interface Props {
  panelData: any;
  projectPanelData: any;
  designBasisRevisionId: any;
  setLastModified: any;
  sld_revision_id: string;
}

const PanelSpecification: React.FC<Props> = ({
  panelData,
  projectPanelData,
  designBasisRevisionId,
  sld_revision_id,
  setLastModified,
}) => {
  const params = useParams();
  const userInfo: {
    division: string;
  } = useCurrentUser();

  const project_id = params.project_id as string;
  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);
  const [versionToCopy, setVersionToCopy] = useState(null);

  const userDivision = userInfo?.division;

  const projectDivision = projectData?.division;

  const panel = projectPanelData?.find(
    (el: any) => el.panel_name === panelData.panelName
  );

  const { panelSpecificationRevisions, sldData, refetch, isLoading } =
    useDataFetching(project_id, panel, sld_revision_id);
  console.log(sldData);

  const dataSource = useMemo(
    () =>
      panelSpecificationRevisions?.map((item: any, index: number) => ({
        key: item.name,
        documentName: "Panel Specification",
        status: item.status,
        documentRevision: `R${index}`,
        createdDate: item.creation,
        path: item.path,
        is_copied: item.is_copied,
        is_saved: item.is_saved,
        is_released: item.is_released,
      })),
    [panelSpecificationRevisions]
  );
  const handleDownload = async (record: any) => {
    // console.log(record);
    // if (record.status === SLD_REVISION_STATUS.DEFAULT) {
    //   try {
    //     const respose = await updateData(
    //       `${GA_REVISIONS_API}/${record.key}`,
    //       false,
    //       { status: SLD_REVISION_STATUS.DOWNLOAD_READY }
    //     );
    //     // setLoading(false);
    //     console.log(respose);
    //     message.success("Panel GA is Being Prepared Please Wait For A While");
    //     // const interval = setInterval(async () => {
    //     //   getSLDRevision();
    //     //   // const revisionData:any = await getSLDRevision();
    //     //   // const updatedRecord = revisionData.find((r:any) => r.key === record.key); // Find the specific record by key
    //     //   // if (updatedRecord && updatedRecord.status === SLD_REVISION_STATUS.SUCCESS) {
    //     //   //   clearInterval(interval); // Stop the interval when the status is SUCCESS
    //     //   //   const link = document.createElement("a");
    //     //   //   link.href = updatedRecord.sld_path;
    //     //   //   document.body.appendChild(link);
    //     //   //   link.click();
    //     //   //   document.body.removeChild(link);
    //     //   // }
    //     // }, 30000); // 30 seconds interval
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
  useEffect(() => {
    if (panelSpecificationRevisions?.length) {
      console.log(
        panelSpecificationRevisions[panelSpecificationRevisions.length - 1],
        "revishd"
      );
      const latest =
        panelSpecificationRevisions[panelSpecificationRevisions.length - 1];
      const lastModified = convertToFrappeDatetime(new Date(latest?.modified));

      setLastModified(lastModified);
    }
  }, [panelSpecificationRevisions, setLastModified]);

  const handleSave = async (key: string, sldData: any) => {
    console.log(sldData);
    if (!sldData || !designBasisRevisionId) {
      message.error("Missing required data for saving");
      return;
    }

    const payload = {
      is_saved: 1,
      design_basis_revision_id: designBasisRevisionId,
      sld_height_of_panel: sldData.enclosure_height || null,
    };

    try {
      const response = await updateData(
        `${PANEL_SPECS_REVISIONS_API}/${key}`,
        false,
        payload
      );

      if (response) {
        refetch();
        message.success("Panel Specification Saved");
      }
    } catch (error) {
      console.error("Save error:", error);
      message.error("Unable to Save Panel Specification");
    }
  };
  const handleClone = async (record: any) => {
    setVersionToCopy(record);
  };
  const handleRelease = async (record: any) => {
    console.log(record);
    try {
      if (record.is_released === 0) {
        const respose = await updateData(
          `${PANEL_SPECS_REVISIONS_API}/${record?.key}`,
          false,
          {
            is_released: 1,
          }
        );
      }
      message.success("Revision is Released and Locked");
      refetch();
    } catch (error) {
      console.error(error);
    } finally {
      // setModalLoading(false);
    }
  };
  const columns: TableColumnsType = useMemo(
    () => [
      {
        title: () => <div className="text-center">Document Name</div>,
        dataIndex: "documentName",
        align: "center",
        render: (text) => (
          <Tooltip title="Edit Revision" placement="top">
            <Button
              type="link"
              iconPosition="start"
              onClick={() => {}}
              icon={
                <FolderOpenOutlined
                  style={{ color: "#fef65b", fontSize: "1.2rem" }}
                />
              }
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
        render: (text) => (
          <div className="text-center">
            {getThermaxDateFormat(new Date(text))}
          </div>
        ),
      },
      {
        title: () => <div className="text-center">Save</div>,
        dataIndex: "download",
        render(text: any, record: any) {
          return (
            <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
              <div>
                <Tooltip title={"Save"}>
                  <Button
                    type="link"
                    shape="circle"
                    disabled={record.is_released === 1}
                    icon={
                      <SaveTwoTone
                        style={{
                          fontSize: "1rem",
                          color: "green",
                        }}
                      />
                    }
                    onClick={() => handleSave(record?.key, sldData)}
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
        render: (text, record) => (
          <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
            <Tooltip
              title={
                record.status === SLD_REVISION_STATUS.DEFAULT
                  ? "Submit To Download"
                  : "Download"
              }
            >
              <Button
                type="link"
                shape="circle"
                disabled={!record.is_saved}
                icon={
                  <CloudDownloadOutlined
                    style={{
                      fontSize: "1.3rem",
                      color: "green",
                    }}
                    onClick={() => handleDownload(record)}
                  />
                }
              />
            </Tooltip>
          </div>
        ),
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
                    record.is_released !== 1 || userDivision !== projectDivision
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
        render: (text: any, record: any) => (
          // <div className="text-center">
          //   <Button
          //     type="primary"
          //     size="small"
          //     name="Release"
          //     disabled={
          //       record.is_released === 1 || userDivision !== projectDivision
          //     }
          //     onClick={() => handleRelease(record)}
          //   >
          //     Release
          //   </Button>
          // </div>
          <div className="text-center">
            <Popconfirm
              title="Are you sure to release this revision?"
              onConfirm={async () => handleRelease(record)}
              okText="Yes"
              cancelText="No"
              placement="topRight"
              disabled={
                record.is_released === 1 || userDivision !== projectDivision
              }
            >
              <Button
                type="primary"
                size="small"
                name="Release"
                disabled={
                  record.is_released === 1 || userDivision !== projectDivision
                }
              >
                Release
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    []
  );
  const updateTableTimeout = async () => {
    setTimeout(() => {

      refetch()
    }, 1500);
  };
  const PanelSpecificationTab = () => (
    <>
      <div className="text-end">
        <Button icon={<SyncOutlined color="#492971" />} onClick={refetch}>
          Refresh
        </Button>
      </div>
      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
      <CopyRevision
        version={versionToCopy}
        setVersionToCopy={setVersionToCopy}
        tab={"panel_specifications"}
        updateTable={async () => await updateTableTimeout()}
      />
    </>
  );
  return <PanelSpecificationTab />;
};

export default PanelSpecification;
