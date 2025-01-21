// import { Button, Input, message, Space, Spin } from "antd";
// import Modal from "@/components/Modal/Modal";
// import React, { useCallback, useEffect, useState } from "react";

// import { Divider, Table } from "antd";
// import type { TableColumnsType, TableProps } from "antd";
// import {
//   CIRCUIT_BREAKER_API,
//   GET_CB_COUNT,
//   GET_SFU_COUNT,
//   MAKE_OF_COMPONENT_API,
//   MCC_PANEL,
//   PCC_PANEL,
//   PROJECT_INFO_API,
//   SFU_API,
//   SLD_REVISIONS_API,
// } from "@/configs/api-endpoints";
// import { getData, updateData } from "@/actions/crud-actions";
// import { useParams } from "next/navigation";
// import { convertToFrappeDatetime } from "@/utils/helpers";
// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   panelType: string;
//   revision_id: string;
//   panel_id: string;
//   sld_revision_id: string;
//   designBasisRevisionId: string;
//   panelData: any;
//   setLastModified: any;
//   incomers: any;
// }
// const getRatingForIncomer = (sg_data: any, projectInfo: any) => {
//   if (!sg_data) return 0;
//   let totalWorkingKW = 0;
//   let highestStandbyKW = 0;
//   console.log(projectInfo);

//   const supply_voltage = Number(projectInfo[0]?.main_supply_lv.split(" ")[0]);
//   sg_data?.switchgear_selection_data?.forEach((item: any) => {
//     totalWorkingKW += item.working_kw || 0;
//     if (item.standby_kw > highestStandbyKW) {
//       highestStandbyKW = item.standby_kw;
//     }
//   });
//   const total_sum_kw = (totalWorkingKW + highestStandbyKW / 2) * 1000;
//   const incomer_current = (total_sum_kw / (1.732 * supply_voltage * 0.8)) * 1.2;
//   console.log(total_sum_kw);
//   console.log(incomer_current);

//   return incomer_current.toFixed(2);
// };
// const getDevice = (sg_data: any, projectPanelData: any, projectInfo: any) => {

//   return Number(getRatingForIncomer(sg_data, projectInfo)) <=
//     Number(projectPanelData?.incomer_ampere)
//     ? projectPanelData?.incomer_type
//     : projectPanelData?.incomer_above_type;
// };

// const getPoles = (sg_data: any, projectPanelData: any, projectInfo: any) => {
//   return Number(getRatingForIncomer(sg_data, projectInfo)) <=
//     Number(projectPanelData?.incomer_ampere)
//     ? projectPanelData?.incomer_pole
//     : projectPanelData?.incomer_above_pole;
// };
// export const getPanelDoctype = (name: string) => {
//   switch (name) {
//     case "MCC":
//       return MCC_PANEL;
//     case "PCC":
//       return PCC_PANEL;

//     default:
//       return MCC_PANEL;
//   }
// };
// const useDataFetching = (
//   panelType: string,
//   revision_id: string,
//   panel_id: string,
//   sld_revision_id: string,
//   project_id: string
// ) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [sg_data, setSg_data] = useState<any>([]);
//   const [makeComponents, setMakeComponents] = useState<any>([]);
//   const [incomerResponse, setIncomerResponse] = useState<any[]>([]);
//   const [totalCountOfItems, setTotalCountOfItems] = useState<number>(0);

//   const [projectPanelData, setProjectPanelData] = useState<any>([]);
//   const [projectInfo, setProjectInfo] = useState<any>();

//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const makeComponents = await getData(
//         `${MAKE_OF_COMPONENT_API}?fields=["preferred_lv_switchgear"]&filters=[["revision_id", "=", "${revision_id}"]]`
//       );
//       const project_info = await getData(
//         `${PROJECT_INFO_API}?fields=["main_supply_lv"]&filters=[["project_id", "=", "${project_id}"]]`
//       );
//       if (project_info) {
//         setProjectInfo(project_info);
//       }
//       const projectPanelData = await getData(
//         `${getPanelDoctype(
//           panelType
//         )}?fields=["*"]&filters=[["panel_id", "=", "${panel_id}"]]`
//       );
//       const sg_data = await getData(`${SLD_REVISIONS_API}/${sld_revision_id}`);

