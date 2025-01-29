import { downloadFile, getData, updateData } from "@/actions/crud-actions";
import CopyRevision from "@/components/Modal/CopyRevision";
import {
  DYNAMIC_DOCUMENT_API,
  GET_PANEL_SPECS_EXCEL_API,
  PANEL_SPECS_REVISIONS_API,
  PROJECT_API,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { useGetData } from "@/hooks/useCRUD";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLoading } from "@/hooks/useLoading";
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
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!panel?.name || !sld_revision_id) {
      setError("Missing required panel name or SLD revision ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [panelSpecificationRevisionsResponse, sldDataResponse] =
        await Promise.all([
          getData(
            `${PANEL_SPECS_REVISIONS_API}?fields=["*"]&filters=[["panel_id", "=", "${panel.name}"]]`
          ),
          getData(`${SLD_REVISIONS_API}/${sld_revision_id}`),
        ]);

      setPanelSpecificationRevisions(
        sortDatewise(panelSpecificationRevisionsResponse) || []
      );

      const busbarData = sldDataResponse?.busbar_sizing_data?.[0];
      setSldData(busbarData || null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
      setPanelSpecificationRevisions([]);
      setSldData(null);
    } finally {
      setIsLoading(false);
    }
  }, [panel?.name, sld_revision_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    panelSpecificationRevisions,
    sldData,
    isLoading,
    error,
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
  const { setLoading } = useLoading();
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

  const getExcelName = useCallback(
    async (revision_id?: string) => {
      let revisionNo = 0;
      dataSource?.forEach((item: any, index: number) => {
        if (item.key === revision_id) {
          revisionNo = index;
        }
      });

      const documents_number = await getData(
        `${DYNAMIC_DOCUMENT_API}?fields=["panel_specification"]&filters=[["panel_id", "=", "${panel?.name}"]]`
      );
      // console.log(documents_data);

      const filename =
        documents_number[0]?.panel_specification +
        "_R" +
        revisionNo +
        "_" +
        panelData?.panelName +
        " Panel Specifications";
      return filename;
    },
    [dataSource, panel?.name, panelData?.panelName]
  );
  const handleDownload = useCallback(
    async (revision_id: string) => {
      //  setDownloadIconSpin(true);
      // getExcelName(revision_id);
      try {
        const base64Data: any = await downloadFile(
          GET_PANEL_SPECS_EXCEL_API,
          true,
          {
            revision_id,
          }
        );

        const binaryData = Buffer.from(base64Data, "base64");
        const blob = new Blob([binaryData], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);

        const filename = `${getExcelName(revision_id)}.xlsx`;

        link.download = filename.replace(/"/g, "");

        link.click();
      } catch (error) {
        console.error(error);
        message.error("Unable to download file");

        // setDownloadIconSpin(false);
      } finally {
        // setDownloadIconSpin(false);
      }
    },
    [getExcelName]
  );

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

  const handleSave = useCallback(
    async (key: string) => {
      if (!sldData) {
        message.error("Missing busbar sizing data");
        return;
      }

      if (!designBasisRevisionId) {
        message.error("Missing design basis revision ID");
        return;
      }
      setLoading(true)
      try {
        const payload = {
          is_saved: 1,
          design_basis_revision_id: designBasisRevisionId,
          sld_height_of_panel: sldData.enclosure_height || null,
        };

        const response = await updateData(
          `${PANEL_SPECS_REVISIONS_API}/${key}`,
          false,
          payload
        );

        if (response) {
          await refetch(); // Wait for refetch to complete
          message.success("Panel Specification Saved");
        }
      } catch (error) {
        console.error("Save error:", error);
        message.error("Unable to Save Panel Specification");
      } finally {
        setLoading(false)

      }
    },
    [sldData, designBasisRevisionId, setLoading, refetch] // Dependencies
  );

  const handleClone = async (record: any) => {
    setVersionToCopy(record);
  };
  const handleRelease = useCallback(
    async (record: any) => {
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
    },
    [refetch]
  );
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
                    onClick={() => handleSave(record?.key)}
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
                    onClick={() => handleDownload(record.key)}
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
    [handleDownload, handleRelease, handleSave, projectDivision, userDivision]
  );
  const updateTableTimeout = async () => {
    setTimeout(() => {
      refetch();
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
