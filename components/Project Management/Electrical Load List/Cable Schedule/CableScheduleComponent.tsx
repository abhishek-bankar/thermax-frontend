"use client";
import jspreadsheet, { JspreadsheetInstance } from "jspreadsheet-ce";
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { Button, message, Spin } from "antd";
import { ValidColumnType } from "../types";
import MulticoreCableConfigurator from "./Multicore Cable Config/MulticoreCableConfig";
import {
  CableSchedulecolumns,
  multicoreCableConfigColumns,
} from "../common/ExcelColumns";
import "./CableScheduleComponent.css";
import { downloadFile, getData, updateData } from "@/actions/crud-actions";
import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  CABLE_TRAY_LAYOUT,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  GET_VOLTAGE_DROP_EXCEL_API,
  HEATING_CONTROL_SCHEMES_URI,
  LPBS_SCHEMES_URI,
  PROJECT_API,
  SPG_SERVICES_CONTROL_SCHEMES_URI,
  STATIC_DOCUMENT_API,
} from "@/configs/api-endpoints";
import { useLoading } from "@/hooks/useLoading";
import { useParams, useRouter } from "next/navigation";
import { getCableSizingCalculation } from "@/actions/electrical-load-list";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ENVIRO,
  HEATING,
  WWS_SERVICES,
  WWS_IPG,
  WWS_SPG,
} from "@/configs/constants";
import { getIPGSchemesData, lcs_od_gland_data } from "@/app/Data";
import { getStandByKw } from "../Electrical Load List/LoadListComponent";
import { convertToFrappeDatetime } from "@/utils/helpers";
import { useGetData } from "@/hooks/useCRUD";
import { getSortedControlSchemes } from "../Electrical Load List/Control Scheme Config/ControlSchemeConfig";

interface CableScheduleProps {
  loadListLatestRevisionId: string;
  cableScheduleRevisionId: string;
  designBasisRevisionId: string;
}