//       const preferredSwitchgear =
//         makeComponents[0]?.preferred_lv_switchgear.toUpperCase();
//       const pole =
//         getPoles(sg_data, projectPanelData[0], project_info) + "-POLE";
//       const device = getDevice(sg_data, projectPanelData[0], project_info);
//       const current_rating = getRatingForIncomer(sg_data, project_info);
//       let filters;

//       let url;
//       if (device === "SFU") {
//         filters = [
//           ["make", "=", preferredSwitchgear],
//           [
//             "pole",
//             "like",
//             `%${getPoles(sg_data, projectPanelData[0], project_info)}%`,
//           ],
//           ["ampere", ">=", current_rating],
//         ];
//       } else {
//         filters = [
//           ["manufacturer", "=", preferredSwitchgear],
//           ["cb_type", "like", `%${pole}%`],
//           ["type_int", "like", `%${device}%`],
//           ["current_rating", ">=", current_rating],
//         ];
//       }
//       if (device === "SFU") {
//         url = `${SFU_API}?fields=["*"]&filters=${JSON.stringify(
//           filters
//         )}&limit_start=${0}&limit=${200}`;
//       } else {
//         url = `${CIRCUIT_BREAKER_API}?fields=["*"]&filters=${JSON.stringify(
//           filters
//         )}&limit_start=${0}&limit=${200}`;
//       }

