"use client";
import jspreadsheet, {
  CellValue,
  JspreadsheetInstance,
  JspreadsheetInstanceElement,
} from "jspreadsheet-ce";
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import {
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  MAIN_SUPPLY_LV_API,
  MAKE_OF_COMPONENT_API,
  MOTOR_PARAMETER_API,
  PROJECT_API,
  PROJECT_INFO_API,
  PROJECT_MAIN_PKG_LIST_API,
} from "@/configs/api-endpoints";
import {
  downloadFrappeCloudFile,
  getData,
  updateData,
} from "@/actions/crud-actions";
import * as XLSX from "xlsx";
import { lazy, Suspense } from "react";
const ControlSchemeConfigurator = lazy(
  () => import("./Control Scheme Config/ControlSchemeConfig")
);
const LpbsConfigurator = lazy(() => import("./LPBS Config/LpbsConfigurator"));
const ValidatePanelLoad = lazy(
  () => import("./Validate Panel Load/ValidatePanelLoad")
);
import { getStarterList, LoadListcolumns } from "../common/ExcelColumns";
import "./LoadListComponent.css";
import { Button, message, Modal, Popconfirm, Spin } from "antd";
import { useProjectPanelData } from "@/hooks/useProjectPanelData";
import { useParams, useRouter } from "next/navigation";
import { useLoading } from "@/hooks/useLoading";
import {
  getCurrentCalculation,
  getFrameSizeCalculation,
  getMotorPartCode,
} from "@/actions/electrical-load-list";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ENVIRO,
  HEATING,
  WWS_IPG,
  WWS_SERVICES,
  WWS_SPG,
} from "@/configs/constants";
import { useGetData } from "@/hooks/useCRUD";
import TableFilter from "../common/TabelFilter";
import { convertToFrappeDatetime } from "@/utils/helpers";

export const getStandByKw = (item2: any, item3: any) => {
  if (item2 == 0) {
    return Number(item3);
  } else {
    return Number(item2);
  }
};
type ValidColumnType =
  | "text"
  | "dropdown"
  | "checkbox"
  | "html"
  | "image"
  | "numeric"
  | "hidden"
  | "autocomplete"
  | "radio"
  | "calendar"
  | "color";

interface PanelSumData {
  panelName: string;
  workingLoadSum: number;
  standbyLoadSum: number;
  totalLoadKw: number;
  totalCurrent: number;
}

interface LoadListProps {
  revision: number;
  designBasisRevisionId: string;
  loadListLatestRevisionId: any;
}

