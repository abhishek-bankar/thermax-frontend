import { getData, updateData } from "@/actions/crud-actions";
import { GA_REVISIONS_API, PROJECT_API } from "@/configs/api-endpoints";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { convertToFrappeDatetime, getThermaxDateFormat } from "@/utils/helpers";
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
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
} from "antd";
import { useParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLoading } from "@/hooks/useLoading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetData } from "@/hooks/useCRUD";
import CopyRevision from "@/components/Modal/CopyRevision";
import { getPanelDoctype } from "../Incomer/Add Incomer/AddIncomer";

const useDataFetching = (project_id: string, panel: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [panelGARevisions, setpanelGARevisions] = useState<any>();
  const [panelData, setPanelData] = useState<any>();
  const [hasInProcessItems, setHasInProcessItems] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const panelGARevisions = await getData(
        `${GA_REVISIONS_API}?fields=["*"]&filters=[["panel_id", "=", "${panel?.name}"]]`
      );
      console.log(panel?.name, "vishal");
      console.log(panelGARevisions, "vishal");

      if (panelGARevisions) {
        const sortedData = panelGARevisions.sort((a: any, b: any) => {
          const dateA = new Date(a.creation);
          const dateB = new Date(b.creation);
          return dateA.getTime() - dateB.getTime();
        });

        const hasProcessingItems = sortedData.some(
          (item: any) =>
            item.status === SLD_REVISION_STATUS.IN_PROCESS ||
            item.status === SLD_REVISION_STATUS.IN_QUEUE
        );
        setHasInProcessItems(hasProcessingItems);
        setpanelGARevisions(sortedData);
      }
      const getFields = (name: string) => {
        switch (name) {
          case "MCC":
            return [
              "ga_mcc_compartmental",
              "ga_mcc_construction_front_type",
              "incoming_drawout_type",
              "outgoing_drawout_type",
            ];
          case "PCC":
            return [
              "ga_pcc_compartmental",
              "ga_pcc_construction_front_type",
              "incoming_drawout_type",
              "outgoing_drawout_type",
            ];
          default:
            return [
              "ga_mcc_compartmental",
              "ga_mcc_construction_front_type",
              "incoming_drawout_type",
              "outgoing_drawout_type",
            ];
        }
      };
      const panelDataByType = (panel: string, panelData: any) => {
        if (panel === "MCC") {
          return {
            panel_front_type: panelData?.ga_mcc_compartmental,
            type_of_construction_for_board:
              panelData?.ga_mcc_construction_front_type,
            panel_incoming_feeder_drawout_type:
              panelData?.incoming_drawout_type,
            panel_outgoing_feeder_drawout_type:
              panelData?.outgoing_drawout_type,
          };
        }
        if (panel === "PCC") {
          return {
            panel_front_type: panelData?.ga_pcc_compartmental,
            type_of_construction_for_board:
              panelData?.ga_pcc_construction_front_type,
            panel_incoming_feeder_drawout_type:
              panelData?.incoming_drawout_type,
            panel_outgoing_feeder_drawout_type:
              panelData?.outgoing_drawout_type,
          };
        }
      };
      const fields = getFields(panel?.panel_main_type);
      console.log(fields);

      const panelData = await getData(
        `${getPanelDoctype(
          panel?.panel_main_type
        )}?fields=["*"]&filters=[["panel_id", "=", "${panel?.name}"]]`
      );
      if (panelData) {
        console.log(
          panelDataByType(panel?.panel_main_type, panelData[0]),
          "vishal 2"
        );

        setPanelData(panelDataByType(panel?.panel_main_type, panelData[0]));
      }
      console.log(panelData);
      console.log(panelGARevisions);

      setIsLoading(false);
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
    panelGARevisions,
    isLoading,
    hasInProcessItems,
    refetch: fetchData,
  };
};
interface Props {
  panelData: any;
  projectPanelData: any;
  setLastModified: any;
  sld_revision_id: string;
}