//       const response = await getData(url);
//       if (device === "SFU") {
//         const data = response?.map((el: any) => {
//           return {
//             catalog: el.sdf,
//             current_rating: el.ampere,
//             cb_type: el.pole,
//             description: el.description,
//           };
//         });
//         setIncomerResponse(data || []);
//       } else {
//         setIncomerResponse(response || []);
//       }
//       const count_url = device === "SFU" ? GET_SFU_COUNT : GET_CB_COUNT;
//       const total_count = await getData(
//         count_url + `&filters=${JSON.stringify(filters)}`
//       );
//       setTotalCountOfItems(total_count);
//       setProjectPanelData(projectPanelData[0]);
//       setMakeComponents(makeComponents[0]);
//       setSg_data(sg_data);
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       message.error("Failed to load data");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [panelType, panel_id, revision_id, sld_revision_id]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return {
//     projectInfo,
//     totalCountOfItems,
//     incomerResponse,
//     projectPanelData,
//     sg_data,
//     makeComponents,
//     isLoading,
//   };
// };
// const AddIncomer: React.FC<Props> = ({
//   isOpen,
//   onClose,
//   panelType,
//   revision_id,
//   panel_id,
//   sld_revision_id,
//   setLastModified,
//   incomers,
// }) => {
//   const params = useParams();

//   const project_id = params.project_id as string;
//   const {
//     projectInfo,
//     totalCountOfItems,
//     incomerResponse,
//     projectPanelData,
//     sg_data,
//     makeComponents,
//     isLoading: dataLoading,
//   } = useDataFetching(
//     panelType,
//     revision_id,
//     panel_id,
//     sld_revision_id,
//     project_id
//   );

//   const [searchModel, setSearchModel] = useState("");
//   const [searchRating, setSearchRating] = useState("");

//   const [tableData, setTableData] = useState<any>(incomerResponse);
//   const [loading, setLoading] = useState(false);
//   const [tableParams, setTableParams] = useState({
//     pagination: {
//       current: 1,
//       pageSize: 200,
//       total: totalCountOfItems,
//     },
//   });
//   const [selectedBreaker, setSelectedBreaker] = useState<any>(null);
//   const columns: TableColumnsType<any> = [
//     {
//       title: "Model Number",
//       dataIndex: "catalog",
//       key: "model",
//       width: 20,
//     },
//     {
//       title: "Rating",
//       dataIndex: "current_rating",
//       key: "current_rating",
//       width: 20,
//     },
//     {
//       title: "Type",
//       dataIndex: "cb_type",
//       key: "cb_type",
//       width: 50,
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//       // width: "30%",
//     },
//   ];

//   useEffect(() => {
//     if (totalCountOfItems) {
//       setTableParams({
//         ...tableParams,
//         pagination: {
//           ...tableParams.pagination,
//           total: totalCountOfItems,
//         },
//       });
//     }
//   }, [tableParams, totalCountOfItems]);

//   const getCircuitBreakersData = useCallback(
//     async (page = 1, pageSize = 200) => {
//       try {
//         setLoading(true);
//         const preferredSwitchgear =
//           makeComponents?.preferred_lv_switchgear.toUpperCase();
//         const pole = getPoles(sg_data, projectPanelData, projectInfo) + "-POLE";
//         const device = getDevice(sg_data, projectPanelData, projectInfo);
//         let filters;

//         const current_rating = getRatingForIncomer(sg_data, projectInfo);
//         if (device === "SFU") {
//           filters = [
//             ["make", "=", preferredSwitchgear],
//             [
//               "pole",
//               "like",
//               `%${getPoles(sg_data, projectPanelData[0], projectInfo)}%`,
//             ],
//             ["ampere", ">=", current_rating],
//           ];
//         } else {
//           filters = [
//             ["manufacturer", "=", preferredSwitchgear],
//             ["cb_type", "like", `%${pole}%`],
//             ["type_int", "like", `%${device}%`],
//             ["current_rating", ">=", current_rating],
//           ];
//         }

//         if (searchModel) {
//           if (device === "SFU") {
//             filters.push(["sdf", "like", `%${searchModel}%`]);
//           } else {
//             filters.push(["catalog", "like", `%${searchModel}%`]);
//           }
//         }

//         if (searchRating) {
//           filters.pop();
//           if (device === "SFU") {
//             filters.push(["ampere", "=", searchRating]);
//           } else {
//             filters.push(["current_rating", "=", searchRating]);
//           }
//         }

//         const encodedFilters = encodeURIComponent(JSON.stringify(filters));
//         const limit_start = (page - 1) * pageSize;

//         let url;
//         if (device === "SFU") {
//           url = `${SFU_API}?fields=["*"]&filters=${encodedFilters}&limit_start=${limit_start}&limit=${pageSize}`;
//         } else {
//           url = `${CIRCUIT_BREAKER_API}?fields=["*"]&filters=${encodedFilters}&limit_start=${limit_start}&limit=${pageSize}`;
//         }

//         const count_url = device === "SFU" ? GET_SFU_COUNT : GET_CB_COUNT;

//         const total_count = await getData(
//           count_url + `&filters=${JSON.stringify(filters)}`
//         );

//         const response = await getData(url);

//         setTableData(response || []);
//         setTableParams({
//           ...tableParams,
//           pagination: {
//             ...tableParams.pagination,
//             total: total_count || 0,
//           },
//         });
//       } catch (error) {
//         console.error("Error fetching circuit breaker data:", error);
//         message.error("Failed to load circuit breaker data");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [
//       makeComponents,
//       sg_data,
//       projectPanelData,
//       searchModel,
//       searchRating,
//       setLoading,
//       setTableData,
//       setTableParams,
//       tableParams,
//     ]
//   );

//   const handleTableChange = (pagination: any) => {
//     setTableParams({
//       pagination,
//     });
//     getCircuitBreakersData(pagination.current, pagination.pageSize);
//   };

//   const rowSelection: TableProps<any>["rowSelection"] = {
//     type: "radio",
//     onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
//       setSelectedBreaker(selectedRows[0]);
//     },
//   };
//   useEffect(() => {
//     if (!dataLoading && incomerResponse) {
//       setTableData(incomerResponse);
//     }
//   }, [incomerResponse, dataLoading]);
//   const handleAddIncomer = async () => {
//     try {
//       const newIncomer = tableData?.find(
//         (el: any) => el.catalog === selectedBreaker?.catalog
//       );
//       if (newIncomer) {
//         const payload = {
//           incomer_data: [
//             ...incomers,
//             {
//               model_number: newIncomer.catalog,
//               manufacturer: makeComponents?.preferred_lv_switchgear,
//               rating: newIncomer.current_rating,
//               type: newIncomer.cb_type,
//               description: newIncomer?.description ?? "",
//               quantity: 1,
//             },
//           ],
//         };
//         const response = await updateData(
//           `${SLD_REVISIONS_API}/${sld_revision_id}`,
//           false,
//           payload
//         );
//         if (response) {
//           const lastModified = convertToFrappeDatetime(
//             new Date(response?.modified)
//           );
//           setLastModified(lastModified);
//         }
//         message.success("Incomer added!");
//         onClose();
//       }
//       setLoading(false);
//     } catch (error) {}
//   };
//   const handleClearSearch = async () => {
//     setTableData([]);
//     setSelectedBreaker(null);
//     setSearchModel("");
//     setSearchRating("");
//     setTableParams({
//       pagination: {
//         current: 1,
//         pageSize: 200,
//         total: 0,
//       },
//     });
//     getCircuitBreakersData();
//   };
//   useEffect(() => {
//   }, [tableData]);
//   const addIncomer = () => {};
//   useEffect(() => {
//     if (searchModel.length) {
//       const handler = setTimeout(() => {
//         getCircuitBreakersData();
//       }, 500);

//       return () => {
//         clearTimeout(handler);
//       };
//     }
//   }, [getCircuitBreakersData, searchModel]);
//   useEffect(() => {
//     if (searchRating.length) {
//       const handler = setTimeout(() => {
//         getCircuitBreakersData();
//       }, 500);

//       return () => {
//         clearTimeout(handler);
//       };
//     }
//   }, [getCircuitBreakersData, searchRating]);
//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       className="w-100 max-h-screen min-h-screen overflow-auto"
//     >
//       {dataLoading ? (
//         <div className="flex h-[550px] items-center justify-center">
//           <Spin size="large" />
//         </div>
//       ) : (
//         <>
//           <div className="flex flex-wrap items-center justify-start gap-4">
//             <p className="font-semibold text-blue-500">
//               Recommended Rating for Incomer (Ampere)
//             </p>
//             <p>{sg_data && getRatingForIncomer(sg_data, projectInfo)}</p>
//             <Button
//               type="primary"
//               disabled={!selectedBreaker}
//               onClick={handleAddIncomer}
//             >
//               Add Incomer
//             </Button>
//             <p className="font-semibold text-blue-500">Make</p>
//             <p>{makeComponents?.preferred_lv_switchgear}</p>
//             <p className="font-semibold text-blue-500">Device</p>
//             <p>{getDevice(sg_data, projectPanelData, projectInfo)}</p>
//           </div>
//           <Divider />

//           <div className="p-4">
//             <Space className="mb-4 w-full" direction="horizontal">
//               <Input
//                 placeholder="Search by Model Number"
//                 value={searchModel}
//                 onChange={(e) => setSearchModel(e.target.value)}
//                 className="w-64"
//               />
//               <Input
//                 placeholder="Search by Rating"
//                 value={searchRating}
//                 onChange={(e) => setSearchRating(e.target.value)}
//                 className="w-64"
//               />
//               <Button onClick={handleClearSearch}>
//                 {searchModel || searchRating ? "Clear Search" : "Search"}
//               </Button>
//             </Space>

//             <Table
//               rowSelection={rowSelection}
//               columns={columns}
//               dataSource={tableData}
//               loading={loading}
//               pagination={tableParams.pagination}
//               onChange={handleTableChange}
//               rowKey="name"
//               scroll={{ x: true }}
//             />
//           </div>
//         </>
//       )}
//     </Modal>
//   );
// };

// export default AddIncomer;

import { Button, Input, message, Space, Spin } from "antd";
import Modal from "@/components/Modal/Modal";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Divider, Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  CIRCUIT_BREAKER_API,
  GET_CB_COUNT,
  GET_SFU_COUNT,
  MAKE_OF_COMPONENT_API,
  MCC_PANEL,
  PCC_PANEL,
  PROJECT_INFO_API,
  SFU_API,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";
import { getData, updateData } from "@/actions/crud-actions";
import { useParams } from "next/navigation";
import { convertToFrappeDatetime } from "@/utils/helpers";

// Move helper functions outside component
const getRatingForIncomer = (sg_data: any, projectInfo: any) => {
  if (!sg_data) return 0;
  let totalWorkingKW = 0;
  let highestStandbyKW = 0;

  const supply_voltage = Number(projectInfo?.[0]?.main_supply_lv.split(" ")[0]);
  sg_data?.switchgear_selection_data?.forEach((item: any) => {
    totalWorkingKW += item.working_kw || 0;
    if (item.standby_kw > highestStandbyKW) {
      highestStandbyKW = item.standby_kw;
    }
  });
  const total_sum_kw = (totalWorkingKW + highestStandbyKW / 2) * 1000;
  const incomer_current = (total_sum_kw / (1.732 * supply_voltage * 0.8)) * 1.2;

  return incomer_current.toFixed(2);
};

const getDevice = (sg_data: any, projectPanelData: any, projectInfo: any) => {
  return Number(getRatingForIncomer(sg_data, projectInfo)) <=
    Number(projectPanelData?.incomer_ampere)
    ? projectPanelData?.incomer_type
    : projectPanelData?.incomer_above_type;
};

const getPoles = (sg_data: any, projectPanelData: any, projectInfo: any) => {
  return Number(getRatingForIncomer(sg_data, projectInfo)) <=
    Number(projectPanelData?.incomer_ampere)
    ? projectPanelData?.incomer_pole
    : projectPanelData?.incomer_above_pole;
};

export const getPanelDoctype = (name: string) => {
  switch (name) {
    case "MCC":
      return MCC_PANEL;
    case "PCC":
      return PCC_PANEL;
    default:
      return MCC_PANEL;
  }
};
interface FilterParams {
  device: string;
  preferredSwitchgear: string;
  poles: string;
  current_rating: string | number;
  searchModel?: string;
  searchRating?: string;
}

const buildFilters = ({
  device,
  preferredSwitchgear,
  poles,
  current_rating,
  searchModel,
  searchRating,
}: FilterParams) => {
  let filters = [];

  if (device === "SFU") {
    filters = [
      ["make", "=", preferredSwitchgear],
      ["pole", "like", `%${poles}%`],
      ["ampere", ">=", current_rating],
    ];

    if (searchModel) {
      filters.push(["sdf", "like", `%${searchModel}%`]);
    }

    if (searchRating) {
      // Replace the ampere filter with exact match
      filters = filters.filter((f) => f[0] !== "ampere");
      filters.push(["ampere", "=", searchRating]);
    }
  } else {
    filters = [
      ["manufacturer", "=", preferredSwitchgear],
      ["cb_type", "like", `%${poles}-POLE%`],
      ["type_int", "like", `%${device}%`],
      ["current_rating", ">=", current_rating],
    ];

    if (searchModel) {
      filters.push(["catalog", "like", `%${searchModel}%`]);
    }

    if (searchRating) {
      // Replace the current_rating filter with exact match
      filters = filters.filter((f) => f[0] !== "current_rating");
      filters.push(["current_rating", "=", searchRating]);
    }
  }

  return filters;
};

interface FetchParams {
  device: string;
  filters: any[];
  page: number;
  pageSize: number;
}

const fetchCircuitBreakerData = async ({
  device,
  filters,
  page,
  pageSize,
}: FetchParams) => {
  const limit_start = (page - 1) * pageSize;
  const encodedFilters = encodeURIComponent(JSON.stringify(filters));

  const url =
    device === "SFU"
      ? `${SFU_API}?fields=["*"]&filters=${encodedFilters}&limit_start=${limit_start}&limit=${pageSize}`
      : `${CIRCUIT_BREAKER_API}?fields=["*"]&filters=${encodedFilters}&limit_start=${limit_start}&limit=${pageSize}`;

  const count_url = device === "SFU" ? GET_SFU_COUNT : GET_CB_COUNT;

  const [response, total_count] = await Promise.all([
    getData(url),
    getData(count_url + `&filters=${JSON.stringify(filters)}`),
  ]);

  const formattedData =
    device === "SFU"
      ? response?.map((el: any, index: number) => ({
          id: `${el.sdf}-${index}`,
          catalog: el.sdf,
          current_rating: el.ampere,
          cb_type: el.pole,
          description: el.description,
          name: el.sdf,
        }))
      : response?.map((el: any, index: number) => ({
          ...el,
          id: `${el.catalog}-${index}`, // Add unique id
          name: el.catalog, // Add name field for rowKey
        }));
  console.log(formattedData);

  return {
    data: formattedData || [],
    total: total_count,
  };
};

// Custom hook for data fetching
const useDataFetching = (
  panelType: string,
  revision_id: string,
  panel_id: string,
  sld_revision_id: string,
  project_id: string
) => {
  const [state, setState] = useState<any>({
    isLoading: true,
    sg_data: null,
    makeComponents: null,
    incomerResponse: [],
    totalCountOfItems: 0,
    projectPanelData: null,
    projectInfo: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState((prev: any) => ({ ...prev, isLoading: true }));

      const [makeComponents, project_info, projectPanelData, sg_data] =
        await Promise.all([
          getData(
            `${MAKE_OF_COMPONENT_API}?fields=["preferred_lv_switchgear"]&filters=[["revision_id", "=", "${revision_id}"]]`
          ),
          getData(
            `${PROJECT_INFO_API}?fields=["main_supply_lv"]&filters=[["project_id", "=", "${project_id}"]]`
          ),
          getData(
            `${getPanelDoctype(
              panelType
            )}?fields=["*"]&filters=[["panel_id", "=", "${panel_id}"]]`
          ),
          getData(`${SLD_REVISIONS_API}/${sld_revision_id}`),
        ]);

      const preferredSwitchgear =
        makeComponents[0]?.preferred_lv_switchgear.toUpperCase();
      const pole =
        getPoles(sg_data, projectPanelData[0], project_info) + "-POLE";
      const device = getDevice(sg_data, projectPanelData[0], project_info);
      const current_rating = getRatingForIncomer(sg_data, project_info);

      const filters =
        device === "SFU"
          ? [
              ["make", "=", preferredSwitchgear],
              [
                "pole",
                "like",
                `%${getPoles(sg_data, projectPanelData[0], project_info)}%`,
              ],
              ["ampere", ">=", current_rating],
            ]
          : [
              ["manufacturer", "=", preferredSwitchgear],
              ["cb_type", "like", `%${pole}%`],
              ["type_int", "like", `%${device}%`],
              ["current_rating", ">=", current_rating],
            ];

      const url =
        device === "SFU"
          ? `${SFU_API}?fields=["*"]&filters=${JSON.stringify(
              filters
            )}&limit_start=0&limit=200`
          : `${CIRCUIT_BREAKER_API}?fields=["*"]&filters=${JSON.stringify(
              filters
            )}&limit_start=0&limit=200`;

      const [response, total_count] = await Promise.all([
        getData(url),
        getData(
          `${
            device === "SFU" ? GET_SFU_COUNT : GET_CB_COUNT
          }&filters=${JSON.stringify(filters)}`
        ),
      ]);

      const formattedResponse =
        device === "SFU"
          ? response?.map((el: any, index: number) => ({
              id: `${el.sdf}-${index}`,
              catalog: el.sdf,
              current_rating: el.ampere,
              cb_type: el.pole,
              description: el.description,
              name: el.sdf,
            }))
          : response?.map((el: any, index: number) => ({
              ...el,
              id: `${el.catalog}-${index}`,
              name: el.catalog,
            }));
      formattedResponse?.sort(
        (a: any, b: any) => a.current_rating - b.current_rating
      );
      console.log(formattedResponse);

      setState({
        isLoading: false,
        sg_data,
        makeComponents: makeComponents[0],
        incomerResponse: formattedResponse || [],
        totalCountOfItems: total_count,
        projectPanelData: projectPanelData[0],
        projectInfo: project_info,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
      setState((prev: any) => ({ ...prev, isLoading: false }));
    }
  }, [panelType, panel_id, revision_id, sld_revision_id, project_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
};
interface Props {
  isOpen: boolean;
  onClose: () => void;
  panelType: string;
  revision_id: string;
  panel_id: string;
  sld_revision_id: string;
  designBasisRevisionId: string;
  panelData: any;
  setLastModified: any;
  incomers: any;
}
const AddIncomer: React.FC<Props> = ({
  isOpen,
  onClose,
  panelType,
  revision_id,
  panel_id,
  sld_revision_id,
  setLastModified,
  incomers,
}) => {
  const params = useParams();
  const project_id = params.project_id as string;

  const {
    isLoading: dataLoading,
    sg_data,
    makeComponents,
    incomerResponse,
    totalCountOfItems,
    projectPanelData,
    projectInfo,
  } = useDataFetching(
    panelType,
    revision_id,
    panel_id,
    sld_revision_id,
    project_id
  );

  const [searchState, setSearchState] = useState({ model: "", rating: "" });
  const [tableState, setTableState] = useState<any>({
    data: incomerResponse,
    loading: false,
    selectedBreaker: null,
    pagination: {
      current: 1,
      pageSize: 200,
      total: totalCountOfItems,
    },
  });

  // Memoize columns definition
  const columns = useMemo<TableColumnsType<any>>(
    () => [
      {
        title: "Model Number",
        dataIndex: "catalog",
        key: "model",
        width: 20,
      },
      {
        title: "Rating",
        dataIndex: "current_rating",
        key: "current_rating",
        width: 20,
      },
      {
        title: "Type",
        dataIndex: "cb_type",
        key: "cb_type",
        width: 50,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
      },
    ],
    []
  );

  const getCircuitBreakersData = useCallback(
    async (page = 1, pageSize = 200) => {
      if (!makeComponents || !sg_data || !projectPanelData || !projectInfo)
        return;

      try {
        setTableState((prev: any) => ({ ...prev, loading: true }));
        const preferredSwitchgear =
          makeComponents.preferred_lv_switchgear.toUpperCase();
        const device = getDevice(sg_data, projectPanelData, projectInfo);
        const current_rating = getRatingForIncomer(sg_data, projectInfo);

        // Build filters based on search criteria
        const filters = buildFilters({
          device,
          preferredSwitchgear,
          poles: getPoles(sg_data, projectPanelData, projectInfo),
          current_rating,
          searchModel: searchState.model,
          searchRating: searchState.rating,
        });

        const response = await fetchCircuitBreakerData({
          device,
          filters,
          page,
          pageSize,
        });

        setTableState((prev: any) => ({
          ...prev,
          data: response.data,
          loading: false,
          pagination: {
            ...prev.pagination,
            total: response.total,
          },
        }));
      } catch (error) {
        console.error("Error fetching circuit breaker data:", error);
        message.error("Failed to load circuit breaker data");
        setTableState((prev: any) => ({ ...prev, loading: false }));
      }
    },
    [makeComponents, sg_data, projectPanelData, projectInfo, searchState]
  );

  // Update table data when incomer response changes
  useEffect(() => {
    if (!dataLoading && incomerResponse) {
      setTableState((prev: any) => ({ ...prev, data: incomerResponse }));
    }
  }, [incomerResponse, dataLoading]);

  // Handle search debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchState.model || searchState.rating) {
        getCircuitBreakersData();
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchState, getCircuitBreakersData]);

  const handleAddIncomer = async () => {
    if (!tableState.selectedBreaker) return;

    try {
      const newIncomer = tableState.data?.find(
        (el: any) => el.catalog === tableState.selectedBreaker?.catalog
      );

      if (newIncomer) {
        const response = await updateData(
          `${SLD_REVISIONS_API}/${sld_revision_id}`,
          false,
          {
            incomer_data: [
              ...incomers,
              {
                model_number: newIncomer.catalog,
                manufacturer: makeComponents?.preferred_lv_switchgear,
                rating: newIncomer.current_rating,
                type: newIncomer.cb_type,
                description: newIncomer?.description ?? "",
                quantity: 1,
              },
            ],
          }
        );

        if (response) {
          setLastModified(
            convertToFrappeDatetime(new Date(response?.modified))
          );
        }
        message.success("Incomer added!");
        onClose();
      }
    } catch (error) {
      console.error("Error adding incomer:", error);
      message.error("Failed to add incomer");
    }
  };

  const handleClearSearch = () => {
    setSearchState({ model: "", rating: "" });
    setTableState((prev: any) => ({
      ...prev,
      data: [],
      selectedBreaker: null,
      pagination: { ...prev.pagination, current: 1 },
    }));
    getCircuitBreakersData();
  };

  // const rowSelection = useMemo<TableProps<any>["rowSelection"]>(
  //   () => ({
  //     type: "radio",
  //     onChange: (_: React.Key[], selectedRows: any[]) => {
  //       setTableState((prev: any) => ({
  //         ...prev,
  //         selectedBreaker: selectedRows[0],
  //       }));
  //     },
  //   }),
  //   []
  // );
  const rowSelection = useMemo<TableProps<any>["rowSelection"]>(
    () => ({
      type: "radio",
      onChange: (_: React.Key[], selectedRows: any[]) => {
        setTableState((prev: any) => ({
          ...prev,
          selectedBreaker: selectedRows[0],
        }));
      },
      selectedRowKeys: tableState.selectedBreaker
        ? [tableState.selectedBreaker.id]
        : [],
    }),
    [tableState.selectedBreaker]
  );

  if (dataLoading) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="w-100 max-h-screen min-h-screen overflow-auto"
      >
        <div className="flex h-[550px] items-center justify-center">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-100 max-h-screen min-h-screen overflow-auto"
    >
      <div className="flex flex-wrap items-center justify-start gap-4">
        <p className="font-semibold text-blue-500">
          Recommended Rating for Incomer (Ampere)
        </p>
        <p>{sg_data && getRatingForIncomer(sg_data, projectInfo)}</p>
        <Button
          type="primary"
          disabled={!tableState.selectedBreaker}
          onClick={handleAddIncomer}
        >
          Add Incomer
        </Button>
        <p className="font-semibold text-blue-500">Make</p>
        <p>{makeComponents?.preferred_lv_switchgear}</p>
        <p className="font-semibold text-blue-500">Device</p>
        <p>{getDevice(sg_data, projectPanelData, projectInfo)}</p>
      </div>
      <Divider />

      <div className="p-4">
        <Space className="mb-4 w-full" direction="horizontal">
          <Input
            placeholder="Search by Model Number"
            value={searchState.model}
            onChange={(e) =>
              setSearchState((prev) => ({ ...prev, model: e.target.value }))
            }
            className="w-64"
          />
          <Input
            placeholder="Search by Rating"
            value={searchState.rating}
            onChange={(e) =>
              setSearchState((prev) => ({ ...prev, rating: e.target.value }))
            }
            className="w-64"
          />
          <Button onClick={handleClearSearch}>
            {searchState.model || searchState.rating
              ? "Clear Search"
              : "Search"}
          </Button>
        </Space>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tableState.data}
          loading={tableState.loading}
          pagination={tableState.pagination}
          onChange={(pagination) =>
            getCircuitBreakersData(pagination.current, pagination.pageSize)
          }
          rowKey="id"
          scroll={{ x: true }}
        />
      </div>
    </Modal>
  );
};

export default AddIncomer;