const getArrayOfCableScheduleData = (
  data: any,
  savedCableSchedule: any,
  cableTrayData: any
) => {
  if (!data?.electrical_load_list_data) return [];
  console.log(data.electrical_load_list_data, "load list");
  console.log(savedCableSchedule?.cable_schedule_data, "load list cable");

  return data.electrical_load_list_data.map((item: any) => {
    const cableScheduleData = savedCableSchedule?.cable_schedule_data?.find(
      (row: any) => row.tag_number === item.tag_number
    );

    return [
      item.tag_number,
      item.service_description,
      item.working_kw,
      item.standby_kw,
      item.kva,
      item.starter_type,
      item.supply_voltage + ` VAC`,
      item.motor_rated_current,
      cableScheduleData?.apex_length,
      cableScheduleData?.number_of_runs
        ? cableScheduleData?.number_of_runs
        : [
            "VFD BYPASS-S/D",
            "STAR-DELTA",
            "SOFT STARTER BYPASS - S/D",
          ].includes(item.starter_type)
        ? 2
        : 1,
      cableScheduleData?.number_of_cores
        ? cableScheduleData?.number_of_cores
        : [
            "STAR-DELTA",
            "DOL STARTER",
            "R-DOL",
            "DOL-HTR",
            "DOL-ZSS",
            "SP-DOL MCB",
            "SP-DOL MPCB",
          ].includes(item.starter_type)
        ? "3C"
        : getStandByKw(item.working_kw, item.standby_kw) <= 22 &&
          [
            "VFD",
            "VFD BYPASS-S/D",
            "VFD Bypass DOL",
            "SOFT STARTER",
            "SOFT STARTER BYPASS - S/D",
            "SS Bypass DOL",
          ].includes(item.starter_type)
        ? "4C"
        : item.starter_type === "SUPPLY FEEDER"
        ? "4C"
        : "3.5C",
      cableScheduleData?.final_cable_size,
      cableScheduleData?.cable_material || "Copper",
      cableScheduleData?.cable_size_heating_chart,
      cableScheduleData?.cos_running ? cableScheduleData?.cos_running : 0.8,
      cableScheduleData?.cos_starting ? cableScheduleData?.cos_starting : 0.3,
      cableScheduleData?.resistance_meter,
      cableScheduleData?.reactance_meter,
      cableScheduleData?.vd_running,
      cableScheduleData?.vd_starting,
      cableScheduleData?.percent_vd_running,
      cableScheduleData?.percent_vd_starting,
      cableScheduleData?.selected_cable_capacity_amp,
      cableScheduleData?.derating_factor
        ? cableScheduleData.derating_factor
        : cableTrayData[0]?.derating_factor_air,
      cableScheduleData?.final_capacity,

      cableScheduleData?.cable_selected_status
        ? cableScheduleData?.cable_selected_status
        : "Safe",
    ];
  });
};
export const getApiEndpoint = (division: string) => {
  switch (division) {
    case HEATING:
      return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
    case WWS_SPG:
      return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
    case WWS_SERVICES:
      return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
    case ENVIRO:
      return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
    case WWS_IPG:
      return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;

    default:
      return "";
  }
};
const useDataFetching = (
  designBasisRevisionId: string,
  loadListLatestRevisionId: string,
  cableScheduleRevisionId: string,
  project_id: string
) => {
  const [isLoading, setIsLoading] = useState(true);
  const { setLoading } = useLoading();
  const [cableScheduleData, setCableScheduleData] = useState<any[]>([]);
  const [cableScheduleSavedData, setCableScheduleSavedData] = useState<any>([]);
  const [lpbsSchemes, setLpbsSchemes] = useState<any[]>([]);
  const [controlSchemes, setControlSchemes] = useState<any[]>([]);

  const [loadListData, setLoadListData] = useState<any[]>([]);
  const [cableTrayData, setCableTrayData] = useState<any>();
  const [projectData, setProjectData] = useState<any>();

  const fetchData = useCallback(async () => {
    if (!loadListLatestRevisionId) return;

    try {
      setIsLoading(true);

      const projectData = await getData(`${PROJECT_API}/${project_id}`);
      const projectDivision = projectData?.division;

      const division_name =
        projectDivision === WWS_SPG || projectDivision === WWS_SERVICES
          ? WWS_SPG
          : projectDivision;
      console.log(projectDivision);

      const lpbsResponse = await getData(
        `${LPBS_SCHEMES_URI}?filters=[["division_name", "=", "${division_name}"]]&fields=["*"]`
      );

      const loadList = await getData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
      );
      const savedCableSchedule = await getData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${cableScheduleRevisionId}`
      );
      const cableTrayData = await getData(
        `${CABLE_TRAY_LAYOUT}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const formattedData = getArrayOfCableScheduleData(
        loadList,
        savedCableSchedule,
        cableTrayData
      );
      try {
        setLoading(true);
        console.log(getApiEndpoint(division_name));

        const res = await getData(getApiEndpoint(division_name));
        let sortedSchemes;
        console.log(res, "control schemes data");
        if (projectDivision === WWS_SERVICES || projectDivision === WWS_SPG) {
          sortedSchemes = getSortedControlSchemes(res, projectDivision);
        } else if (projectDivision === ENVIRO) {
          sortedSchemes = getSortedControlSchemes(res, projectDivision);
        } else if (projectDivision === WWS_IPG) {
          sortedSchemes = getIPGSchemesData();
        } else if (projectDivision === HEATING) {
          sortedSchemes = res
            .map((item: any) => [
              false,
              item.scheme,
              item.sub_scheme,
              item.scheme_title,
              item.description,
              item.breaker,
              item.lpbs,
              item.lpbs_inc_dec_ind,
              item.ammeter,
              item.thermistor_relay,
              item.motor_space_heater,
              item.plc_current_signal,
              item.plc_speed_signal,
              item.olr,
              item.phase,
              item.limit_switch,
              item.motor_protection_relay,
              item.field_isolator,
              item.local_panel,
              item.field_ess,
              item.electronic_relay,
              item.plc1_and_plc2,
              item.mcc_start_stop,
              item.input_choke,
              item.output_choke,
              item.separate_plc_start_stop,
              item.di,
              item.do,
              item.ai,
              item.ao,
            ])
            .sort((a: any, b: any) => {
              const [prefixA, numA] = a[2].split("-");
              const [prefixB, numB] = b[2].split("-");
              return prefixA === prefixB
                ? parseInt(numA, 10) - parseInt(numB, 10)
                : prefixA.localeCompare(prefixB);
            });
        }

        setControlSchemes(sortedSchemes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching control schemes:", error);
        setLoading(false);
      }
      // getData(getApiEndpoint(projectDivision)).then((res) => {
      //   console.log(res);
      //   let sortedSchemes;
      //   if (
      //     projectDivision === WWS_SERVICES ||
      //     projectDivision === WWS_SPG
      //   ) {
      //     sortedSchemes = WWS_SPG_DATA;
      //   } else if (projectDivision === ENVIRO) {
      //     sortedSchemes = [
      //       ...Enviro_ControlSchemeDataDol,
      //       ...Enviro_ControlSchemeDataSD,
      //       ...Enviro_ControlSchemeDataVFD,
      //     ];
      //   } else if (projectDivision === WWS_IPG) {
      //     sortedSchemes = WWS_IPG_data;
      //   } else {
      //     sortedSchemes = res;
      //   }

      //   console.log(sortedSchemes, "control schemes sorted");

      //   setControlSchemes(sortedSchemes);
      //   setLoading(false);
      // });
      console.log(lpbsResponse, "lpbs schemes");
      setProjectData(projectData);
      setLpbsSchemes(lpbsResponse);
      setCableTrayData(cableTrayData[0]);
      setCableScheduleSavedData(savedCableSchedule);
      setLoadListData(loadList?.electrical_load_list_data);
      setCableScheduleData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
      setCableScheduleData([]);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [loadListLatestRevisionId, cableScheduleRevisionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    controlSchemes,
    lpbsSchemes,
    cableScheduleSavedData,
    cableTrayData,
    cableScheduleData,
    loadListData,
    projectData,
    isLoading,
    refetch: fetchData,
  };
};

const CableSchedule: React.FC<CableScheduleProps> = ({
  loadListLatestRevisionId,
  cableScheduleRevisionId,
  designBasisRevisionId,
}) => {
  const jRef = useRef<HTMLDivElement | null>(null);
  const [spreadsheetInstance, setSpreadsheetInstance] =
    useState<JspreadsheetInstance | null>(null);
  const { setLoading } = useLoading();
  const [iscableSizeFetched, setIscableSizeFetched] = useState(false);
  const [iscableScheduleSaved, setIscableScheduleSaved] = useState(false);

  const params = useParams();
  const [cableSizeCalcData, setCableSizeCalcData] = useState<any[]>([]);
  const router = useRouter();
  const userInfo: {
    division: string;
  } = useCurrentUser();

  const project_id = params.project_id as string;
  // const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);

  const [isMulticoreModalOpen, setIsMulticoreModalOpen] = useState(false);

  const {
    lpbsSchemes,
    controlSchemes,
    cableScheduleSavedData,
    cableTrayData,
    cableScheduleData,
    loadListData,
    projectData,
    isLoading,
    refetch,
  } = useDataFetching(
    designBasisRevisionId,
    loadListLatestRevisionId,
    cableScheduleRevisionId,
    project_id
  );
  const projectDivision = projectData?.division;

  const typedCableScheduleColumns = useMemo(
    () =>
      CableSchedulecolumns().map((column) => ({
        ...column,
        type: column.type as ValidColumnType,
      })),
    []
  );

  const typedMulticoreCableConfigColumns = useMemo(
    () =>
      multicoreCableConfigColumns.map((column) => ({
        ...column,
        type: column.type as ValidColumnType,
      })),
    []
  );

  const cableScheduleOptions = useMemo(
    () => ({
      data: cableScheduleData,
      license: "39130-64ebc-bd98e-26bc4",
      columns: typedCableScheduleColumns,
      columnSorting: true,
      columnDrag: true,
      columnResize: true,
      tableOverflow: true,
      lazyLoading: true,
      loadingSpin: true,
      tableWidth: "100%",
      tableHeight: "440px",
      freezeColumns: 6,
      rowResize: true,
    }),
    [typedCableScheduleColumns, cableScheduleData]
  );

  useEffect(() => {
    if (isLoading || !jRef.current) return;

    const initSpreadsheet = () => {
      if (spreadsheetInstance) {
        spreadsheetInstance.destroy();
      }

      const instance = jspreadsheet(jRef.current!, cableScheduleOptions);
      setSpreadsheetInstance(instance);
      setLoading(false);
    };

    initSpreadsheet();

    return () => {
      spreadsheetInstance?.destroy();
      localStorage.clear();
    };
  }, [isLoading, cableScheduleOptions]);
  const getCableType = (tag_number: any) => {
    const feeder = cableSizeCalcData?.find(
      (item: any) => item.tag_number == tag_number
    );
    return feeder ? feeder.type : "";
  };
  const getCableOd = (tag_number: any) => {
    const feeder = cableSizeCalcData?.find(
      (item) => item.tag_number == tag_number
    );
    return feeder ? feeder.cableOd : "";
  };
  const getCableGlandSize = (tag_number: any) => {
    const feeder = cableSizeCalcData?.find(
      (item) => item.tag_number == tag_number
    );
    return feeder ? feeder.gladSize : "";
  };
  const getOdLcs = (core: any, size: any) => {
    const od = lcs_od_gland_data.find(
      (item) => item[0] == core && item[3] == size
    );
    console.log("core checking", core, "size", size, "od", od);

    return od ? od[1] : 0;
  };
  const getGladSizeLcs = (core: any, size: any) => {
    const od = lcs_od_gland_data.find(
      (item) => item[0] == core && item[3] == size
    );
    return od ? od[2] : "";
  };
  const getControlSchemes = async () => {
    const res = await getData(getApiEndpoint(projectDivision));
    let sortedSchemes;
    console.log(res, "control schemes data");
    if (projectDivision === WWS_SERVICES || projectDivision === WWS_SPG) {
      sortedSchemes = getSortedControlSchemes(res, projectDivision);
    } else if (projectDivision === ENVIRO) {
      sortedSchemes = getSortedControlSchemes(res, projectDivision);
    } else if (projectDivision === WWS_IPG) {
      sortedSchemes = getIPGSchemesData();
    } else if (projectDivision === HEATING) {
      sortedSchemes = res
        .map((item: any) => [
          false,
          item.scheme,
          item.sub_scheme,
          item.scheme_title,
          item.description,
          item.breaker,
          item.lpbs,
          item.lpbs_inc_dec_ind,
          item.ammeter,
          item.thermistor_relay,
          item.motor_space_heater,
          item.plc_current_signal,
          item.plc_speed_signal,
          item.olr,
          item.phase,
          item.limit_switch,
          item.motor_protection_relay,
          item.field_isolator,
          item.local_panel,
          item.field_ess,
          item.electronic_relay,
          item.plc1_and_plc2,
          item.mcc_start_stop,
          item.input_choke,
          item.output_choke,
          item.separate_plc_start_stop,
          item.di,
          item.do,
          item.ai,
          item.ao,
        ])
        .sort((a: any, b: any) => {
          const [prefixA, numA] = a[2].split("-");
          const [prefixB, numB] = b[2].split("-");
          return prefixA === prefixB
            ? parseInt(numA, 10) - parseInt(numB, 10)
            : prefixA.localeCompare(prefixB);
        });
    }
    return sortedSchemes;
  };
  const handleCableScheduleSave = async () => {
     
    const data = spreadsheetInstance?.getData();
    
    const individualFeeders: any = data?.map((row: any) => {
      const division = projectDivision;
      const loadListItem = loadListData.find(
        (item: any) => item.tag_number === row[0]
      );

      const lpbsScheme = lpbsSchemes?.find(
        (item) => item.lpbs_type === loadListItem.lpbs_type
      );
      const controlScheme = controlSchemes?.find((item) =>
        division === HEATING
          ? loadListItem.control_scheme === item.sub_scheme
          : loadListItem.control_scheme === item.control_scheme
      );

      const isPresentInGrouping = false;
      const isSpaceHeater = loadListItem.space_heater === "Yes";
      const isThermister = loadListItem.thermistor === "Yes";
      console.log(cableSizeCalcData);

      const cables = [];
      const motorCable = {
        panel_name: loadListItem?.panel,
        starter_type: loadListItem?.starter_type,
        name: row[0] + " MOTOR",
        tag_number: row[0],
        service_description: row[1],
        voltage: row[6],
        kw: getStandByKw(row[2], row[3]),
        type_of_cable: `${`Power - ${getCableType(row[0])}`}`,
        scope: "",
        number_of_runs: row[9],
        pair_core: row[10],
        sizemm2: row[11],
        cable_material: row[12],
        type_of_insulation: "XLPE",
        appx_length: row[8],
        cable_od: getCableOd(row[0]),
        gland_size: getCableGlandSize(row[0]),
        gland_qty: (Number(row[9]) * 2).toString(),
        comment: "POWER TO MOTOR",
      };
      cables.push(motorCable);

      if (isSpaceHeater) {
        const spaceheaterCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          name: row[1] + " SPACE HEATER",
          voltage: "",
          tag_number: row[0],
          service_description: row[1],

          kw: "",
          type_of_cable: "Power - 2XFY",
          scope: "",
          number_of_runs: "1",
          pair_core: "3C",
          sizemm2: "2.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: "8.0 - 13mm",
          gland_size: "3/4″",
          gland_qty: "2",
          comment: "POWER TO SPACE HEATER",
        };
        cables.push(spaceheaterCable);
      }
      if (lpbsScheme?.lcs) {
        const lcsCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          name: row[1] + " LCS",
          tag_number: row[0],
          service_description: row[1],

          voltage: "",
          kw: "",
          type_of_cable: "Control - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: lpbsScheme.lcs,
          sizemm2: "1.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: getOdLcs(lpbsScheme.lcs, "1.5"),
          gland_size: getGladSizeLcs(lpbsScheme.lcs, "1.5"),
          gland_qty: "2",
          comment: "START & STOP COMMAND FROM LCS",
        };
        cables.push(lcsCable);
      }
      if (lpbsScheme?.lcs_inc_dec) {
        const lcsIncDecCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1], 
          name: row[1] + " LCS (INC/DEC)",
          voltage: "",
          kw: "",
          type_of_cable: "Control - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: lpbsScheme.lcs_inc_dec,
          sizemm2: "0.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: getOdLcs(lpbsScheme.lcs_inc_dec, "1.5"),
          gland_size: getGladSizeLcs(lpbsScheme.lcs_inc_dec, "1.5"),
          gland_qty: "2",
          comment: "START & STOP COMMAND FROM LCS (INC/DEC)",
        };
        cables.push(lcsIncDecCable);
      }
      if (lpbsScheme?.lcs_rpm) {
        const lcsRpmCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1], 
          name: row[1] + " LCS (RPM)",
          voltage: "",
          kw: "",
          type_of_cable: "Control - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: lpbsScheme.lcs_rpm,
          sizemm2: "0.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: "8.0 - 13mm",
          gland_size: "3/4″",
          gland_qty: "2",
          comment: "START & STOP COMMAND FROM LCS (RPM)",
        };
        cables.push(lcsRpmCable);
      }
      if (!isPresentInGrouping && controlScheme?.di) {
        const diCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1],

          name: "PLC (DI)",
          voltage: "",
          kw: "",
          type_of_cable: "Control - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: controlScheme.di * 2 + "C",
          sizemm2: "0.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: getOdLcs(controlScheme.di * 2 + "C", "0.5"),
          gland_size: getGladSizeLcs(controlScheme.di * 2 + "C", "0.5"),
          gland_qty: "2",
          comment: "RUN TRIP & L/R FEEDBACK",
        };
        cables.push(diCable);
      }
      if (!isPresentInGrouping && controlScheme?.do) {
        const doCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1],

          name: "PLC (DO)",
          voltage: "",
          kw: "",
          type_of_cable: "Control - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: controlScheme.do * 2 + "C",
          sizemm2: "1.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: getOdLcs(controlScheme.do * 2 + "C", "0.5"),
          gland_size: getGladSizeLcs(controlScheme.do * 2 + "C", "0.5"),
          gland_qty: "2",
          comment: "START/STOP COMMAND FROM PLC",
        };
        cables.push(doCable);
      }
      if (!isPresentInGrouping && controlScheme?.ai) {
        const aiCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1],

          name: "PLC (AI)",
          voltage: "",
          kw: "",
          type_of_cable: "Signal - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: controlScheme.ai + "P",
          sizemm2: "0.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: "8.0 - 13mm",
          gland_size: "3/4″",
          gland_qty: "2",
          comment: "SPEED REFERANCE",
        };
        cables.push(aiCable);
      }
      if (!isPresentInGrouping && controlScheme?.ao) {
        const aoCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1],

          name: "PLC (AO)",
          voltage: "",
          kw: "",
          type_of_cable: "Signal - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core: controlScheme.ao + "P",
          sizemm2: "0.5",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: "8.0 - 13mm",
          gland_size: "3/4″",
          gland_qty: "2",
          comment: "SPEED FEEDBACK",
        };
        cables.push(aoCable);
      }
      if (isThermister) {
        const thermisterCable = {
          panel_name: loadListItem?.panel,
          starter_type: "",
          tag_number: row[0],
          service_description: row[1],

          name: row[1] + " THERMISTER CABLE",
          voltage: "",
          kw: "",
          type_of_cable: "Control - 2XWY",
          scope: "",
          number_of_runs: "1",
          pair_core:
            division === HEATING ? "1P" : division === ENVIRO ? "3C" : "", // question for javed sir
          sizemm2:
            division === HEATING ? "0.5" : division === ENVIRO ? "1.5" : "",
          cable_material: "CU",
          type_of_insulation: "XLPE",
          appx_length: row[8],
          cable_od: "8.0 - 13mm",
          gland_size: "3/4″",
          gland_qty: "2",
          comment: "THERMISTER CABLE",
        };
        cables.push(thermisterCable);
      }

      return {
        motor_name: row[1] + ` (${row[0]}) `,
        cables: cables,
      };
    });

    const grouping: any = JSON.parse(
      localStorage.getItem("grouping_of_cables_table") as string
    );
    const groupPayload = [];
    if (grouping) {
      console.log(grouping);

      for (let i = 0; i < grouping.length; i++) {
        console.log(grouping[i]);
        const cableSchedule: any = data?.filter(
          (el) => el[1] === grouping[i][6].split(",")[0]
        )[0];
        const Di = grouping[i][4];
        const Do = grouping[i++][4];
        const Ai = grouping[i++][4];
        const Ao = grouping[i++][4];

        const cables: any[] = [];
        console.log(Di, Do, Ai, Ao, "DIDOAIAO");
        if (Di !== "-") {
          const diCable = {
            panel_name: grouping[i][7],
            starter_type: "",
            name: "PLC (DI)",
            voltage: "",
            kw: "",
            service_description: "",
            tag_number: "",

            type_of_cable: "Control - 2XWY",
            scope: "",
            number_of_runs: "1",
            pair_core: `${Di}` + "C",
            sizemm2: "0.5",
            cable_material: "CU",
            type_of_insulation: "XLPE",
            appx_length: cableSchedule[8],
            cable_od: getOdLcs(Di, "0.5"),
            gland_size: getGladSizeLcs(Di, "0.5"),
            gland_qty: "2",
            comment: "RUN TRIP & L/R FEEDBACK",
          };
          cables.push(diCable);
        }
        if (Do !== "-") {
          const doCable = {
            panel_name: grouping[i][7],
            starter_type: "",
            name: "PLC (DO)",
            voltage: "",
            service_description: "",
            tag_number: "",
            kw: "",
            type_of_cable: "Control - 2XWY",
            scope: "",
            number_of_runs: "1",
            pair_core: Do + "C",
            sizemm2: "1.5",
            cable_material: "CU",
            type_of_insulation: "XLPE",
            appx_length: cableSchedule[8],
            cable_od: getOdLcs(Do, "0.5"),
            gland_size: getGladSizeLcs(Do, "0.5"),
            gland_qty: "2",
            comment: "START/STOP COMMAND FROM PLC",
          };
          cables.push(doCable);
        }
        if (Ai !== "-") {
          const aiCable = {
            panel_name: grouping[i][7],
            starter_type: "",
            name: "PLC (AI)",
            voltage: "",
            service_description: "",
            tag_number: "",
            kw: "",
            type_of_cable: "Signal - 2XWY",
            scope: "",
            number_of_runs: "1",
            pair_core: Ai + "P",
            sizemm2: "0.5",
            cable_material: "CU",
            type_of_insulation: "XLPE",
            appx_length: cableSchedule[8],
            cable_od: "8.0 - 13mm",
            gland_size: "3/4″",
            gland_qty: "2",
            comment: "SPEED REFERANCE",
          };
          cables.push(aiCable);
        }
        if (Ao !== "-") {
          const aoCable = {
            panel_name: grouping[i][7],
            starter_type: "",
            name: "PLC (AO)",
            voltage: "",
            service_description: "",
            tag_number: "",
            kw: "",
            type_of_cable: "Signal - 2XWY",
            scope: "",
            number_of_runs: "1",
            pair_core: Ao + "P",
            sizemm2: "0.5",
            cable_material: "CU",
            type_of_insulation: "XLPE",
            appx_length: cableSchedule[8],
            cable_od: "8.0 - 13mm",
            gland_size: "3/4″",
            gland_qty: "2",
            comment: "SPEED FEEDBACK",
          };
          cables.push(aoCable);
        }
        groupPayload.push({
          motor_name: grouping[i][6],
          cables: cables,
        });
        i += 4;
      }
    }
    console.log(individualFeeders, "individual payload");
    console.log(groupPayload, "payload group");
    console.log({ ...individualFeeders, ...groupPayload }, "excel payload");

    const payload = {
      project_id: project_id,
      status: "Not Released",
      description: "test",
      cable_schedule_data: data?.map((row: any) => {
        const loadListItem = loadListData.find(
          (item: any) => item.tag_number === row[0]
        );
        return {
          tag_number: row[0],
          service_description: row[1],
          working_kw: Number(row[2]),
          standby_kw: Number(row[3]),
          kva: Number(row[4]),
          starter_type: row[5],
          supply_voltage: Number(row[6].split(" ")[0]),
          motor_rated_current: Number(row[7]),
          apex_length: parseFloat(row[8]),
          number_of_runs: Number(row[9]),
          number_of_cores: row[10],
          final_cable_size: row[11],
          cable_material: row[12],
          cable_size_heating_chart: row[13],
          cos_running: Number(row[14]),
          cos_starting: Number(row[15]),
          resistance_meter: parseFloat(row[16]),
          reactance_meter: parseFloat(row[17]),
          vd_running: parseFloat(row[18]),
          vd_starting: parseFloat(row[19]),
          percent_vd_running: parseFloat(row[20]),
          percent_vd_starting: parseFloat(row[21]),
          selected_cable_capacity_amp: parseFloat(row[22]),
          derating_factor: Number(row[23]),
          final_capacity: Number(row[24]),
          cable_selected_status: row[25],
          supply_phase: loadListItem?.phase,
          cable_od: getCableOd(row[0]),
          cable_od_heating_chart: getCableOd(row[0]),
          gland_size: getCableGlandSize(row[0]),
          gland_size_heating_chart: getCableGlandSize(row[0])
        };
      }),
      excel_payload: { ...individualFeeders, ...groupPayload },
    };
    try {
      console.log(payload, "cable schedule payload");

      const respose = await updateData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${cableScheduleRevisionId}`,
        false,
        payload
      );
      message.success("Cable Schedule Saved");

      console.log(respose, "Cable Schedule response");
    } catch (error) {
      console.error(error);
      message.error("Unable to save Cable Schedule");
    } finally {
      setLoading(false);
      setIscableSizeFetched(false);
      setIscableScheduleSaved(true);
    }
  };
  const getStandByKw = (item2: any, item3: any) => {
    if (item2 == 0) {
      return Number(item3);
    } else {
      return Number(item2);
    }
  };
  const getCableSizing = async () => {
    const cableScheduleData = spreadsheetInstance?.getData();
    const is_cable_length_empty = cableScheduleData?.some((item: any) => {
      if (item[8] === "" || item[8] === "0") {
        message.error(`Please Enter Cable Length for Feeder: ${item[0]}`);
        return true;
      }
      return false;
    });
    if (is_cable_length_empty) {
      return;
    }

    setLoading(true);
    console.log(cableTrayData, "cableTrayData");
    const cableSizeCalc = await getCableSizingCalculation({
      divisionName: userInfo.division,
      layoutCableTray: {
        motor_voltage_drop_during_running:
          cableTrayData?.motor_voltage_drop_during_running,
        motor_voltage_drop_during_starting:
          cableTrayData?.motor_voltage_drop_during_starting,
        copper_conductor: cableTrayData?.copper_conductor,
        aluminium_conductor: cableTrayData?.aluminium_conductor,
      },
      data: cableScheduleData?.map((row: any) => {
        return {
          tagNo: row[0],
          kw: getStandByKw(row[2], row[3]),
          starterType: row[5],
          supplyVoltage: Number(row[6].split(" ")[0]),
          motorRatedCurrent: Number(row[7]),
          appx_length: Number(row[8]),
          numberOfRuns: Number(row[9]),
          numberOfCores: row[10],
          cableMaterial: row[12],
          runningCos: Number(row[14]),
          startingCos: Number(row[15]),
          deratingFactor: Number(row[23]),
        };
      }),
    });
    console.log(cableSizeCalc, "cable size calculations");
    const sizingCalcData: any = [];

    const updatedCableSchedule: any = cableScheduleData?.map((row: any) => {
      const calculationResult = cableSizeCalc?.find(
        (item: any) => item.tagNo === row[0]
      );
      if (calculationResult) {
        const updatedRow = [...row];
        updatedRow[11] = calculationResult.sizes.includes("/")
          ? calculationResult.sizes
          : parseFloat(calculationResult.sizes).toFixed(1);
        updatedRow[12] = calculationResult.moc;
        updatedRow[13] = calculationResult.heating_chart_cable_size; //cable size as per heating value
        updatedRow[16] = calculationResult.dbl_r;
        updatedRow[17] = calculationResult.dbl_x;
        updatedRow[18] = calculationResult.vd_run;
        updatedRow[19] = calculationResult.vd_start;
        updatedRow[20] = calculationResult.vd_run_percentage;
        updatedRow[21] = calculationResult.vd_start_percentage;
        updatedRow[22] = calculationResult.current_air;
        updatedRow[24] = calculationResult.final_current_carrying_capacity;
        updatedRow[25] = calculationResult.final_current_carrying_capacity; 
        sizingCalcData.push({
          tag_number: calculationResult.tagNo,
          cableOd:
            calculationResult.od ?? calculationResult?.heating_chart_cable_od,
          gladSize: calculationResult?.heating_chart_cable_gland_size,
          type: calculationResult.cable_type,
        });

        return updatedRow;
      }

      return row;
    });
    console.log("updated calc", updatedCableSchedule);

    spreadsheetInstance?.setData(updatedCableSchedule);
    setCableSizeCalcData(sizingCalcData);
    setIscableSizeFetched(true);
    setLoading(false);
    message.success("Calculation Updated Successfully");

    // setLoadListData(updatedLoadList)
  };
  // handleDownloadVD
  const handleDownloadVD = async () => {
    setLoading(true);
    // console.log(revision_id)
    // console.log(getDownLoadEndpoint())

    try {
      const document_name = await getData(
        `${STATIC_DOCUMENT_API}?fields=["lt_cable_sizing"]&filters=[["project_id", "=", "${project_id}"]]`
      );
      const base64Data: any = await downloadFile(
        GET_VOLTAGE_DROP_EXCEL_API,
        true,
        {
          revision_id: cableScheduleRevisionId,
        }
      );

      // Create a Blob from the Base64 string
      const binaryData = Buffer.from(base64Data, "base64");
      const blob = new Blob([binaryData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const name = document_name[0]?.lt_cable_sizing + "_LT Cable Sizing";
      const filename = `${name}.xlsx`;

      link.download = filename.replace(/"/g, ""); // Remove quotes if present

      link.click();
    } catch (error) {
      console.error(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        {cableScheduleSavedData?.modified && (
          <h3 className="italic text-gray-500 text-sm pr-2">
            last modified:{" "}
            {convertToFrappeDatetime(
              new Date(cableScheduleSavedData?.modified)
            )}
          </h3>
        )}
      </div>
      <div className="mb-4 flex justify-end gap-4">
        <Button
          type="primary"
          onClick={() => setIsMulticoreModalOpen(true)}
          className="hover:bg-blue-600"
          size="small"
        >
          Multicore Cable Configurator
        </Button>
      </div>

      <div className="m-2 flex flex-col overflow-auto">
        {isLoading ? (
          <div className="flex h-[550px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : (
          <div ref={jRef} />
        )}
      </div>

      <MulticoreCableConfigurator
        isOpen={isMulticoreModalOpen}
        onClose={() => setIsMulticoreModalOpen(false)}
        loadListData={loadListData}
        typedMulticoreCableColumns={typedMulticoreCableConfigColumns}
        onConfigurationComplete={(selectedCables: any) => {
          console.log("Selected cables:", selectedCables);
        }}
      />

      <div className="flex w-full flex-row justify-end gap-2">
        <Button
          type="primary"
          onClick={getCableSizing}
          // disabled={iscableSizeFetched}
          size="small"
        >
          Get Cable Sizing
        </Button>
        <Button
          type="primary"
          onClick={handleDownloadVD}
          size="small"
          disabled={!iscableScheduleSaved}
        >
          Download Voltage Drop Calculations
        </Button>

        <Button
          size="small"
          type="primary"
          onClick={handleCableScheduleSave}
          disabled={isLoading}
        >
          Save
        </Button>
        <Button
          size="small"
          type="primary"
          onClick={() => {
            setLoading(true);
            router.push(
              `/project/${project_id}/electrical-load-list/motor-canopy`
            );
          }}
          disabled={isLoading}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default CableSchedule;
