"use client";

import { Button, message, Tabs } from "antd";
import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  PROJECT_API, 
} from "@/configs/api-endpoints";
import { useLoading } from "@/hooks/useLoading";
import { useCallback, useEffect, useState } from "react";
import PanelTab from "./PanelTab";
import { getData } from "@/actions/crud-actions";
import { useParams } from "next/navigation";

interface Props {
  designBasisRevisionId: string;
  cableScheduleRevisionId: string;
  loadListLatestRevisionId: any;
  sldRevisions: any;
  projectPanelData: any;
}
const useDataFetching = (
  loadListLatestRevisionId: string,
  cableScheduleRevisionId: string,
  designBasisRevisionId: string,
  project_id: string
) => {
  const { isLoading, setLoading: setIsLoading } = useLoading();
  const [loadListData, setLoadListData] = useState<any[]>([]);
  const [cableScheduleData, setCableScheduleData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any>();
  const fetchData = useCallback(async () => {
    if (!loadListLatestRevisionId) return;

    try {
      setIsLoading(true);
      const loadList = await getData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
      );

      const cableScheduleData = await getData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${cableScheduleRevisionId}`
      );
      const projectData = await getData(`${PROJECT_API}/${project_id}`);
      setProjectData(projectData);

      setCableScheduleData(cableScheduleData.cable_schedule_data);
      setLoadListData(loadList?.electrical_load_list_data);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to data");
    } finally {
      setIsLoading(false);
    }
  }, [loadListLatestRevisionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    projectData,
    cableScheduleData,
    loadListData,
    isLoading,
    refetch: fetchData,
  };
};

const SLDTabs: React.FC<Props> = ({
  designBasisRevisionId,
  cableScheduleRevisionId,
  loadListLatestRevisionId,
  projectPanelData,
  sldRevisions,
}) => {
  const { setLoading: setModalLoading } = useLoading();
  const [sLDTabs, setSLDTabs] = useState<any[]>([]);
  const params = useParams();
  console.log(projectPanelData);
  console.log(sldRevisions);
  const project_id = params?.project_id as string;

  const { projectData, cableScheduleData, loadListData } = useDataFetching(
    loadListLatestRevisionId,
    cableScheduleRevisionId,
    designBasisRevisionId,
    project_id
  );
  const [lastModified, setLastModified] = useState("");
  const [panelWiseData, setPanelWiseData] = useState<any[]>([]);
  useEffect(() => {
    const updatedTabs = panelWiseData.map((tab: any, index: number) => {
      return {
        label: tab.panelName,
        key: index + 1,
        children: (
          <>
            <PanelTab
              panelData={tab}
              designBasisRevisionId={designBasisRevisionId}
              projectPanelData={projectPanelData}
              setLastModified={setLastModified}
            />
          </>
        ),
      };
    });
    setSLDTabs(updatedTabs);
  }, [panelWiseData]);
  useEffect(() => {
    setModalLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loadListData.length && projectPanelData.length) {
      const panelWiseData = projectPanelData.reduce((acc: any, panel: any) => {
        const panelName = panel.panel_name; // Assuming each panel object in projectPanelData has a 'name' property
        const panelId = panel.name; // Assuming each panel object in projectPanelData has a 'name' property
        const filteredData = loadListData.filter(
          (item) => item.panel === panelName
        );

        if (filteredData.length) {
          acc.push({
            panelId,
            panelName,
            data: [],
            otherData: filteredData.map((item) => {
              const cablesize = cableScheduleData.find(
                (el) => el.tag_number === item.tag_number
              );
              return {
                ...item,
                cablesize:
                  cablesize &&
                  cablesize.number_of_runs &&
                  cablesize.number_of_cores &&
                  cablesize.final_cable_size
                    ? `${cablesize.number_of_runs}R X ${cablesize.number_of_cores} X ${cablesize.final_cable_size} Sqmm`
                    : "",
              };
            }),
          });
        } else {
          acc.push({ panelName, panelId, data: [] });
        }

        return acc;
      }, []);

      setPanelWiseData(panelWiseData);
    }
  }, [loadListData, projectPanelData]);

  const getLoadListData = () => {
    if (loadListData.length && projectPanelData.length) {
      setModalLoading(true)
      const panelWiseData = projectPanelData.reduce((acc: any, panel: any) => {
        const panelName = panel.panel_name;
        const panelId = panel.name;
        const filteredData = loadListData.filter(
          (item) => item.panel === panelName
        );

        if (filteredData.length) {
          acc.push({
            panelName,
            panelId,
            data: filteredData.map((item) => {
              const cablesize = cableScheduleData.find(
                (el) => el.tag_number === item.tag_number
              );
              return {
                ...item,
                cablesize:
                  cablesize &&
                  cablesize.number_of_runs &&
                  cablesize.number_of_cores &&
                  cablesize.final_cable_size
                    ? `${cablesize.number_of_runs}R X ${cablesize.number_of_cores} X ${cablesize.final_cable_size} Sqmm`
                    : "",
              };
            }),
            otherData: filteredData.map((item) => {
              const cablesize = cableScheduleData.find(
                (el) => el.tag_number === item.tag_number
              );
              return {
                ...item,
                cablesize:
                  cablesize &&
                  cablesize.number_of_runs &&
                  cablesize.number_of_cores &&
                  cablesize.final_cable_size
                    ? `${cablesize.number_of_runs}R X ${cablesize.number_of_cores} X ${cablesize.final_cable_size} Sqmm`
                    : "",
              };
            }),
          });
        } else {
          acc.push({ panelName, panelId, data: [] });
        }

        return acc;
      }, []);

      setPanelWiseData(panelWiseData);
    }
    setModalLoading(false)
    message.success("Load List Data Fetched Successfully")

  };

  return (
    <div className="">
      <div className="mb-4 flex justify-between gap-4">
        <div className="flex font-semibold">
          <h2>{projectData?.project_oc_number}</h2>
          <h2> / {projectData?.project_name}</h2>
        </div>
        <div className="flex items-center gap-4">
          {lastModified !== "" && (
            <h3 className="italic text-gray-500 text-sm">
              last modified: {lastModified}
            </h3>
          )}
          <Button
            type="primary"
            onClick={getLoadListData}
            className="hover:bg-blue-600"
          >
            Get Load List Details
          </Button>
        </div>
      </div>
      <Tabs
        type="card"
        style={{ fontSize: "11px !important" }}
        items={sLDTabs}
      />
    </div>
  );
};

export default SLDTabs;
