import { getData, updateData } from "@/actions/crud-actions";
import { GA_REVISIONS_API, PROJECT_API } from "@/configs/api-endpoints";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { getThermaxDateFormat } from "@/utils/helpers";
import {
  CloudDownloadOutlined,
  CopyTwoTone,
  FolderOpenOutlined,
  SaveTwoTone,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, message, Table, TableColumnsType, Tag, Tooltip } from "antd";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getPanelDoctype } from "../Incomer/Add Incomer/AddIncomer";
import { useLoading } from "@/hooks/useLoading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetData } from "@/hooks/useCRUD";
import CopyRevision from "@/components/Modal/CopyRevision";

const useDataFetching = (project_id: string, panel: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [panelGARevisions, setpanelGARevisions] = useState<any>();
  const [panelData, setPanelData] = useState<any>();

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
      const fields = getFields(panel?.panel_main_type);
      console.log(fields);
      
      const panelData = await getData(
        `${getPanelDoctype(
          panel?.panel_main_type
        )}?fields=["*"]&filters=[["panel_id", "=", "${panel?.name}"]]`
      );
      if (panelData) {
        setPanelData(panelData[0]);
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
    refetch: fetchData,
  };
};
interface Props {
  panelData: any;
  projectPanelData: any;
  sld_revision_id: string;
}

const PanelGa: React.FC<Props> = ({
  panelData,
  projectPanelData,
  sld_revision_id,
}) => {
  const params = useParams();
  const project_id = params.project_id as string;
  console.log(panelData);
  console.log(projectPanelData);

  const panel = projectPanelData?.find(
    (el: any) => el.panel_name === panelData.panelName
  );

  const { panelGARevisions, designBasisData, refetch } = useDataFetching(
    project_id,
    panel
  );
  console.log(designBasisData);
  console.log(panelGARevisions);
  const { setLoading } = useLoading();
  const userInfo: {
    division: string;
  } = useCurrentUser();

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
        panel_id: panel.name,
      })),
    [panelGARevisions]
  );
  console.log(dataSource);

  const handleDownload = async (record: any) => {
    console.log(record);
    if (record.status === SLD_REVISION_STATUS.DEFAULT) {
      try {
        const respose = await updateData(
          `${GA_REVISIONS_API}/${record.key}`,
          false,
          { status: SLD_REVISION_STATUS.DOWNLOAD_READY }
        );
        // setLoading(false);
        console.log(respose);
        message.success("Panel GA is Being Prepared Please Wait For A While");
        // const interval = setInterval(async () => {
        //   getSLDRevision();
        //   // const revisionData:any = await getSLDRevision();
        //   // const updatedRecord = revisionData.find((r:any) => r.key === record.key); // Find the specific record by key
        //   // if (updatedRecord && updatedRecord.status === SLD_REVISION_STATUS.SUCCESS) {
        //   //   clearInterval(interval); // Stop the interval when the status is SUCCESS
        //   //   const link = document.createElement("a");
        //   //   link.href = updatedRecord.sld_path;
        //   //   document.body.appendChild(link);
        //   //   link.click();
        //   //   document.body.removeChild(link);
        //   // }
        // }, 30000); // 30 seconds interval
      } catch (error) {
      } finally {
      }
    } else if (record.status === SLD_REVISION_STATUS.SUCCESS) {
      const link = document.createElement("a");
      link.href = record.path;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleSave = async (key: any) => {
    console.log(designBasisData);
    console.log(key);

    const payload = {
      panel_ga_data: [
        {
          panel_front_type: designBasisData?.ga_mcc_compartmental,
          type_of_construction_for_board:
            designBasisData?.ga_mcc_construction_front_type,
          panel_incoming_feeder_drawout_type:
            designBasisData?.incoming_drawout_type,
          panel_outgoing_feeder_drawout_type:
            designBasisData?.outgoing_drawout_type,
          switchgear_selection_revision_id: sld_revision_id,
        },
      ],
    };
    try {
      console.log(payload);
      console.log(`${GA_REVISIONS_API}/${key}`);

      const respose = await updateData(
        `${GA_REVISIONS_API}/${key}`,
        false,
        payload
      );
      message.success("Panel GA Saved");
    } catch (error) {
      message.error("Unable to Save Panel GA");
    }
  };
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