const PanelGa: React.FC<Props> = ({
  panelData,
  projectPanelData,
  setLastModified,
  sld_revision_id,
}) => {
  const params = useParams();
  const project_id = params.project_id as string;
  console.log(panelData);
  console.log(projectPanelData);

  const panel = projectPanelData?.find(
    (el: any) => el.panel_name === panelData.panelName
  );

  const { panelGARevisions, designBasisData, hasInProcessItems, refetch } =
    useDataFetching(project_id, panel);
  console.log(designBasisData);
  console.log(panelGARevisions);
  const { setLoading } = useLoading();
  const userInfo: {
    division: string;
  } = useCurrentUser();
  const [setIntervaId, setSetIntervaId] = useState<any>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);
  const [versionToCopy, setVersionToCopy] = useState(null);

  const userDivision = userInfo?.division;
  console.log(projectData, "project data");

  const projectDivision = projectData?.division;
  console.log(panelGARevisions, "Panel GA revisions");

  const dataSource = useMemo(
    () =>
      panelGARevisions?.map((item: any, index: number) => ({
        key: item.name,
        documentName: "Panel GA",
        status: item.status,
        documentRevision: `R${index}`,
        createdDate: item.creation,
        path: item.path,
        is_released: item.is_released,
        is_copied: item.is_copied,
        panel_id: panel.name,
      })),
    [panelGARevisions]
  );
  useEffect(() => {
    console.log(panelGARevisions, "GA Revision");
    if (panelGARevisions?.length) {
      console.log(panelGARevisions[panelGARevisions.length - 1], "GA Revision");
      const lastModified = convertToFrappeDatetime(
        new Date(panelGARevisions[panelGARevisions.length - 1]?.modified)
      );
      setLastModified(lastModified);
    }
  }, [panelGARevisions]);
  useEffect(() => {
    if (hasInProcessItems) {
      refreshIntervalRef.current = setInterval(refetch, 30000);
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
    if (!versionToCopy) {
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [versionToCopy]);

  const handleDownload = async (record: any) => {
    console.log(record);
    setLoading(true);
    if (record.status === SLD_REVISION_STATUS.DEFAULT) {
      try {
        const respose = await updateData(
          `${GA_REVISIONS_API}/${record.key}`,
          false,
          { status: SLD_REVISION_STATUS.IN_QUEUE }
        );
        console.log(respose);
        message.success("Panel GA is Being Prepared Please Wait For A While");
      } catch (error) {
      } finally {
        refetch();
        setLoading(false);
      }
    } else if (record.status === SLD_REVISION_STATUS.SUCCESS) {
      const link = document.createElement("a");
      link.href = record.path;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  console.log(designBasisData, "Design basis data ");

  const handleSave = useCallback(
    async (key: any) => {
      console.log(key);
      console.log(sld_revision_id);
      console.log(designBasisData, "Design basis data save");

      const payload = {
        panel_ga_data: [
          {
            ...designBasisData,
            switchgear_selection_revision_id: sld_revision_id,
          },
        ],
        status: SLD_REVISION_STATUS.DEFAULT,
      };

      try {
        console.log(payload);
        console.log(`${GA_REVISIONS_API}/${key}`);

        const response = await updateData(
          `${GA_REVISIONS_API}/${key}`,
          false,
          payload
        );

        if (response) {
          const lastModified = convertToFrappeDatetime(
            new Date(response?.modified)
          );
          setLastModified(lastModified);
          refetch();
        }
        message.success("Panel GA Saved");
      } catch (error) {
        message.error("Unable to Save Panel GA");
      }
    },
    [sld_revision_id, designBasisData, setLastModified, refetch] // Dependencies for memoization
  );
  const handleRelease = async (record: any) => {
    console.log(record);
    try {
      // console.log(row);
      if (record.is_released === 0) {
        const respose = await updateData(
          `${GA_REVISIONS_API}/${record?.key}`,
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
  const handleClone = async (record: any) => {
    setVersionToCopy(record);
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
        render: (text, record) => {
          if (
            record.status === SLD_REVISION_STATUS.IN_PROCESS ||
            record.status === SLD_REVISION_STATUS.IN_QUEUE
          ) {
            return (
              <div className="flex justify-center">
                <Spin />
              </div>
            );
          } else {
            return (
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
            );
          }
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
          <div className="text-center">
            <Button
              type="primary"
              size="small"
              name="Release"
              disabled={
                record.is_released === 1 || userDivision !== projectDivision
              }
              onClick={() => handleRelease(record)}
            >
              Release
            </Button>
          </div>
        ),
      },
    ],
    []
  );
  // useEffect(() => {
  //   const in_process = dataSource?.some(
  //     (item: any) => item.status === "IN_PROCESS" || item.status === "IN_QUEUE"
  //   );
  //   if (in_process) {
  //     const interval = setInterval(async () => {
  //       refetch();
  //     }, 30000);
  //     setSetIntervaId(interval);
  //   } else {
  //     if (setIntervaId) {
  //       clearInterval(setIntervaId);
  //       setSetIntervaId(null);
  //     }
  //     // setSetIntervaId()
  //   }
  // }, [setIntervaId, dataSource, refetch]);
  const GARevisionTab = () => (
    <>
      <div className="text-end">
        <Button onClick={refetch} icon={<SyncOutlined color="#492971" />}>
          Refresh
        </Button>
      </div>
      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
      <CopyRevision
        version={versionToCopy}
        setVersionToCopy={setVersionToCopy}
        tab={"panel_ga"}
        updateTable={() => refetch()}
      />
    </>
  );
  return <GARevisionTab />;
};

export default PanelGa;
