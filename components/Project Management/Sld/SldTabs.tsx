// "use client";

// import { Button, message, Tabs } from "antd";
// import {
//   CABLE_SCHEDULE_REVISION_HISTORY_API,
//   ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
//   PROJECT_PANEL_API,
// } from "@/configs/api-endpoints";
// import { useLoading } from "@/hooks/useLoading";
// import { useCallback, useEffect, useState } from "react";
// import PanelTab from "./PanelTab";
// import { getData } from "@/actions/crud-actions";

// interface Props {
//   designBasisRevisionId: string;
//   cableScheduleRevisionId: string;
//   loadListLatestRevisionId: any;
//   sldRevisions: any;
// }
// const useDataFetching = (
//   loadListLatestRevisionId: string,
//   cableScheduleRevisionId: string,
//   designBasisRevisionId: string
// ) => {
//   const { isLoading, setLoading: setIsLoading } = useLoading();
//   const [loadListData, setLoadListData] = useState<any[]>([]);
//   const [cableScheduleData, setCableScheduleData] = useState<any[]>([]);
//   const [projectPanelData, setProjectPanelData] = useState<any[]>([]);
//   const fetchData = useCallback(async () => {
//     if (!loadListLatestRevisionId) return;

//     try {
//       setIsLoading(true);
//       const loadList = await getData(
//         `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
//       );
//       const projectPanelData = await getData(
//         `${PROJECT_PANEL_API}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]&order_by=creation asc`
//       );
//       const cableScheduleData = await getData(
//         `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${cableScheduleRevisionId}`
//       );
//       setCableScheduleData(cableScheduleData.cable_schedule_data);
//       setProjectPanelData(projectPanelData);
//       setLoadListData(loadList?.electrical_load_list_data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       message.error("Failed to data");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [
//     cableScheduleRevisionId,
//     designBasisRevisionId,
//     loadListLatestRevisionId,
//     setIsLoading,
//   ]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return {
//     projectPanelData,
//     cableScheduleData,
//     loadListData,
//     isLoading,
//     refetch: fetchData,
//   };
// };

// const SLDTabs: React.FC<Props> = ({
//   designBasisRevisionId,
//   cableScheduleRevisionId,
//   loadListLatestRevisionId,
//   sldRevisions,
// }) => {
//   console.log(sldRevisions, "getAllSldRevisions");

//   const { setLoading: setModalLoading } = useLoading();
//   const [sLDTabs, setSLDTabs] = useState<any[]>([]);

//   const { projectPanelData, cableScheduleData, loadListData } = useDataFetching(
//     loadListLatestRevisionId,
//     cableScheduleRevisionId,
//     designBasisRevisionId
//   );

//   const [panelWiseData, setPanelWiseData] = useState<any[]>([]);
//   useEffect(() => {
//     console.log(panelWiseData);

//     const updatedTabs = panelWiseData.map((tab: any, index: number) => {
//       return {
//         label: tab.panelName,
//         key: index + 1,
//         children: (
//           <>
//             <PanelTab
//               panelData={tab}
//               sldRevisions={sldRevisions.filter(
//                 (item: any) => item.panel_name === tab.panelName
//               )}
//               designBasisRevisionId={designBasisRevisionId}
//               projectPanelData={projectPanelData}
//             />
//           </>
//         ),
//       };
//     });
//     setSLDTabs(updatedTabs);
//   }, [designBasisRevisionId, panelWiseData, projectPanelData, sldRevisions]);
//   useEffect(() => {
//     setModalLoading(false);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//   useEffect(() => {
//     console.log(sLDTabs, " sld tabs");

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [sLDTabs]);
//   useEffect(() => {
//     if (loadListData.length && projectPanelData.length) {
//       const panelWiseData = projectPanelData.reduce((acc, panel) => {
//         const panelName = panel.panel_name;
//         const filteredData = loadListData.filter(
//           (item) => item.panel === panelName
//         );

// if (filteredData.length) {
//   acc.push({
//     panelName,
//     data: [],
//     otherData: filteredData.map((item) => {
//       const cablesize = cableScheduleData.find(
//         (el) => el.tag_number === item.tag_number
//       );
//       return {
//         ...item,
//         cablesize:
//           cablesize &&
//           cablesize.number_of_runs &&
//           cablesize.number_of_cores &&
//           cablesize.final_cable_size
//             ? `${cablesize.number_of_runs}R X ${cablesize.number_of_cores} X ${cablesize.final_cable_size} Sqmm`
//             : "",
//       };
//     }),
//   });
// } else {
//   acc.push({ panelName, data: [] });
// }

//         return acc;
//       }, []);

//       setPanelWiseData(panelWiseData);
//       console.log(panelWiseData, "panelWiseData");
//     }
//   }, [cableScheduleData, loadListData, projectPanelData]);

//   const getLoadListData = () => {
//     if (loadListData.length && projectPanelData.length) {
//       const panelWiseData = projectPanelData.reduce((acc, panel) => {
//         const panelName = panel.panel_name;
//         const filteredData = loadListData.filter(
//           (item) => item.panel === panelName
//         );