const useDataFetching = (
  designBasisRevisionId: string,
  loadListLatestRevisionId: string,
  project_id: string
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadListData, setLoadListData] = useState<any>(null);
  const [motorParameters, setMotorParameters] = useState<any[]>([]);

  const [commonConfigurationData, setCommonConfigurationData] = useState<any[]>(
    []
  );
  const [makeOfComponent, setMakeOfComponent] = useState<any[]>([]);
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [mainSupplyLV, setMainSupplyLV] = useState<string[]>([]);
  const [subPackages, setSubPackages] = useState<any[]>([]);
  const { data: projectPanelData } = useProjectPanelData(designBasisRevisionId);

  const fetchAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const commonConfigData1 = await getData(
        `${COMMON_CONFIGURATION_1}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const commonConfigData2 = await getData(
        `${COMMON_CONFIGURATION_2}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );

      const commonConfigData3 = await getData(
        `${COMMON_CONFIGURATION_3}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );

      const commonConfig = [
        {
          ...commonConfigData1?.[0],
          ...commonConfigData2?.[0],
          ...commonConfigData3?.[0],
        },
      ];

      const [
        loadList,
        motorParams,
        makeComponent,
        projInfo,
        mainSupply,
        mainPkgData,
      ] = await Promise.all([
        getData(
          `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
        ),
        getData(
          `${MOTOR_PARAMETER_API}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
        ),
        getData(
          `${MAKE_OF_COMPONENT_API}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
        ),
        getData(
          `${PROJECT_INFO_API}?fields=["main_supply_lv"]&filters=[["project_id", "=", "${project_id}"]]`
        ),
        getData(`${MAIN_SUPPLY_LV_API}?fields=["voltage"]`),
        getData(
          `${PROJECT_MAIN_PKG_LIST_API}?revision_id=${designBasisRevisionId}`
        ),
      ]);

      setLoadListData(loadList);
      setMotorParameters(motorParams);
      setCommonConfigurationData(commonConfig);

      setMakeOfComponent(makeComponent);
      setProjectInfo(projInfo[0]);
      setMainSupplyLV(mainSupply.map((item: any) => item.voltage));
      setSubPackages(mainPkgData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [designBasisRevisionId, loadListLatestRevisionId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    isLoading,
    loadListData,
    motorParameters,
    commonConfigurationData,
    makeOfComponent,
    projectPanelData,
    projectInfo,
    mainSupplyLV,
    subPackages,
    refetch: fetchAllData,
  };
};
const LoadList: React.FC<LoadListProps> = ({
  designBasisRevisionId,
  loadListLatestRevisionId,
  revision,
}) => {
  const jRef = useRef<HTMLDivElement | null>(null);
  const spreadsheetRef = useRef<JspreadsheetInstance | null>(null);
  const [isCurrentFetched, setIsCurrentFetched] = useState(false);
  const params = useParams();
  const router = useRouter();

  const userInfo: {
    division: string;
  } = useCurrentUser();

  const project_id = params.project_id as string;
  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);

  const userDivision = userInfo?.division;

  const projectDivision = projectData?.division;

  const {
    isLoading,
    loadListData,
    motorParameters,
    makeOfComponent,
    commonConfigurationData,
    projectPanelData,
    projectInfo,
    mainSupplyLV,
    subPackages,
    refetch,
  } = useDataFetching(
    designBasisRevisionId,
    loadListLatestRevisionId,
    project_id
  );
  const panelList = useMemo(
    () => projectPanelData?.map((item: any) => item.panel_name) || [],
    [projectPanelData]
  );
  const [isFilterAppllied, setIsFilterAppllied] = useState(false);

  const [panelsSumData, setPanelsSumData] = useState<PanelSumData[]>([]);
  const [isControlSchemeModalOpen, setIsControlSchemeModalOpen] =
    useState(false);
  const [isLPBSModalOpen, setIsLPBSModalOpen] = useState(false);
  const [isValidatePanelLoadOpen, setIsValidatePanelLoadOpen] = useState(false);
  const { setLoading } = useLoading();
  const filterConfig: any[] = [
    {
      key: "working_kw",
      label: "kW (working)",
      type: "input",
      placeholder: "Search by working kw",
    },
    {
      key: "standby_kw",
      label: "kW (standby)",
      type: "input",
      placeholder: "Search by standby kw",
    },
    {
      key: "starter_type",
      label: "Starter Type",
      type: "select",
      options: getStarterList().map((item: any) => {
        return {
          value: item,
          name: item,
          label: item,
        };
      }),
      placeholder: "Search by starter type",
    },
    {
      key: "eocr",
      label: "EOCR",
      type: "select",
      options: ["Yes", "No"].map((item: any) => {
        return {
          value: item,
          name: item,
          label: item,
        };
      }),
      placeholder: "Search by eocr",
    },
    {
      key: "panel",
      label: "Panel",
      type: "select",
      options: panelList.map((item: any) => {
        return {
          value: item,
          name: item,
          label: item,
        };
      }),
      placeholder: "Search by panel",
    },
  ];
  const getColumnIndex = useCallback(
    (key: string) => {
      const columnMap: { [key: string]: number } = {
        tag_number: 0,
        service_description: 1,
        working_kw: 2,
        standby_kw: 3,
        starter_type: projectDivision === ENVIRO ? 5 : 4,
        lpbs_type: projectDivision === HEATING ? 9 : 100,
        control_scheme: projectDivision === HEATING ? 10 : 100,
        eocr: projectDivision === ENVIRO || projectDivision === HEATING ? 8 : 7,
        panel:
          projectDivision === ENVIRO
            ? 11
            : projectDivision === HEATING
            ? 11
            : 10,
        supply_voltage: projectDivision === ENVIRO ? 6 : 5,
        motor_rated_current:
          projectDivision === HEATING
            ? 30
            : projectDivision === ENVIRO
            ? 41
            : 40,
        phase: projectDivision === ENVIRO ? 7 : 6,
        power_factor:
          projectDivision === HEATING
            ? 24
            : projectDivision === ENVIRO
            ? 33
            : 32,
        motor_rpm: projectDivision === ENVIRO ? 13 : 12,
        motor_mounting_type: projectDivision === ENVIRO ? 14 : 13,
        motor_make: projectDivision === ENVIRO ? 37 : 36,
        motor_frame_size: projectDivision === ENVIRO ? 15 : 14,
        motor_part_code: projectDivision === ENVIRO ? 40 : 39,

        panel_ammeter:
          projectDivision === HEATING
            ? 27
            : projectDivision === ENVIRO
            ? 36
            : 35,
        package:
          projectDivision === HEATING
            ? 12
            : projectDivision === ENVIRO
            ? 20
            : 19,
        area:
          projectDivision === HEATING
            ? 13
            : projectDivision === ENVIRO
            ? 21
            : 20,
        standard:
          projectDivision === HEATING
            ? 14
            : projectDivision === ENVIRO
            ? 22
            : 21,
        zone:
          projectDivision === HEATING
            ? 15
            : projectDivision === ENVIRO
            ? 23
            : 22,
        gas_group:
          projectDivision === HEATING
            ? 16
            : projectDivision === ENVIRO
            ? 24
            : 23,
        temperature_class:
          projectDivision === HEATING
            ? 17
            : projectDivision === ENVIRO
            ? 25
            : 24,
        motor_efficiency:
          projectDivision === HEATING
            ? 25
            : projectDivision === ENVIRO
            ? 34
            : 33,
        space_heater:
          projectDivision === HEATING
            ? 20
            : projectDivision === ENVIRO
            ? 28
            : 27,
        bearing_rtd:
          projectDivision === HEATING
            ? 21
            : projectDivision === ENVIRO
            ? 29
            : 28,
        wiring_rtd:
          projectDivision === HEATING
            ? 22
            : projectDivision === ENVIRO
            ? 30
            : 29,
        thermistor:
          projectDivision === HEATING
            ? 23
            : projectDivision === ENVIRO
            ? 31
            : 30,
      };
      return columnMap[key] ?? -1;
    },
    [projectDivision]
  );

  const handleFilter = useCallback(
    (values: any) => {
      console.log(values);

      let filtered: any;
      const isEmpty = Object.keys(values).length === 0;
      if (isEmpty) {
        const getdata = async () => {
          try {
            setLoading(true);
            const res = await getData(
              `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
            );
            const filteredData = spreadsheetRef?.current?.getData();
            const originalData = getArrayOfLoadListData(res, revision);
            const final = originalData.map((element: any) => {
              const found = filteredData?.find(
                (el: any) => el[0] === element[0]
              );
              if (found) {
                return found;
              } else {
                return element;
              }
            });
            spreadsheetRef?.current?.setData(final);
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
        getdata();
      } else {
        filtered = spreadsheetRef?.current?.getData();
      }
      if (filtered) {
        Object.entries(values).forEach(([key, value]) => {
          if (value) {
            const columnIndex = getColumnIndex(key);
            if (columnIndex === -1) {
              console.warn(`No column mapping found for key: ${key}`);
              return;
            }

            filtered = filtered?.filter((item: any) => {
              const itemValue = item[columnIndex];
              if (itemValue === undefined) {
                console.warn(
                  `No value found at index ${columnIndex} for item`,
                  item
                );
                return true;
              }
              function convertToNumber(value: any) {
                const num = Number(value); // Convert string to number
                return isNaN(num)
                  ? { value, type: typeof value }
                  : { value: num, type: typeof num };
              }
              console.log(itemValue);
              console.log(convertToNumber(value));
              console.log(convertToNumber(value).type === "number");

              if (convertToNumber(value).type === "string") {
                return itemValue
                  .toString()
                  .toLowerCase()
                  .includes(convertToNumber(value).value.toLowerCase());
              }
              if (convertToNumber(value).type === "number") {
                return itemValue === convertToNumber(value).value;
              }
            });
            setIsFilterAppllied(true);
          }
        });
      }
      if (spreadsheetRef?.current) {
        spreadsheetRef?.current?.setData(filtered);
      }
      if (isEmpty) {
        setIsFilterAppllied(false);
      }
    },
    [spreadsheetRef, getColumnIndex] // Add any other dependencies used in this function
  );
  const handleCellChange = (
    element: JspreadsheetInstanceElement,
    cell: HTMLTableCellElement,
    colIndex: string | number,
    rowIndex: string | number,
    newValue: CellValue
  ) => {
    const data: any = spreadsheetRef?.current?.getData() || [];
    if (projectDivision === HEATING) {
      let isHazardousPackage = false;
      if (Number(colIndex) === getColumnIndex("control_scheme")) {
        const lpbs_data = JSON.parse(
          localStorage.getItem("control_schemes_lpbs") as string
        );
        const lpbs_scheme = lpbs_data?.find(
          (item: any) => item.control_scheme === newValue
        );
        if (lpbs_scheme) {
          data[rowIndex][getColumnIndex("lpbs_type")] = lpbs_scheme?.lpbs_type;
        } else if (newValue === "NA") {
          data[rowIndex][getColumnIndex("lpbs_type")] = "NA";
        }
      }
      if (colIndex === "12") {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) => item.sub_package_name == newValue
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              data[rowIndex][13] = "Hazardous";
              data[rowIndex][14] = pckg?.standard;
              data[rowIndex][15] = pckg?.zone;
              data[rowIndex][16] = pckg?.gas_group;
              data[rowIndex][17] = pckg?.temperature_class;
              data[rowIndex][25] =
                motorParameters[0]?.hazardous_area_efficiency_level;
            } else {
              data[rowIndex][13] = "Safe";
              data[rowIndex][14] = "NA";
              data[rowIndex][15] = "NA";
              data[rowIndex][16] = "NA";
              data[rowIndex][17] = "NA";
              data[rowIndex][25] =
                motorParameters[0]?.safe_area_efficiency_level;
            }
          }
        });
      }
      if (colIndex == "12") {
        if (data[rowIndex][12] === "NA" || newValue === "NA") {
          data[rowIndex][13] = "NA";
          data[rowIndex][14] = "NA";
          data[rowIndex][15] = "NA";
          data[rowIndex][16] = "NA";
          data[rowIndex][17] = "NA";
          data[rowIndex][25] = motorParameters[0]?.safe_area_efficiency_level;
        }
      }

      if (Number(colIndex) === getColumnIndex("starter_type")) {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) =>
              item.sub_package_name == data[rowIndex][getColumnIndex("package")]
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              isHazardousPackage = true;
            }
          }
        });

        if (newValue === "DOL-HTR") {
          data[rowIndex][getColumnIndex("power_factor")] = "1";
        }
        if (newValue === "SUPPLY FEEDER" || newValue === "DOL-HTR") {
          data[rowIndex][getColumnIndex("space_heater")] = "No";
          data[rowIndex][getColumnIndex("bearing_rtd")] = "No";
          data[rowIndex][getColumnIndex("wiring_rtd")] = "No";
          data[rowIndex][getColumnIndex("thermistor")] = "No";
        } else {
          const space_heater_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_space_heater
            : motorParameters[0]?.safe_area_space_heater;
          data[rowIndex][getColumnIndex("space_heater")] =
            space_heater_criteria === "As per OEM Standard"
              ? "As per OEM Standard"
              : space_heater_criteria === "All"
              ? "Yes"
              : space_heater_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(space_heater_criteria)
              ? "Yes"
              : "No";

          const bearing_rtd_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_bearing_rtd
            : motorParameters[0]?.safe_area_bearing_rtd;
          data[rowIndex][getColumnIndex("bearing_rtd")] =
            bearing_rtd_criteria === "All"
              ? "Yes"
              : bearing_rtd_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(bearing_rtd_criteria)
              ? "Yes"
              : "No";

          const winding_rtd_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_winding_rtd
            : motorParameters[0]?.safe_area_winding_rtd;
          data[rowIndex][getColumnIndex("wiring_rtd")] =
            winding_rtd_criteria === "All"
              ? "Yes"
              : winding_rtd_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(winding_rtd_criteria)
              ? "Yes"
              : "No";
          const thermister_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_thermister
            : motorParameters[0]?.safe_area_thermister;

          data[rowIndex][getColumnIndex("thermistor")] =
            getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
            Number(thermister_criteria)
              ? "Yes"
              : "No";
        }
      }
    }
    if (
      projectDivision === WWS_SPG ||
      projectDivision === WWS_IPG ||
      projectDivision === WWS_SERVICES
    ) {
      let isHazardousPackage = false;
      if (colIndex === "19") {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) => item.sub_package_name == newValue
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              data[rowIndex][getColumnIndex("area")] = "Hazardous";
              data[rowIndex][getColumnIndex("standard")] = pckg?.standard;
              data[rowIndex][getColumnIndex("zone")] = pckg?.zone;
              data[rowIndex][getColumnIndex("gas_group")] = pckg?.gas_group;
              data[rowIndex][getColumnIndex("temperature_class")] =
                pckg?.temperature_class;
              data[rowIndex][getColumnIndex("motor_efficiency")] =
                motorParameters[0]?.hazardous_area_efficiency_level;
              isHazardousPackage = true;
            } else {
              data[rowIndex][getColumnIndex("area")] = "Safe";
              data[rowIndex][getColumnIndex("standard")] = "NA";
              data[rowIndex][getColumnIndex("zone")] = "NA";
              data[rowIndex][getColumnIndex("gas_group")] = "NA";
              data[rowIndex][getColumnIndex("temperature_class")] = "NA";
              data[rowIndex][getColumnIndex("motor_efficiency")] =
                motorParameters[0]?.safe_area_efficiency_level;
            }
          }
        });
      }
      if (colIndex == "19") {
        if (
          data[rowIndex][getColumnIndex("package")] === "NA" ||
          newValue === "NA"
        ) {
          data[rowIndex][getColumnIndex("area")] = "NA";
          data[rowIndex][getColumnIndex("standard")] = "NA";
          data[rowIndex][getColumnIndex("zone")] = "NA";
          data[rowIndex][getColumnIndex("gas_group")] = "NA";
          data[rowIndex][getColumnIndex("temperature_class")] = "NA";
        }
      }

      if (Number(colIndex) === getColumnIndex("starter_type")) {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) =>
              item.sub_package_name == data[rowIndex][getColumnIndex("package")]
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              isHazardousPackage = true;
            }
          }
        });
        if (newValue === "DOL-HTR") {
          data[rowIndex][getColumnIndex("power_factor")] = "1";
        }

        if (newValue === "SUPPLY FEEDER" || newValue === "DOL-HTR") {
          data[rowIndex][getColumnIndex("space_heater")] = "No";
          data[rowIndex][getColumnIndex("bearing_rtd")] = "No";
          data[rowIndex][getColumnIndex("wiring_rtd")] = "No";
          data[rowIndex][getColumnIndex("thermistor")] = "No";
        } else {
          const space_heater_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_space_heater
            : motorParameters[0]?.safe_area_space_heater;
          data[rowIndex][getColumnIndex("space_heater")] =
            space_heater_criteria === "As per OEM Standard"
              ? "As per OEM Standard"
              : space_heater_criteria === "All"
              ? "Yes"
              : space_heater_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(space_heater_criteria)
              ? "Yes"
              : "No";

          const bearing_rtd_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_bearing_rtd
            : motorParameters[0]?.safe_area_bearing_rtd;
          data[rowIndex][getColumnIndex("bearing_rtd")] =
            bearing_rtd_criteria === "All"
              ? "Yes"
              : bearing_rtd_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(bearing_rtd_criteria)
              ? "Yes"
              : "No";

          const winding_rtd_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_winding_rtd
            : motorParameters[0]?.safe_area_winding_rtd;
          data[rowIndex][getColumnIndex("wiring_rtd")] =
            winding_rtd_criteria === "All"
              ? "Yes"
              : winding_rtd_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(winding_rtd_criteria)
              ? "Yes"
              : "No";
          const thermister_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_thermister
            : motorParameters[0]?.safe_area_thermister;
          data[rowIndex][getColumnIndex("thermistor")] =
            getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
            Number(thermister_criteria)
              ? "Yes"
              : "No";
        }
      }
    }
    if (projectDivision === ENVIRO) {
      let isHazardousPackage = false;

      if (Number(colIndex) === getColumnIndex("package")) {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) => item.sub_package_name == newValue
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              data[rowIndex][getColumnIndex("area")] = "Hazardous";
              data[rowIndex][getColumnIndex("standard")] = pckg?.standard;
              data[rowIndex][getColumnIndex("zone")] = pckg?.zone;
              data[rowIndex][getColumnIndex("gas_group")] = pckg?.gas_group;
              data[rowIndex][getColumnIndex("temperature_class")] =
                pckg?.temperature_class;
              data[rowIndex][getColumnIndex("motor_efficiency")] =
                motorParameters[0]?.hazardous_area_efficiency_level;
              isHazardousPackage = true;
            } else {
              data[rowIndex][getColumnIndex("area")] = "Safe";
              data[rowIndex][getColumnIndex("standard")] = "NA";
              data[rowIndex][getColumnIndex("zone")] = "NA";
              data[rowIndex][getColumnIndex("gas_group")] = "NA";
              data[rowIndex][getColumnIndex("temperature_class")] = "NA";
              data[rowIndex][getColumnIndex("motor_efficiency")] =
                motorParameters[0]?.safe_area_efficiency_level;
            }
          }
        });
      }
      if (colIndex == "20") {
        if (data[rowIndex][20] === "NA" || newValue === "NA") {
          data[rowIndex][21] = "NA";
          data[rowIndex][22] = "NA";
          data[rowIndex][23] = "NA";
          data[rowIndex][24] = "NA";
          data[rowIndex][25] = "NA";
        }
      }

      if (colIndex == "13") {
        if (newValue === "0") {
          data[rowIndex][14] = "NA";
          data[rowIndex][15] = "NA";
        }
      }

      if (Number(colIndex) === getColumnIndex("starter_type")) {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) =>
              item.sub_package_name == data[rowIndex][getColumnIndex("package")]
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              isHazardousPackage = true;
            }
          }
        });
        if (newValue === "DOL-HTR") {
          data[rowIndex][getColumnIndex("power_factor")] = "1";
        }
        if (newValue === "SUPPLY FEEDER" || newValue === "DOL-HTR") {
          data[rowIndex][getColumnIndex("space_heater")] = "No";
          data[rowIndex][getColumnIndex("bearing_rtd")] = "No";
          data[rowIndex][getColumnIndex("wiring_rtd")] = "No";
          data[rowIndex][getColumnIndex("thermistor")] = "No";
        } else {
          const space_heater_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_space_heater
            : motorParameters[0]?.safe_area_space_heater;

          data[rowIndex][getColumnIndex("space_heater")] =
            space_heater_criteria === "As per OEM Standard"
              ? "As per OEM Standard"
              : space_heater_criteria === "All"
              ? "Yes"
              : space_heater_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(space_heater_criteria)
              ? "Yes"
              : "No";

          const bearing_rtd_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_bearing_rtd
            : motorParameters[0]?.safe_area_bearing_rtd;

          data[rowIndex][getColumnIndex("bearing_rtd")] =
            bearing_rtd_criteria === "All"
              ? "Yes"
              : bearing_rtd_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(bearing_rtd_criteria)
              ? "Yes"
              : "No";

          const winding_rtd_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_winding_rtd
            : motorParameters[0]?.safe_area_winding_rtd;
          data[rowIndex][getColumnIndex("wiring_rtd")] =
            winding_rtd_criteria === "All"
              ? "Yes"
              : winding_rtd_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(winding_rtd_criteria)
              ? "Yes"
              : "No";
          const thermister_criteria = isHazardousPackage
            ? motorParameters[0]?.hazardous_area_thermister
            : motorParameters[0]?.safe_area_thermister;

          data[rowIndex][getColumnIndex("thermistor")] =
            thermister_criteria === "As per OEM Standard"
              ? "As per OEM Standard"
              : thermister_criteria === "All"
              ? "Yes"
              : thermister_criteria === "No"
              ? "No"
              : getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
                Number(thermister_criteria)
              ? "Yes"
              : "No";
        }
      }
    }
    spreadsheetRef?.current?.setData(data);
  };
  const typedLoadListColumns = useMemo(
    () =>
      LoadListcolumns(projectDivision).map((column) => ({
        ...column,
        type: column.type as ValidColumnType,
      })),
    [projectDivision]
  );
  const getArrayOfLoadListData = (data: any, revision?: any) => {
    return data?.electrical_load_list_data?.map((item: any) => {
      const result = [
        item.tag_number,
        item.service_description,
        item.working_kw,
        item.standby_kw,
        item.starter_type,
        item.supply_voltage + ` VAC`,
        item.phase,
        item.eocr_applicable,
        item.lpbs_type,
        item.control_scheme,
        item.panel,
        item.package,
        item.area,
        item.standard,
        item.zone,
        item.gas_group,
        item.temperature_class,
        item.remark,
        "R" + revision,
        item.space_heater,
        item.bearing_rtd,
        item.wiring_rtd,
        item.thermistor,
        item.power_factor,
        item.motor_efficiency,
        item.local_isolator,
        item.panel_ammeter,
        item.motor_scope,
        item.motor_location,
        item.motor_rated_current,
      ];
      if (projectDivision === ENVIRO) {
        result.splice(4, 0, item.kva);
      }
      if (projectDivision === HEATING) {
        result.splice(7, 0, item.starting_time);
      }
      if (projectDivision === ENVIRO) {
        result.splice(
          12,
          0,
          item.bus_segregation,
          item.motor_rpm,
          item.motor_rpm != 0 ? item.motor_mounting_type : "NA",
          item.motor_rpm != 0 ? item.motor_frame_size : "NA",
          item.motor_gd2,
          item.motor_driven_equipment_gd2,
          item.bkw,
          item.coupling_type
        );
        result.splice(32, 0, item.bearing_type);
        result.splice(37, 0, item.motor_make);
        result.splice(40, 0, item.motor_part_code);
      }
      if (
        projectDivision === WWS_IPG ||
        projectDivision === WWS_SPG ||
        projectDivision === WWS_SERVICES
      ) {
        result.splice(
          11,
          0,
          item.bus_segregation,
          item.motor_rpm,
          item.motor_rpm != 0 ? item.motor_mounting_type : "NA",
          item.motor_rpm != 0 ? item.motor_frame_size : "NA",
          item.motor_gd2,
          item.motor_driven_equipment_gd2,
          item.bkw,
          item.coupling_type
        );
        result.splice(31, 0, item.bearing_type);
        result.splice(36, 0, item.motor_make);
        result.splice(39, 0, item.motor_part_code);
      }

      return result;
    });
  };

  const loadListOptions = useMemo(
    () => ({
      data: getArrayOfLoadListData(loadListData, revision),
      columns: typedLoadListColumns,
      columnSorting: true,
      // columnDrag: true,\
      freezeRowControl: true,
      freezeColumnControl: true,
      columnResize: true,
      tableOverflow: true,
      onchange: handleCellChange,
      lazyLoading: true,
      loadingSpin: true,
      tableWidth: "100%",
      tableHeight: "440px",
      freezeColumns: 6,
      rowResize: true,
    }),
    [typedLoadListColumns, loadListData]
  );

  const getSelectedSchemes = () => {
    if (loadListData?.electrical_load_list_data?.length) {
      const getSchemes = loadListData?.electrical_load_list_data?.map(
        (item: any) => item.control_scheme
      );
      return getSchemes?.filter((item: any) => item != "");
    } else {
      return [];
    }
  };
  const getSelectedLpbsSchemes = () => {
    if (loadListData?.electrical_load_list_data?.length) {
      const getSchemes = loadListData?.electrical_load_list_data?.map(
        (item: any) => item.lpbs_type
      );
      return getSchemes?.filter((item: any) => item != "");
    } else {
      return [];
    }
  };

  useEffect(() => {
    if (loadListData) {
      let selectedControlSchemeItems: string[] = [];
      let selectedLpbsItems: string[] = [];

      const storedSchemes = localStorage.getItem("selected_control_scheme");
      if (storedSchemes) {
        selectedControlSchemeItems = JSON.parse(storedSchemes) as string[];
      } else {
        const getSchemes = loadListData?.electrical_load_list_data?.map(
          (item: any) => item.control_scheme
        );
        const getLpbsSchemes = loadListData?.electrical_load_list_data?.map(
          (item: any) => item.lpbs_type
        );
        selectedControlSchemeItems = getSchemes?.filter(
          (item: any) => item != "" || item != "NA"
        );
        selectedLpbsItems = getLpbsSchemes?.filter(
          (item: any) => item != "" || item != "NA"
        );
      }
      typedLoadListColumns.forEach((column) => {
        if (column.name === "controlScheme") {
          column.source = [
            ...new Set(
              selectedControlSchemeItems.filter(
                (item: any) => item != "NA" && item != ""
              )
            ),
            "NA",
          ];
        }
        if (column.name === "lbpsType") {
          column.source = [
            ...new Set(
              selectedLpbsItems.filter(
                (item: any) => item != "NA" && item != ""
              )
            ),
            "NA",
          ];
        }
      });
    }
  }, [loadListData]);

  useEffect(() => {
    if (subPackages?.length) {
      typedLoadListColumns.forEach((column) => {
        if (column.name === "pkg") {
          console.log(subPackages, "vishal");

          column.source = [
            ...subPackages
              ?.map((pkg: any) => pkg.sub_packages)
              .flat()
              .filter((item: any) => item.is_sub_package_selected === 1)
              .map((item: any) => item.sub_package_name),
            "NA",
          ];
        }
      });
    } else {
      typedLoadListColumns.forEach((column) => {
        if (column.name === "pkg") {
          column.source = ["NA"];
        }
      });
    }

    if (panelList.length) {
      typedLoadListColumns.forEach((column) => {
        if (column.name === "panelList") {
          column.source = panelList;
        }
      });
    }
    if (mainSupplyLV.length) {
      typedLoadListColumns.forEach((column) => {
        if (column.name === "supplyVoltage") {
          column.source = ["110 VAC", "230 VAC", ...mainSupplyLV];
        }
      });
    }
  }, [mainSupplyLV, panelList, subPackages]);
  useEffect(() => {
    if (
      !isLoading &&
      loadListData &&
      panelList.length > 0 &&
      mainSupplyLV.length &&
      jRef.current
    ) {
      if (spreadsheetRef.current) {
        spreadsheetRef.current.destroy();
      }

      const instance = jspreadsheet(jRef.current, loadListOptions);
      spreadsheetRef.current = instance;
    }
  }, [
    isLoading,
    loadListData,
    typedLoadListColumns,
    loadListOptions,
    panelList,
  ]);
  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" tip="Loading load list data..." />
      </div>
    );
  }

  const handleControlSchemeComplete = (selectedSchemes: string[]) => {
    typedLoadListColumns.forEach((column) => {
      if (column.name === "controlScheme") {
        column.source = selectedSchemes;
        if (spreadsheetRef.current) {
          spreadsheetRef.current.destroy();
        }
        if (jRef.current) {
          const instance = jspreadsheet(jRef.current, loadListOptions);
          spreadsheetRef.current = instance;
        }
      }
    });
  };
  const handleLpbsComplete = (selectedSchemes: string[]) => {
    typedLoadListColumns.forEach((column) => {
      if (column.name === "lbpsType") {
        column.source = selectedSchemes;
        if (spreadsheetRef.current) {
          spreadsheetRef.current.destroy();
        }
        if (jRef.current) {
          const instance = jspreadsheet(jRef.current, loadListOptions);
          spreadsheetRef.current = instance;
        }
      }
    });
  };
  const exportSpreadsheet = (jexcelElement: any, format = "csv") => {
    const headers: any = [];
    const headerCells = jexcelElement.getHeaders().split(",");
    headerCells.forEach((header: any) => {
      headers.push(header.trim());
    });

    const data = jexcelElement.getData();
    const colWidths = [];
    for (let i = 0; i < headers.length; i++) {
      const width = jexcelElement.getWidth(i);
      colWidths.push(width);
    }
    if (format === "csv") {
      let csvContent = headers.join(",") + "\n";

      data.forEach((row: any) => {
        csvContent += row.join(",") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      if (typeof XLSX === "undefined") {
        console.error(
          "XLSX library not loaded. Please include SheetJS library."
        );
        return;
      }

      const workbookData = [headers, ...data];

      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(workbookData);
      ws["!cols"] = colWidths.map((width) => ({
        // Convert pixel width to Excel column width (approximate conversion)
        wch: Math.floor(width / 7), // 7 pixels per character width (approximate)
      }));
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Generate and download Excel file
      XLSX.writeFile(wb, `Current Data ${projectData.project_oc_number}.xlsx`);
    }
  };
  console.log(loadListLatestRevisionId, "loadListLatestRevisionId");

  const downloadCurrentData = () => {
    if (spreadsheetRef?.current) {
      exportSpreadsheet(spreadsheetRef?.current, "excel");
    }
  };
  const validateUniqueFeederTag = () => {
    if (!spreadsheetRef) {
      console.warn("Spreadsheet instance is not available.");
      return false;
    }

    const firstColumnData = spreadsheetRef?.current?.getColumnData(0) || [];
    const duplicateValues: { [key: string]: number[] } = {};
    let isDuplicate = false;

    // Reset background color for all cells in column A
    firstColumnData.forEach((value: any, index: number) => {
      const cellAddress = `A${index + 1}`;
      spreadsheetRef?.current?.setStyle(
        cellAddress,
        "background-color",
        "white"
      );
    });

    // Find duplicate values and store their row indices
    firstColumnData.forEach((value: any, index: number) => {
      if (!value) return;

      const cellValue = String(value);

      if (cellValue in duplicateValues) {
        duplicateValues[cellValue]?.push(index);
        isDuplicate = true;
      } else {
        duplicateValues[cellValue] = [index];
      }
    });

    // Highlight cells containing duplicate values in red
    Object.entries(duplicateValues).forEach(([, indices]) => {
      if (indices.length > 1) {
        indices.forEach((rowIndex) => {
          const cellAddress = `A${rowIndex + 1}`;
          spreadsheetRef?.current?.setStyle(
            cellAddress,
            "background-color",
            "red"
          );
        });
      }
    });

    return isDuplicate;
  };

  const validateLoadValues = () => {
    const rows = spreadsheetRef?.current?.getData() || [];
    let isInvalid = false;

    rows.forEach((row, rowIndex) => {
      let greaterThanZeroCount = 0;
      let allZero = true;

      const lastIndex = projectDivision === ENVIRO ? 4 : 3;
      for (let colIndex = 2; colIndex <= lastIndex; colIndex++) {
        const cellValue = parseFloat((row[colIndex] as string) || "0");

        if (cellValue > 0) {
          greaterThanZeroCount++;
          allZero = false;
        }

        // Reset background color
        const cellAddress = `${String.fromCharCode(65 + colIndex)}${
          rowIndex + 1
        }`;
        spreadsheetRef?.current?.setStyle(
          cellAddress,
          "background-color",
          "white"
        );
      }
      if (greaterThanZeroCount > 1 || allZero) {
        isInvalid = true;
        for (let colIndex = 2; colIndex <= lastIndex; colIndex++) {
          const cellAddress = `${String.fromCharCode(65 + colIndex)}${
            rowIndex + 1
          }`;
          spreadsheetRef?.current?.setStyle(
            cellAddress,
            "background-color",
            "yellow"
          );
        }
      }
    });

    return isInvalid;
  };

  const handleLoadListSave = async () => {
    setLoading(true);
    if (validateLoadValues()) {
      setLoading(false);

      return message.error("KW should be in one column only");
    }
    if (validateUniqueFeederTag()) {
      setLoading(false);
      return message.error("Feeder tag no. can not be repeated");
    }

    const payload = {
      electrical_load_list_data: spreadsheetRef?.current
        ?.getData()
        .map((row: any) => {
          if (projectDivision === HEATING) {
            return {
              tag_number: row[0],
              service_description: row[1],
              working_kw: row[2],
              standby_kw: row[3],
              starter_type: row[4],
              supply_voltage: row[5].split(" ")[0],
              phase: row[6],
              starting_time: row[7],
              eocr_applicable: row[8],
              lpbs_type: row[9],
              control_scheme: row[10],
              panel: row[11],
              package: row[12],
              area: row[13],
              standard: row[14],
              zone: row[15],
              gas_group: row[16],
              temperature_class: row[17],
              remark: row[18],
              rev: row[19],
              space_heater: row[20],
              bearing_rtd: row[21],
              wiring_rtd: row[22],
              thermistor: row[23],
              power_factor: row[24],
              motor_efficiency: row[25],
              local_isolator: row[26],
              panel_ammeter: row[27],
              motor_scope: row[28],
              motor_location: row[29],
              motor_rated_current: row[30],
            };
          }
          if (projectDivision === ENVIRO) {
            return {
              tag_number: row[0],
              service_description: row[1],
              working_kw: row[2],
              standby_kw: row[3],
              kva: row[4],
              starter_type: row[5],
              supply_voltage: row[6].split(" ")[0],
              phase: row[7],
              eocr_applicable: row[8],
              lpbs_type: row[9],
              control_scheme: row[10],
              panel: row[11],
              bus_segregation: row[12],
              motor_rpm: row[13],
              motor_mounting_type: row[14],
              motor_frame_size: row[15],
              motor_gd2: row[16],
              motor_driven_equipment_gd2: row[17],
              bkw: row[18],
              coupling_type: row[19],
              package: row[20],
              area: row[21],
              standard: row[22],
              zone: row[23],
              gas_group: row[24],
              temperature_class: row[25],
              remark: row[26],
              rev: row[27],
              space_heater: row[28],
              bearing_rtd: row[29],
              wiring_rtd: row[30],
              thermistor: row[31],
              bearing_type: row[32],
              power_factor: row[33],
              motor_efficiency: row[34],
              local_isolator: row[35],
              panel_ammeter: row[36],
              motor_make: row[37],
              motor_scope: row[38],
              motor_location: row[39],
              motor_part_code: row[40],
              motor_rated_current: row[41],
            };
          }
          if (
            projectDivision === WWS_IPG ||
            projectDivision === WWS_SPG ||
            projectDivision === WWS_SERVICES
          ) {
            return {
              tag_number: row[0],
              service_description: row[1],
              working_kw: row[2],
              standby_kw: row[3],
              starter_type: row[4],
              supply_voltage: row[5].split(" ")[0],
              phase: row[6],
              eocr_applicable: row[7],
              lpbs_type: row[8],
              control_scheme: row[9],
              panel: row[10],
              bus_segregation: row[11],
              motor_rpm: row[12],
              motor_mounting_type: row[13],
              motor_frame_size: row[14],
              motor_gd2: row[15],
              motor_driven_equipment_gd2: row[16],
              bkw: row[17],
              coupling_type: row[18],
              package: row[19],
              area: row[20],
              standard: row[21],
              zone: row[22],
              gas_group: row[23],
              temperature_class: row[24],
              remark: row[25],
              rev: row[26],
              space_heater: row[27],
              bearing_rtd: row[28],
              wiring_rtd: row[29],
              thermistor: row[30],
              bearing_type: row[31],
              power_factor: row[32],
              motor_efficiency: row[33],
              local_isolator: row[34],
              panel_ammeter: row[35],
              motor_make: row[36],
              motor_scope: row[37],
              motor_location: row[38],
              motor_part_code: row[39],
              motor_rated_current: row[40],
            };
          } else {
            return {};
          }
        }),
    };
    try {
      const respose = await updateData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`,
        false,
        payload
      );
      console.log(respose);
      refetch();
      message.success("Electrical Load List Saved");
    } catch (error) {
      message.error("Unable to save electrical load list");
    } finally {
      setLoading(false);
      setIsCurrentFetched(false);
    }
  };
  const updateLinkedData = () => {
    const current_data = spreadsheetRef?.current?.getData();

    current_data?.forEach((item: any) => {
      item[getColumnIndex("supply_voltage")] =
        projectInfo?.main_supply_lv || "";
      if (
        getStandByKw(item[2], item[3]) >=
        Number(commonConfigurationData[0]?.ammeter)
      ) {
        item[getColumnIndex("panel_ammeter")] =
          commonConfigurationData[0]?.ammeter_configuration; //ametter config selection
      }
      if (projectDivision !== HEATING) {
        item[getColumnIndex("motor_make")] =
          makeOfComponent[0]?.preferred_motor; // preferred motor make
      }

      let isHazardousPackage = false;
      if (item[getColumnIndex("package")]) {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) =>
              item.sub_package_name == item[getColumnIndex("package")]
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              item[getColumnIndex("area")] = "Hazardous";
              item[getColumnIndex("standard")] = pckg?.standard;
              item[getColumnIndex("zone")] = pckg?.zone;
              item[getColumnIndex("gas_group")] = pckg?.gas_group;
              item[getColumnIndex("temperature_class")] =
                pckg?.temperature_class;
              item[getColumnIndex("motor_efficiency")] =
                motorParameters[0]?.hazardous_area_efficiency_level;
              isHazardousPackage = true;
            } else {
              item[getColumnIndex("area")] = "Safe";
              item[getColumnIndex("standard")] = "NA";
              item[getColumnIndex("zone")] = "NA";
              item[getColumnIndex("gas_group")] = "NA";
              item[getColumnIndex("temperature_class")] = "NA";
              item[getColumnIndex("motor_efficiency")] =
                motorParameters[0]?.safe_area_efficiency_level;
            }
          }
        });
      }
      const spcae_heater_criteria = isHazardousPackage
        ? motorParameters[0]?.hazardous_area_space_heater
        : motorParameters[0]?.safe_area_space_heater;
      if (
        item[getColumnIndex("starter_type")] !== "DOL-HTR" ||
        item[getColumnIndex("starter_type")] !== "SUPPLY FEEDER"
      ) {
        item[getColumnIndex("space_heater")] =
          spcae_heater_criteria === "As per OEM Standard"
            ? "As per OEM Standard"
            : spcae_heater_criteria === "All"
            ? "Yes"
            : spcae_heater_criteria === "No"
            ? "No"
            : getStandByKw(item[2], item[3]) >= Number(spcae_heater_criteria)
            ? "Yes"
            : "No"; // space heater criteria

        const bearing_rtd_criteria = isHazardousPackage
          ? motorParameters[0]?.hazardous_area_bearing_rtd
          : motorParameters[0]?.safe_area_bearing_rtd;
        item[getColumnIndex("bearing_rtd")] =
          bearing_rtd_criteria === "All"
            ? "Yes"
            : bearing_rtd_criteria === "No"
            ? "No"
            : getStandByKw(item[2], item[3]) >= Number(bearing_rtd_criteria)
            ? "Yes"
            : "No"; // bearing rtd criteria

        const winding_rtd_criteria = isHazardousPackage
          ? motorParameters[0]?.hazardous_area_winding_rtd
          : motorParameters[0]?.safe_area_winding_rtd;
        item[getColumnIndex("wiring_rtd")] =
          winding_rtd_criteria === "All"
            ? "Yes"
            : winding_rtd_criteria === "No"
            ? "No"
            : getStandByKw(item[2], item[3]) >= Number(winding_rtd_criteria)
            ? "Yes"
            : "No"; // winding rtd criteria

        const thermister_criteria = isHazardousPackage
          ? motorParameters[0]?.hazardous_area_thermister
          : motorParameters[0]?.safe_area_thermister;
        if (projectDivision === WWS_IPG) {
          item[getColumnIndex("thermistor")] =
            thermister_criteria === "As per OEM Standard"
              ? "As per OEM Standard"
              : thermister_criteria === "All"
              ? "Yes"
              : thermister_criteria === "No"
              ? "No"
              : getStandByKw(item[2], item[3]) >= Number(thermister_criteria) &&
                item[getColumnIndex("starter_type")]?.includes("VFD")
              ? "Yes"
              : "No"; // thermistor criteria
        } else {
          item[getColumnIndex("thermistor")] =
            thermister_criteria === "As per OEM Standard"
              ? "As per OEM Standard"
              : thermister_criteria === "All"
              ? "Yes"
              : thermister_criteria === "No"
              ? "No"
              : getStandByKw(item[2], item[3]) >= Number(thermister_criteria)
              ? "Yes"
              : "No";
        }
      }
      const efficiency = isHazardousPackage
        ? motorParameters[0]?.hazardous_area_efficiency_level
        : motorParameters[0]?.safe_area_efficiency_level;
      item[getColumnIndex("motor_efficiency")] = efficiency;
    });

    spreadsheetRef?.current?.setData(current_data);
    message.success("Data Has Been Updated Please Save");
  };

  const handleUploadLoadlist = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        message.error("No sheets found in workbook");
        return;
      }
      const worksheet = workbook.Sheets[sheetName] as any;
      const jsonData = XLSX.utils
        .sheet_to_json(worksheet, { header: 1 })
        .slice(2) as any[][];

      const newArray = jsonData.map((subArray) => subArray.slice(1));

      newArray.forEach((item) => {
        if (!item[2]) {
          item[2] = "0";
        }
        if (!item[3]) {
          item[3] = "0";
        }
        if (
          getStandByKw(item[2], item[3]) <=
          Number(commonConfigurationData[0]?.dol_starter)
        ) {
          if (!item[5]) {
            item[5] = "DOL STARTER";
          }
        }
        if (
          getStandByKw(item[2], item[3]) >=
          Number(commonConfigurationData[0]?.star_delta_starter)
        ) {
          if (!item[5]) {
            item[5] = "STAR-DELTA";
          }
        }
        if (item[5] === "DOL-HTR" || item[5] === "SUPPLY FEEDER") {
          item[29] = "No";
          item[30] = "No";
          item[31] = "No";
          item[32] = "No";
        }
        if (!item[6]) {
          item[6] = projectInfo?.main_supply_lv || ""; // main supply lv
        }
        if (!item[7]) {
          item[7] = "3 Phase"; //Phase
        }
        if (!item[9]) {
          item[9] = "No"; // EOCR
        }
        if (item[14] == 0) {
          item[15] = "NA";
          item[16] = "NA";
        }
        if (!item[29]) {
          item[29] =
            motorParameters[0]?.safe_area_space_heater === "As per OEM Standard"
              ? "As per OEM Standard"
              : motorParameters[0]?.safe_area_space_heater === "All"
              ? "Yes"
              : motorParameters[0]?.safe_area_space_heater === "No"
              ? "No"
              : getStandByKw(item[2], item[3]) >=
                Number(motorParameters[0]?.safe_area_space_heater)
              ? "Yes"
              : "No"; // space heater criteria
        }
        if (!item[30]) {
          item[30] =
            motorParameters[0]?.safe_area_bearing_rtd === "All"
              ? "Yes"
              : motorParameters[0]?.safe_area_bearing_rtd === "No"
              ? "No"
              : getStandByKw(item[2], item[3]) >=
                Number(motorParameters[0]?.safe_area_bearing_rtd)
              ? "Yes"
              : "No"; // bearing rtd criteria
        }
        if (!item[31]) {
          item[31] =
            motorParameters[0]?.safe_area_winding_rtd === "All"
              ? "Yes"
              : motorParameters[0]?.safe_area_winding_rtd === "No"
              ? "No"
              : getStandByKw(item[2], item[3]) >=
                Number(motorParameters[0]?.safe_area_winding_rtd)
              ? "Yes"
              : "No"; // winding rtd criteria
        }
        if (!item[32]) {
          if (projectDivision === WWS_IPG) {
            item[32] =
              motorParameters[0]?.safe_area_thermister === "As per OEM Standard" &&  item[5]?.includes("VFD")
                ? "As per OEM Standard"
                : motorParameters[0]?.safe_area_thermister === "All" &&  item[5]?.includes("VFD")
                ? "Yes"
                : motorParameters[0]?.safe_area_thermister === "No"
                ? "No"
                : getStandByKw(item[2], item[3]) >=
                    Number(motorParameters[0]?.safe_area_thermister) &&
                  item[5]?.includes("VFD")
                ? "Yes"
                : "No"; // thermistor criteria
          } else {
            item[32] =
              motorParameters[0]?.safe_area_thermister === "As per OEM Standard"
                ? "As per OEM Standard"
                : motorParameters[0]?.safe_area_thermister === "All"
                ? "Yes"
                : motorParameters[0]?.safe_area_thermister === "No"
                ? "No"
                : getStandByKw(item[2], item[3]) >=
                  Number(motorParameters[0]?.safe_area_thermister)
                ? "Yes"
                : "No";
          }
        }
        if (!item[34] && item[5] === "DOL-HTR") {
          item[34] = "1"; // power factor
        } else if (!item[34]) {
          item[34] = "0.8"; // power factor
        }
        if (!item[35]) {
          item[35] = motorParameters[0]?.safe_area_efficiency_level; // efficieany
        }
        if (!item[36]) {
          item[36] = "No"; // local isolator
        }

        // }
        if (
          getStandByKw(item[2], item[3]) >=
          Number(commonConfigurationData[0]?.ammeter)
        ) {
          if (!item[37]) {
            item[37] = commonConfigurationData[0]?.ammeter_configuration; //ametter config selection
          }
        } else {
          if (!item[37]) {
            item[37] = "NA"; //ametter config selection
          }
        }
        if (projectDivision !== HEATING) {
          if (!item[38]) {
            item[38] = makeOfComponent[0]?.preferred_motor;
          }
        }
      });

      const sheet_data = newArray
        .map((item: any) => {
          if (projectDivision === HEATING) {
            return [
              item[getColumnIndex("tag_number")],
              item[getColumnIndex("service_description")],
              item[getColumnIndex("working_kw")],
              item[getColumnIndex("standby_kw")],
              item[5],
              item[6],
              item[7],
              item[8], //starting time
              item[9], //eocr
              "", //lpbs type
              "", //control scheme
              "", //panel
              "", //pkg
              "", //area
              "", //standard
              "", //zone
              "", //gas group
              "", //temp class
              "", //remark
              revision, //rev
              item[29], //space heater
              item[30], //bearing rtd
              item[31], //winding rtd
              item[32], //thermistor
              item[34], //24th power factor
              item[35], //motor efficiency
              item[36], //local isolator
              item[37], //panel ammeter
            ];
          } else if (projectDivision === ENVIRO) {
            return [
              item[getColumnIndex("tag_number")],
              item[getColumnIndex("service_description")],
              item[getColumnIndex("working_kw")],
              item[getColumnIndex("standby_kw")],
              item[4], // kva
              item[5], // starter type
              item[6], // supply voltage
              item[7], // phase
              item[9], // eocr
              "", //lpbs type
              "", // control scheme
              "", // panel
              item[13], // bus segrigation
              item[14], // motor rpm
              item[15], // type of mounting
              item[16], // frame size
              item[17], // gd2
              item[18], // driven equipment
              item[19], //bkw
              item[20], //type of coupling
              "", // pkg
              "", // area
              "", // standard
              "", // zone
              "", // gas group
              "", // temp class
              "", // remark
              revision, // rev
              item[29],
              item[30],
              item[31],
              item[32],
              item[33], // type of bearing
              item[34], //24th power factor
              item[35], //motor efficiency
              item[36], //local isolator
              item[37], // panel ameter
              item[38], // prefered motor make
              item[39], // motor scope
              item[40], // motor location
              "", // motor part code
              "", // motor rated current
            ];
          } else {
            return [
              item[getColumnIndex("tag_number")],
              item[getColumnIndex("service_description")],
              item[getColumnIndex("working_kw")],
              item[getColumnIndex("standby_kw")],
              item[5], // starter type
              item[6], // supply voltage
              item[7], // phase
              item[9], // eocr
              "", //lpbs type
              "", // control scheme
              "", // panel
              item[13], // bus segrigation
              item[14], // motor rpm
              item[15], // type of mounting
              item[16], // frame size
              item[17], // gd2
              item[18], // driven equipment
              item[19], //bkw
              item[20], //type of coupling
              "", // pkg
              "", // area
              "", // standard
              "", // zone
              "", // gas group
              "", // temp class
              "", // remark
              revision, // rev
              item[29],
              item[30],
              item[31],
              item[32],
              item[33], // type of bearing
              item[34], //24th power factor
              item[35], //motor efficiency
              item[36], //local isolator
              item[37], // panel ameter
              item[38], // prefered motor make
              item[39], // motor scope
              item[40], // motor location
              "", // motor part code
              "", // motor rated current
            ];
          }
        })
        .filter((item: any) => {
          if (item[0]) {
            return true;
          } else {
            return false;
          }
        });

      spreadsheetRef?.current?.setData(sheet_data);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCurrentCalculation = async () => {
    setLoading(true);
    try {
      const loadList = spreadsheetRef?.current?.getData();
      console.log(
        loadList?.map((row: any) => {
          return {
            kw: getStandByKw(row[2], row[3]),
            supplyVoltage: Number(
              row[getColumnIndex("supply_voltage")].split(" ")[0]
            ),
            phase: row[getColumnIndex("phase")],
            powerFactor: Number(row[getColumnIndex("power_factor")]),
            motorFrameSize: "",
            motorPartCode: "",
            motorRatedCurrent: "",
            tagNo: row[0],
            starterType: row[getColumnIndex("phase")],
          };
        })
      );

      const currentCalculations = await getCurrentCalculation({
        divisionName: projectDivision,
        data: loadList?.map((row: any) => {
          return {
            kw: getStandByKw(row[2], row[3]),
            supplyVoltage: Number(
              row[getColumnIndex("supply_voltage")].split(" ")[0]
            ),
            phase: row[getColumnIndex("phase")],
            powerFactor: Number(row[getColumnIndex("power_factor")]),
            motorFrameSize: "",
            motorPartCode: "",
            motorRatedCurrent: "",
            tagNo: row[0],
            starterType: row[getColumnIndex("starter_type")],
            kva: projectDivision === ENVIRO ? row[4] : 0,
          };
        }),
      });
      let getFrameSize: any[];
      if (projectDivision !== HEATING) {
        getFrameSize = await getFrameSizeCalculation({
          divisionName: projectDivision,
          data: loadList?.map((row: any) => {
            return {
              kw: getStandByKw(row[2], row[3]),
              tagNo: row[0],
              speed: Number(row[getColumnIndex("motor_rpm")]),
              mounting_type: row[getColumnIndex("motor_mounting_type")],
            };
          }),
        });
      }
      const updatedLoadList: any = loadList?.map((row: any) => {
        const calculationResult = currentCalculations?.find(
          (item: any) => item.tagNo === row[0]
        );
        const frameSizeResult = getFrameSize?.find(
          (item: any) => item.tagNo === row[0]
        );
        console.log(frameSizeResult, "frameSizeResult");

        if (calculationResult) {
          const updatedRow = [...row];
          if (projectDivision !== HEATING) {
            updatedRow[getColumnIndex("motor_rated_current")] =
              calculationResult.motorRatedCurrent;
            updatedRow[getColumnIndex("motor_frame_size")] =
              frameSizeResult.speed === 0 ? "NA" : frameSizeResult.frameSize;
          } else {
            updatedRow[getColumnIndex("motor_rated_current")] =
              calculationResult.motorRatedCurrent;
          }

          return updatedRow;
        }
        return row;
      });
      spreadsheetRef?.current?.setData(updatedLoadList);
    } catch (error) {
    } finally {
      setIsCurrentFetched(true);
      setLoading(false);
    }
  };
  function getPolesFromRPM(rpm: any) {
    const rpmToPoles: any = {
      3000: 2,
      1500: 4,
      1000: 6,
      750: 8,
    };

    return rpmToPoles[rpm] || "Unknown RPM";
  }
  const handleGetMotorPartCode = async () => {
    setLoading(true);
    try {
      const loadList = spreadsheetRef?.current?.getData();
      if (
        projectDivision === WWS_IPG ||
        projectDivision === WWS_SPG ||
        projectDivision === WWS_SERVICES
      ) {
        const currentCalculations = await getMotorPartCode({
          divisionName: projectDivision,
          data: loadList?.map((row: any) => {
            return {
              motor_make: row[getColumnIndex("motor_make")],
              no_of_poles: getPolesFromRPM(row[getColumnIndex("motor_rpm")]),
              kw: getStandByKw(row[2], row[3]),
              motor_efficiency: row[getColumnIndex("motor_efficiency")],
              motor_mounting_type: row[getColumnIndex("motor_mounting_type")],
              motor_frame_size: row[getColumnIndex("motor_frame_size")],
              supply_voltage: Number(
                row[getColumnIndex("supply_voltage")].split(" ")[0]
              ),
              tagNo: row[0],
            };
          }),
        });

        const updatedLoadList: any = loadList?.map((row: any) => {
          const calculationResult = currentCalculations?.find(
            (item: any) => item.tagNo === row[0]
          );

          if (calculationResult) {
            const updatedRow = [...row];
            updatedRow[getColumnIndex("motor_part_code")] =
              calculationResult.part_code;

            return updatedRow;
          }
          return row;
        });
        console.log(currentCalculations);
        console.log(updatedLoadList);

        spreadsheetRef?.current?.setData(updatedLoadList);
        message.success("Motor Part Code Updated Successfully");
      }
    } catch (error) {
    } finally {
      // setIsCurrentFetched(true);
      setLoading(false);
    }
  };
  const handleTemplateDownload = async () => {
    const base64Data: any = await downloadFrappeCloudFile(
      `${process.env.FRAPPE_BASE_URL}/files/Final_Motor_Details_Template.xlsx`
    );
    // Create a Blob from the Base64 string
    const binaryData = Buffer.from(base64Data, "base64");
    const blob = new Blob([binaryData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create a download link and trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    // Use Content-Disposition header to get the filename

    link.download = "Motor Details Template.xlsx";
    link.click();
  };
  const handleValidatePanelLoad = () => {
    if (spreadsheetRef?.current) {
      const data = spreadsheetRef?.current?.getData();
      calculatePanelSum(data);
      setIsValidatePanelLoadOpen(true);
    }
  };
  const calculatePanelSum = (electricalLoadListData: any) => {
    const workingPanelList: string[] = panelList
      .map((p: any) =>
        typeof p === "object" && p !== null && "name" in p ? p.name : String(p)
      )
      .filter(Boolean);

    const panelsSumData: Record<string, PanelSumData> = Object.fromEntries(
      workingPanelList.map((panelType) => [
        panelType,
        {
          panelName: panelType,
          workingLoadSum: 0,
          standbyLoadSum: 0,
          totalLoadKw: 0,
          totalCurrent: 0,
        },
      ])
    );

    // Calculate sums for each panel
    electricalLoadListData.forEach((row: any) => {
      const panelType = String(row[getColumnIndex("panel")] || "");
      const workingLoad = parseFloat(String(row[2] || "0"));
      const standbyLoad = parseFloat(String(row[3] || "0"));
      const current = parseFloat(
        String(row[getColumnIndex("motor_rated_current")] || "0")
      );

      if (!panelType || !(panelType in panelsSumData)) {
        return;
      }

      if (!isNaN(workingLoad) && !isNaN(standbyLoad)) {
        const panel = panelsSumData[panelType] as PanelSumData;
        panel.workingLoadSum += workingLoad;
        panel.standbyLoadSum += standbyLoad;
        panel.totalLoadKw = panel.workingLoadSum;

        if (workingLoad !== 0) {
          panel.totalCurrent += current;
        }
      }
    });

    const filteredPanelData = Object.values(panelsSumData).filter(
      (item) => item.totalCurrent !== 0
    );

    setPanelsSumData(filteredPanelData);
  };
  const LoadingFallback = () => (
    <div className="flex h-full items-center justify-center">
      <Spin size="large" />
    </div>
  );
  const handleClearSheet = () => {
    Modal.confirm({
      title: "Are you sure you want to clear the sheet?",
      content: "This action cannot be undone.",
      okText: "Yes, Clear it",
      cancelText: "Cancel",
      onOk: () => {
        spreadsheetRef?.current?.setData([]);
      },
      onCancel: () => {},
    });
  };

  return (
    <>
      <div className="text-end">
        {loadListData && (
          <h3 className="italic text-gray-500 text-sm pr-2 pb-2">
            last modified:{" "}
            {convertToFrappeDatetime(new Date(loadListData?.modified))}
          </h3>
        )}
      </div>
      <div className="mb-4 flex justify-between gap-4">
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={handleTemplateDownload}
            disabled={userDivision !== projectDivision}
            // size="small"
          >
            Load List Template
          </Button>
          <Button
            type="primary"
            onClick={downloadCurrentData}
            disabled={userDivision !== projectDivision}
            // size="small"
          >
            Download Current Data
          </Button>
          <Button
            type="primary"
            onClick={handleClearSheet}
            disabled={userDivision !== projectDivision}
          >
            Clear Sheet
          </Button>
        </div>
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={updateLinkedData}
            className="hover:bg-blue-600"
            disabled={userDivision !== projectDivision}
            // size="small"
          >
            Refetch
          </Button>
          <Button
            type="primary"
            onClick={() => setIsControlSchemeModalOpen(true)}
            className="hover:bg-blue-600"
            disabled={userDivision !== projectDivision}
            // size="small"
          >
            Control Scheme Configurator
          </Button>
          {projectDivision !== HEATING && (
            <Button
              type="primary"
              onClick={() => setIsLPBSModalOpen(true)}
              className="hover:bg-blue-600"
              disabled={userDivision !== projectDivision}
              // size="small"
            >
              LPBS Configurator
            </Button>
          )}
        </div>
      </div>
      <TableFilter
        filters={filterConfig}
        onFilter={handleFilter}
        loading={false}
      />
      <div className="m-2 flex flex-col overflow-auto">
        <div ref={jRef} />
      </div>
      {isControlSchemeModalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <ControlSchemeConfigurator
            isOpen={isControlSchemeModalOpen}
            onClose={() => setIsControlSchemeModalOpen(false)}
            selectedControlSchemes={getSelectedSchemes()}
            onConfigurationComplete={handleControlSchemeComplete}
            division={projectDivision}
          />
        </Suspense>
      )}

      {isLPBSModalOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <LpbsConfigurator
            isOpen={isLPBSModalOpen}
            onClose={() => setIsLPBSModalOpen(false)}
            selectedLpbsSchemes={getSelectedLpbsSchemes()}
            onConfigurationComplete={handleLpbsComplete}
            division={projectDivision}
          />
        </Suspense>
      )}

      {isValidatePanelLoadOpen && (
        <Suspense fallback={<LoadingFallback />}>
          <ValidatePanelLoad
            isOpen={isValidatePanelLoadOpen}
            onClose={() => setIsValidatePanelLoadOpen(false)}
            panelsSumData={panelsSumData}
          />
        </Suspense>
      )}

      <div className="flex w-full flex-row justify-end gap-2">
        <Button
          type="primary"
          disabled={userDivision !== projectDivision}
          // size="small"
        >
          Upload Load List
          <input
            type="file"
            style={{
              position: "absolute",
              opacity: 0,
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
            onChange={handleUploadLoadlist}
          />
        </Button>

        <Button
          type="primary"
          onClick={handleCurrentCalculation}
          disabled={userDivision !== projectDivision || isCurrentFetched}
          // size="small"
        >
          Get Current
        </Button>
        <Button
          type="primary"
          onClick={handleGetMotorPartCode}
          disabled={userDivision !== projectDivision || !isCurrentFetched}
          // size="small"
        >
          Get Motor Part Code
        </Button>
        <Button
          type="primary"
          onClick={handleValidatePanelLoad}
          disabled={userDivision !== projectDivision}
          // size="small"
        >
          Validate Panel Load
        </Button>

        <Button
          type="primary"
          onClick={handleLoadListSave}
          disabled={userDivision !== projectDivision || isFilterAppllied}
          // size="small"
        >
          Save
        </Button>
        <Button
          type="primary"
          // size="small"
          onClick={() => {
            setLoading(true);
            router.push(
              `/project/${project_id}/electrical-load-list/cable-schedule`
            );
          }}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default LoadList;
