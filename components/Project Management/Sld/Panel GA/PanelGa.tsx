import { getData, updateData } from "@/actions/crud-actions";
import { GA_REVISIONS_API } from "@/configs/api-endpoints";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { getThermaxDateFormat } from "@/utils/helpers";
import {
  CloudDownloadOutlined,
  FolderOpenOutlined,
  SaveTwoTone,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, message, Table, TableColumnsType, Tag, Tooltip } from "antd";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getPanelDoctype } from "../Incomer/Add Incomer/AddIncomer";

const useDataFetching = (project_id: string, panel: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [panelGARevisions, setpanelGARevisions] = useState<any>();
  const [panelData, setPanelData] = useState<any>();
  const [swSelectionData, setSwSelectionData] = useState<any[]>([]);
  const [commonConfiguration, setCommonConfiguration] = useState<any[]>([]);
  // const panel_id = "";

  const [makeComponents, setMakeComponents] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const panelGARevisions = await getData(
        `${GA_REVISIONS_API}?fields=["*"]&filters=[["panel_id", "=", "${panel?.name}"],["project_id", "=", "${project_id}"]]`
      );
      if (panelGARevisions) {
        setpanelGARevisions(panelGARevisions);
      }
      const panelData = await getData(
        `${getPanelDoctype(
          panel?.panel_main_type
        )}?fields=["ga_mcc_compartmental","ga_mcc_construction_front_type","incoming_drawout_type","outgoing_drawout_type"]&filters=[["panel_id", "=", "${
          panel?.name
        }"]]`
      );
      if (panelData) {
        setPanelData(panelData[0]);
      }
      console.log(panelData);
      console.log(panelGARevisions);

      // const commonConfiguration = await getData(
      //   `${COMMON_CONFIGURATION_1}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      // );
      // const commonConfiguration2 = await getData(
      //   `${COMMON_CONFIGURATION_2}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      // )
      // const commonConfiguration3 = await getData(
      //   `${COMMON_CONFIGURATION_3}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      // )

      // const commonConfiguration: any =  [...(commonConfiguration1 || []), ...(commonConfiguration2 || []), ...(commonConfiguration3 || [])].flat()
      // console.log(revision_id, "revision_id");

      // const sg_saved_data = await getData(
      //   `${SLD_REVISIONS_API}/${revision_id}`
      // );
      // const makeComponents = await getData(
      //   `${MAKE_OF_COMPONENT_API}?fields=["preferred_soft_starter","preferred_lv_switchgear","preferred_vfdvsd"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      // );
      // console.log(commonConfiguration, "commonConfiguration");

      // const formattedData = getArrayOfSwitchgearSelectionData(
      //   loadListData,
      //   sg_saved_data?.switchgear_selection_data,
      //   commonConfiguration[0],
      //   makeComponents[0],
      //   division
      // );
      // setMakeComponents(makeComponents[0]);
      // setCommonConfiguration(commonConfiguration[0]);
      // setSwSelectionData(formattedData);
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
    commonConfiguration,
    makeComponents,
    swSelectionData,
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

  const {
    panelGARevisions,
    commonConfiguration,
    makeComponents,
    designBasisData,
    swSelectionData,
    isLoading,
  } = useDataFetching(project_id, panel);
  const dataSource = useMemo(
    () =>
      panelGARevisions?.map((item: any, index: number) => ({
        key: item.name,
        documentName: "Panel GA",
        status: item.status,
        documentRevision: `R${index}`,
        createdDate: item.creation,
        sld_path: item.sld_path,
      })),
    [panelGARevisions]
  );
  const handleDownload = async (record: any) => {
    console.log(record);
    // if (record.status === SLD_REVISION_STATUS.DEFAULT) {
    //   try {
    //     const respose = await updateData(
    //       `${SLD_REVISIONS_API}/${record.key}`,
    //       false,
    //       { status: SLD_REVISION_STATUS.DOWNLOAD_READY }
    //     );
    //     // setLoading(false);
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
  const handleSave = async (key: any) => {
    console.log(key);
    
    const payload = {
      panel_ga_data: [{
        panel_front_type: designBasisData?.ga_mcc_compartmental,
        type_of_construction_for_board: designBasisData?.ga_mcc_construction_front_type,
        panel_incoming_feeder_drawout_type: designBasisData?.incoming_drawout_type,
        panel_outgoing_feeder_drawout_type: designBasisData?.outgoing_drawout_type,
        switchgear_selection_revision_id: sld_revision_id,
      }],
    }; 
    try {
      console.log(payload);
      console.log(`${GA_REVISIONS_API}/${key}`);
      
      const respose = await updateData(`${GA_REVISIONS_API}/${key}`, false, payload);
      message.success("Panel GA Saved");
    } catch (error) {
      message.error("Unable to Save Panel GA");
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
                    // disabled={
                    //   (tab === "lpbs-specs" &&
                    //     !commonConfigData?.is_local_push_button_station_selected) ||
                    //   (tab === "local-isolator" &&
                    //     !commonConfigData?.is_field_motor_isolator_selected)
                    // }
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
        title: () => <div className="text-center">Release</div>,
        dataIndex: "release",
        render: () => (
          <div className="text-center">
            <Button type="primary" size="small" name="Release">
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
        <Button icon={<SyncOutlined color="#492971" />}>Refresh</Button>
      </div>
      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
    </>
  );
  return <GARevisionTab />;
};

export default PanelGa;