//         if (filteredData.length) {
//           acc.push({
//             panelName,
//             data: filteredData.map((item) => {
//               const cablesize = cableScheduleData.find(
//                 (el) => el.tag_number === item.tag_number
//               );
//               return {
//                 ...item,
//                 cablesize:
//                   cablesize &&
//                   cablesize.number_of_runs &&
//                   cablesize.number_of_cores &&
//                   cablesize.final_cable_size
//                     ? `${cablesize.number_of_runs}R X ${cablesize.number_of_cores} X ${cablesize.final_cable_size} Sqmm`
//                     : "",
//               };
//             }),
//             otherData: filteredData.map((item) => {
//               const cablesize = cableScheduleData.find(
//                 (el) => el.tag_number === item.tag_number
//               );
//               return {
//                 ...item,
//                 cablesize:
//                   cablesize &&
//                   cablesize.number_of_runs &&
//                   cablesize.number_of_cores &&
//                   cablesize.final_cable_size
//                     ? `${cablesize.number_of_runs}R X ${cablesize.number_of_cores} X ${cablesize.final_cable_size} Sqmm`
//                     : "",
//               };
//             }),
//           });
//         } else {
//           acc.push({ panelName, data: [] });
//         }

//         return acc;
//       }, []);

//       setPanelWiseData(panelWiseData);
//       console.log(panelWiseData);
//     }
//   };

//   return (
//     <div className="">
//       <div className="mb-4 flex justify-end gap-4">
//         <Button
//           type="primary"
//           onClick={getLoadListData}
//           className="hover:bg-blue-600"
//         >
//           Get Load List Details
//         </Button>
//         {/* <Button type="primary" onClick={() => {}} className="hover:bg-blue-600">
//           Panel Mapping
//         </Button> */}
//       </div>
//       <Tabs
//         // onChange={onChange}
//         type="card"
//         style={{ fontSize: "11px !important" }}
//         items={sLDTabs}
//       />
//     </div>
//   );
// };

// export default SLDTabs;

"use client";

import { Button, message, Tabs } from "antd";
import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  PROJECT_API,
  PROJECT_PANEL_API,
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
}
const useDataFetching = (
  loadListLatestRevisionId: string,
  cableScheduleRevisionId: string,
  designBasisRevisionId: string,
  project_id: string,
) => {
  const { isLoading, setLoading: setIsLoading } = useLoading();
  const [loadListData, setLoadListData] = useState<any[]>([]);
  const [cableScheduleData, setCableScheduleData] = useState<any[]>([]);
  const [projectPanelData, setProjectPanelData] = useState<any[]>([]);
  const [projectData, setProjectData] = useState<any>()
  const fetchData = useCallback(async () => {
    if (!loadListLatestRevisionId) return;

    try {
      setIsLoading(true);
      const loadList = await getData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
      );
      const projectPanelData = await getData(
        `${PROJECT_PANEL_API}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]&order_by=creation asc`
      );
      const cableScheduleData = await getData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${cableScheduleRevisionId}`
      );
      const projectData = await getData(
        `${PROJECT_API}/${project_id}`
      ); 
      setProjectData(projectData)

      setCableScheduleData(cableScheduleData.cable_schedule_data);
      setProjectPanelData(projectPanelData);
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
    projectPanelData,
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
  sldRevisions,
}) => {
  const { setLoading: setModalLoading } = useLoading();
  const [sLDTabs, setSLDTabs] = useState<any[]>([]);
  const params  = useParams();
  console.log(params);
  const project_id = params?.project_id as string
  
  const { projectData,projectPanelData, cableScheduleData, loadListData } = useDataFetching(
    loadListLatestRevisionId,
    cableScheduleRevisionId,
    designBasisRevisionId,
    project_id
  );

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
              sldRevisions={sldRevisions.filter(
                (item: any) => item.panel_name === tab.panelName
              )}
              designBasisRevisionId={designBasisRevisionId}
              projectPanelData={projectPanelData}
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
      const panelWiseData = projectPanelData.reduce((acc, panel) => {
        const panelName = panel.panel_name; // Assuming each panel object in projectPanelData has a 'name' property
        const filteredData = loadListData.filter(
          (item) => item.panel === panelName
        );

        if (filteredData.length) {
          acc.push({
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
          acc.push({ panelName, data: [] });
        }

        return acc;
      }, []);

      setPanelWiseData(panelWiseData);
    }
  }, [loadListData, projectPanelData]);

  const getLoadListData = () => {
    if (loadListData.length && projectPanelData.length) {
      const panelWiseData = projectPanelData.reduce((acc, panel) => {
        const panelName = panel.panel_name;
        const filteredData = loadListData.filter(
          (item) => item.panel === panelName
        );

        if (filteredData.length) {
          acc.push({
            panelName,
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
          acc.push({ panelName, data: [] });
        }

        return acc;
      }, []);

      setPanelWiseData(panelWiseData);
    }
  };

  return (
    <div className="">
      <div className="mb-4 flex justify-between gap-4">
        <div className="flex font-semibold">
          <h2>{projectData?.project_oc_number}</h2>
          <h2> / {projectData?.project_name}</h2>
        </div>
        <Button
          type="primary"
          onClick={getLoadListData}
          className="hover:bg-blue-600"
        >
          Get Load List Details
        </Button>
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
