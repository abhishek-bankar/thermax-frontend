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
import { Button, message, Spin } from "antd";
import { useProjectPanelData } from "@/hooks/useProjectPanelData";
import { useParams, useRouter } from "next/navigation";
import { useLoading } from "@/hooks/useLoading";
import {
  getCurrentCalculation,
  getFrameSizeCalculation,
} from "@/actions/electrical-load-list";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ENVIRO, HEATING, WWS_IPG, WWS_SPG } from "@/configs/constants";
import { useGetData } from "@/hooks/useCRUD";
import TableFilter from "../common/TabelFilter";

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
  } = useDataFetching(
    designBasisRevisionId,
    loadListLatestRevisionId,
    project_id
  );
  const panelList = useMemo(
    () => projectPanelData?.map((item: any) => item.panel_name) || [],
    [projectPanelData]
  );
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
  const getColumnIndex = useCallback((key: string) => {
    const columnMap: { [key: string]: number } = {
      working_kw: 2,
      standby_kw: 3,
      starter_type: 5,
      eocr: 9,
      panel: 12,
    };
    return columnMap[key] ?? -1;
  }, []);

  const handleFilter = useCallback(
    (values: any) => {
      console.log(values);
      console.log(projectData);

      let filtered = spreadsheetRef?.current?.getData();
      if (filtered) {
        Object.entries(values).forEach(([key, value]) => {
          if (value) {
            const columnIndex = getColumnIndex(key);
            if (columnIndex === -1) {
              console.warn(`No column mapping found for key: ${key}`);
              return;
            }

            filtered = filtered?.filter((item) => {
              const itemValue = item[columnIndex];
              if (itemValue === undefined) {
                console.warn(
                  `No value found at index ${columnIndex} for item`,
                  item
                );
                return true;
              }

              if (typeof value === "string") {
                return itemValue
                  .toString()
                  .toLowerCase()
                  .includes(value.toLowerCase());
              }
              return itemValue === value;
            });
          }
        });
      }
      if (spreadsheetRef?.current) {
        spreadsheetRef?.current?.setData(filtered);
      }
      const isEmpty = Object.keys(values).length === 0;
      if (isEmpty) {
        const getdata = async () => {
          try {
            setLoading(true);
            const res = await getData(
              `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
            );

            spreadsheetRef?.current?.setData(
              getArrayOfLoadListData(res, revision)
            );
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        };
        getdata();
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
            data[rowIndex][26] =
              motorParameters[0]?.hazardous_area_efficiency_level;
          } else {
            data[rowIndex][13] = "Safe";
            data[rowIndex][14] = "NA";
            data[rowIndex][15] = "NA";
            data[rowIndex][16] = "NA";
            data[rowIndex][17] = "NA";
            data[rowIndex][26] = motorParameters[0]?.safe_area_efficiency_level;
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
      }
    }
    if (projectDivision !== HEATING && userDivision !== HEATING) {
      if (colIndex == "14") {
        if (newValue === "0") {
          data[rowIndex][15] = "NA";
          data[rowIndex][16] = "NA";
        }
      }
    }

    if (colIndex === "5") {
      if (newValue === "DOL-HTR") {
        data[rowIndex][34] = "1";
      }
      if (newValue === "SUPPLY FEEDER" || newValue === "DOL-HTR") {
        data[rowIndex][29] = "No";
        data[rowIndex][30] = "No";
        data[rowIndex][31] = "No";
      } else {
        data[rowIndex][29] =
          getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
          Number(motorParameters[0]?.safe_area_space_heater)
            ? "Yes"
            : "No";
        data[rowIndex][30] =
          getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
          Number(motorParameters[0]?.safe_area_bearing_rtd)
            ? "Yes"
            : "No";
        data[rowIndex][31] =
          getStandByKw(data[rowIndex][2], data[rowIndex][3]) >=
          Number(motorParameters[0]?.safe_area_winding_rtd)
            ? "Yes"
            : "No";
      }
    }
    spreadsheetRef?.current?.setData(data);
  };
  const typedLoadListColumns = useMemo(
    () =>
      LoadListcolumns(userInfo?.division).map((column) => ({
        ...column,
        type: column.type as ValidColumnType,
      })),
    []
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
        item.motor_make,
        item.motor_scope,
        item.motor_location,
        item.motor_part_code,
        item.motor_rated_current,
      ];
      if (projectDivision === ENVIRO) {
        result.splice(4, 0, item.kva);
      }
      if (projectDivision === HEATING) {
        result.splice(7, 0, item.starting_time);
      }
      if (projectDivision !== HEATING) {
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
        result.splice(24, 0, item.bearing_type);
      }

      return result;
    });
  };

  const loadListOptions = useMemo(
    () => ({
      data: getArrayOfLoadListData(loadListData, revision),
      columns: typedLoadListColumns,
      columnSorting: true,
      columnDrag: true,
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
          column.source = [
            ...subPackages
              ?.map((pkg: any) => pkg.sub_packages)
              .flat()
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
  }, [isLoading, loadListData, loadListOptions, panelList]);
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
      }
    });
  };
  const handleLpbsComplete = (selectedSchemes: string[]) => {
    typedLoadListColumns.forEach((column) => {
      if (column.name === "lbpsType") {
        column.source = selectedSchemes;
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

      // Check last three columns (indexes 2, 3, 4 assuming 0-based indexing)
      for (let colIndex = 2; colIndex <= 4; colIndex++) {
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

      // If more than one column has a value greater than 0, highlight the cells
      if (greaterThanZeroCount > 1 || allZero) {
        isInvalid = true;
        for (let colIndex = 2; colIndex <= 4; colIndex++) {
          const cellValue = parseFloat((row[colIndex] as string) || "0");

          if (cellValue > 0) {
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
      project_id: project_id,
      status: "Not Released",
      description: "test",
      electrical_load_list_data: spreadsheetRef?.current
        ?.getData()
        .map((row: any) => {
          return {
            tag_number: row[0],
            service_description: row[1],
            working_kw: row[2],
            standby_kw: row[3],
            kva: row[4],
            starter_type: row[5],
            supply_voltage: row[6].split(" ")[0],
            phase: row[7],
            starting_time: row[8],
            eocr_applicable: row[9],
            lpbs_type: row[10],
            control_scheme: row[11],
            panel: row[12],
            bus_segregation: row[13],
            motor_rpm: row[14],
            motor_mounting_type: row[15],
            motor_frame_size: row[16],
            motor_gd2: row[17],
            motor_driven_equipment_gd2: row[18],
            bkw: row[19],
            coupling_type: row[20],
            package: row[21],
            area: row[22],
            standard: row[23],
            zone: row[24],
            gas_group: row[25],
            temperature_class: row[26],
            remark: row[27],
            rev: row[28],
            space_heater: row[29],
            bearing_rtd: row[30],
            wiring_rtd: row[31],
            thermistor: row[32],
            bearing_type: row[33],
            power_factor: row[34],
            motor_efficiency: row[35],
            local_isolator: row[36],
            panel_ammeter: row[37],
            motor_make: row[38],
            motor_scope: row[39],
            motor_location: row[40],
            motor_part_code: row[41],
            motor_rated_current: row[42],
          };
        }),
    };
    try {
      const respose = await updateData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`,
        false,
        payload
      );
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
      if (
        getStandByKw(item[2], item[3]) <=
        Number(commonConfigurationData[0]?.dol_starter)
      ) {
        item[5] = "DOL STARTER";
      }
      if (
        getStandByKw(item[2], item[3]) >=
        Number(commonConfigurationData[0]?.star_delta_starter)
      ) {
        item[5] = "STAR-DELTA";
      }
      item[6] = projectInfo?.main_supply_lv || "";
      if (
        getStandByKw(item[2], item[3]) >=
        Number(commonConfigurationData[0]?.ammeter)
      ) {
        item[37] = commonConfigurationData[0]?.ammeter_configuration; //ametter config selection
      }
      item[38] = makeOfComponent[0]?.preferred_motor; // preferred motor make

      let isSafePackage = false;
      let isHazardousPackage = false;
      if (item[21]) {
        subPackages?.forEach((pckg: any) => {
          const selectedPckg = pckg?.sub_packages?.find(
            (item: any) => item.sub_package_name == item[21]
          );

          if (selectedPckg) {
            if (selectedPckg?.area_of_classification === "Hazardous Area") {
              item[22] = "Hazardous";
              item[23] = pckg?.standard;
              item[24] = pckg?.zone;
              item[25] = pckg?.gas_group;
              item[26] = pckg?.temperature_class;
              item[35] = motorParameters[0]?.hazardous_area_efficiency_level;
              isHazardousPackage = true;
            } else {
              item[22] = "Safe";
              item[23] = "NA";
              item[24] = "NA";
              item[25] = "NA";
              item[26] = "NA";
              item[35] = motorParameters[0]?.safe_area_efficiency_level;
              isSafePackage = true;
            }
          }
        });
      }
      const spcae_heater_criteria = isSafePackage
        ? motorParameters[0]?.safe_area_space_heater
        : isHazardousPackage
        ? motorParameters[0]?.hazardous_area_space_heater
        : 0;
      item[29] =
        getStandByKw(item[2], item[3]) >= Number(spcae_heater_criteria)
          ? "Yes"
          : "No"; // space heater criteria

      const bearing_rtd_criteria = isSafePackage
        ? motorParameters[0]?.safe_area_bearing_rtd
        : isHazardousPackage
        ? motorParameters[0]?.hazardous_area_bearing_rtd
        : 0;
      item[30] =
        getStandByKw(item[2], item[3]) >= Number(bearing_rtd_criteria)
          ? "Yes"
          : "No"; // bearing rtd criteria

      const winding_rtd_criteria = isSafePackage
        ? motorParameters[0]?.safe_area_winding_rtd
        : isHazardousPackage
        ? motorParameters[0]?.hazardous_area_winding_rtd
        : 0;
      item[31] =
        getStandByKw(item[2], item[3]) >= Number(winding_rtd_criteria)
          ? "Yes"
          : "No"; // winding rtd criteria

      const thermister_criteria = isSafePackage
        ? motorParameters[0]?.safe_area_thermister
        : isHazardousPackage
        ? motorParameters[0]?.hazardous_area_thermister
        : 0;
      if (userInfo.division === WWS_IPG) {
        item[32] =
          getStandByKw(item[2], item[3]) >= Number(thermister_criteria) &&
          item[5]?.includes("VFD")
            ? "Yes"
            : "No"; // thermistor criteria
      } else {
        item[32] =
          getStandByKw(item[2], item[3]) >= Number(thermister_criteria)
            ? "Yes"
            : "No";
      }
    });

    spreadsheetRef?.current?.setData(current_data);
    message.success("Data Has Been Updated Please Save");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        console.error("No sheets found in workbook");
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
            getStandByKw(item[2], item[3]) >=
            Number(motorParameters[0]?.safe_area_space_heater)
              ? "Yes"
              : "No"; // space heater criteria
        }
        if (!item[30]) {
          item[30] =
            getStandByKw(item[2], item[3]) >=
            Number(motorParameters[0]?.safe_area_bearing_rtd)
              ? "Yes"
              : "No"; // bearing rtd criteria
        }
        if (!item[31]) {
          item[31] =
            getStandByKw(item[2], item[3]) >=
            Number(motorParameters[0]?.safe_area_winding_rtd)
              ? "Yes"
              : "No"; // winding rtd criteria
        }
        if (!item[32]) {
          if (userInfo.division === WWS_IPG) {
            item[32] =
              getStandByKw(item[2], item[3]) >=
                Number(motorParameters[0]?.safe_area_thermister) &&
              item[5]?.includes("VFD")
                ? "Yes"
                : "No"; // thermistor criteria
          } else {
            item[32] =
              getStandByKw(item[2], item[3]) >=
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
        }
        if (!item[38]) {
          item[38] = makeOfComponent[0]?.preferred_motor;
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
      });

      spreadsheetRef?.current?.setData(newArray);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCurrentCalculation = async () => {
    setLoading(true);
    try {
      const loadList = spreadsheetRef?.current?.getData();
      const currentCalculations = await getCurrentCalculation({
        divisionName: userInfo?.division,
        data: loadList?.map((row: any) => {
          return {
            kw: getStandByKw(row[2], row[3]),
            supplyVoltage: Number(row[6].split(" ")[0]),
            phase: row[7],
            powerFactor: Number(row[34]),
            motorFrameSize: "",
            motorPartCode: "",
            motorRatedCurrent: "",
            tagNo: row[0],
            starterType: row[5],
          };
        }),
      });
      const getFrameSize = await getFrameSizeCalculation({
        divisionName: WWS_SPG,
        data: loadList?.map((row: any) => {
          return {
            kw: getStandByKw(row[2], row[3]),
            tagNo: row[0],
            speed: Number(row[14]),
            mounting_type: row[15],
          };
        }),
      });
      const updatedLoadList: any = loadList?.map((row: any) => {
        const calculationResult = currentCalculations?.find(
          (item: any) => item.tagNo === row[0]
        );
        const frameSizeResult = getFrameSize?.find(
          (item: any) => item.tagNo === row[0]
        );
        if (calculationResult) {
          const updatedRow = [...row];
          updatedRow[42] = calculationResult.motorRatedCurrent;
          updatedRow[16] = frameSizeResult.frameSize;
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
  const handleTemplateDownload = async () => {
    const result = await downloadFrappeCloudFile(
      `${process.env.NEXT_PUBLIC_FRAPPE_URL}/files/Final_Motor_Details_Template.xlsx`
    );
    const byteArray = new Uint8Array(result?.data?.data); // Convert the array into a Uint8Array
    const excelBlob = new Blob([byteArray.buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(excelBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Motor Details Template.xlsx`); // Filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      const panelType = String(row[12] || "");
      const workingLoad = parseFloat(String(row[2] || "0"));
      const standbyLoad = parseFloat(String(row[3] || "0"));
      const current = parseFloat(String(row[42] || "0"));

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

  return (
    <>
      <div className="mb-4 flex justify-between gap-4">
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={downloadCurrentData}
            disabled={userDivision !== projectDivision}
            size="small"
          >
            Download Current Data
          </Button>
          <Button
            type="primary"
            onClick={handleTemplateDownload}
            disabled={userDivision !== projectDivision}
            size="small"
          >
            Load List Template
          </Button>
        </div>
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={updateLinkedData}
            className="hover:bg-blue-600"
            disabled={userDivision !== projectDivision}
            size="small"
          >
            Refetch
          </Button>
          <Button
            type="primary"
            onClick={() => setIsControlSchemeModalOpen(true)}
            className="hover:bg-blue-600"
            disabled={userDivision !== projectDivision}
            size="small"
          >
            Control Scheme Configurator
          </Button>
          {(userDivision !== HEATING || projectDivision !== HEATING) && (
            <Button
              type="primary"
              onClick={() => setIsLPBSModalOpen(true)}
              className="hover:bg-blue-600"
              disabled={userDivision !== projectDivision}
              size="small"
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
          size="small"
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
            onChange={handleFileChange}
          />
        </Button>
        <Button
          type="primary"
          onClick={handleCurrentCalculation}
          disabled={userDivision !== projectDivision || isCurrentFetched}
          size="small"
        >
          Get Current
        </Button>
        <Button
          type="primary"
          onClick={handleValidatePanelLoad}
          disabled={userDivision !== projectDivision}
          size="small"
        >
          Validate Panel Load
        </Button>

        <Button
          type="primary"
          onClick={handleLoadListSave}
          disabled={userDivision !== projectDivision}
          size="small"
        >
          Save
        </Button>
        <Button
          type="primary"
          size="small"
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
