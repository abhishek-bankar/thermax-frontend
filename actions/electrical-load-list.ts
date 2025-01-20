"use server";

import {
  DB_REVISION_STATUS,
  HEATING,
  LOAD_LIST_REVISION_STATUS,
} from "@/configs/constants";
import { createData, getData, updateData } from "./crud-actions";
import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  CABLE_SIZE_HEATING_API,
  CABLE_SIZING_DATA_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  HEATING_SWITCHGEAR_HEATER_API,
  LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
  LOCAL_ISOLATOR_REVISION_HISTORY_API,
  MOTOR_CANOPY_METADATA,
  MOTOR_CANOPY_REVISION_HISTORY_API,
  MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";

export const getCurrentCalculation = async (loadListData: any) => {
  const division = loadListData.divisionName;
  const calcData = loadListData.data;
  const cableSizingHeatingData = await getData(
    `${CABLE_SIZE_HEATING_API}?fields=["*"]&limit=1000`
  );
  const heatingSwitchgearHeaterData = await getData(
    `${HEATING_SWITCHGEAR_HEATER_API}?fields=["*"]&limit=1000`
  );

  const calculatedData = calcData.map((item: any) => {
    const kw = item.kw;
    const supplyVoltage = item.supplyVoltage;
    const phase = item.phase;
    const powerFactor = item.powerFactor;
    const starterType = item.starterType;
    let current = 0;

    if (division === HEATING) {
      if (
        starterType === "DOL-HTR" &&
        supplyVoltage === 415 &&
        phase === "3 Phase"
      ) {
        const standardCurrent = heatingSwitchgearHeaterData.find(
          (data: any) => data.kw === kw
        );
        if (standardCurrent) {
          current = standardCurrent.fla;
        } else {
          current = (kw * 1000) / (Math.sqrt(3) * supplyVoltage * powerFactor);
        }
      } else if (supplyVoltage === 415 && phase === "3 Phase") {
        const standardCurrent = cableSizingHeatingData.find(
          (data: any) => data.kw === kw && data.voltage === supplyVoltage
        );
        if (standardCurrent) {
          current = standardCurrent.motor_current_amp_il;
        } else {
          current = (kw * 1000) / (Math.sqrt(3) * supplyVoltage * powerFactor);
        }
      } else if (supplyVoltage !== 415 && phase === "3 Phase") {
        current = (kw * 1000) / (Math.sqrt(3) * supplyVoltage * powerFactor);
      } else if (phase === "1 Phase") {
        current = (kw * 1000) / (supplyVoltage * powerFactor);
      }
    } else {
      if (starterType === "DOL-HTR" && supplyVoltage === 415) {
        const standardCurrent = heatingSwitchgearHeaterData.find(
          (data: any) => data.kw === kw
        );
        if (standardCurrent) {
          current = standardCurrent.fla;
        } else {
          current = (kw * 1000) / (Math.sqrt(3) * supplyVoltage * powerFactor);
        }
      } else if (phase === "3 Phase") {
        // current = (kw * 1000) / (Math.sqrt(3) * supplyVoltage * powerFactor)
        current = (kw * 1000) / (Math.sqrt(3) * supplyVoltage * powerFactor);
      } else if (phase === "1 Phase") {
        current = (kw * 1000) / (supplyVoltage * powerFactor);
      }
    }

    return {
      ...item,
      motorRatedCurrent: current.toFixed(2),
    };
  });

  return calculatedData;
};

export const getLatestLoadlistRevision = async (projectId: string) => {
  const dbRevisionData = await getData(
    `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}?filters=[["project_id", "=", "${projectId}"], ["status", "in", ["${LOAD_LIST_REVISION_STATUS.NotReleased}"]]]&fields=["*"]&order_by=creation desc`
  );

  return dbRevisionData;
};

export const getLatestCableScheduleRevision = async (projectId: string) => {
  const dbRevisionData = await getData(
    `${CABLE_SCHEDULE_REVISION_HISTORY_API}?filters=[["project_id", "=", "${projectId}"], ["status", "in", ["${LOAD_LIST_REVISION_STATUS.NotReleased}"]]]&fields=["*"]&order_by=creation desc`
  );

  return dbRevisionData;
};
export const getAllSldRevisions = async (projectId: string) => {
  // ["status", "in", ["${LOAD_LIST_REVISION_STATUS.NotReleased}"]]
  const dbRevisionData = await getData(
    `${SLD_REVISIONS_API}?filters=[["project_id", "=", "${projectId}"]]&fields=["*"]&order_by=creation desc`
  );

  return dbRevisionData;
};
export const getLatestMotorCanopyRevision = async (projectId: string) => {
  const dbRevisionData = await getData(
    `${MOTOR_CANOPY_REVISION_HISTORY_API}?filters=[["project_id", "=", "${projectId}"], ["status", "in", ["${LOAD_LIST_REVISION_STATUS.NotReleased}"]]]&fields=["*"]&order_by=creation desc`
  );

  return dbRevisionData;
};
export const getFrameSizeCalculation = async (loadListData: any) => {
  const division = loadListData.divisionName;
  const calcData = loadListData.data;

  const motorCanopyListMetadata = await getData(
    `${MOTOR_CANOPY_METADATA}?fields=["*"]&limit=1000`
  );
  if (division === HEATING) {
    return calcData;
  } else {
    const calculatedData = calcData?.map((item: any) => {
      const kw = item.kw;
      const speed = item.speed;
      const moutingType = item.mounting_type;

      const filteredFrameSize = motorCanopyListMetadata.filter(
        (data: any) =>
          data.speed === speed && data.mounting_type === moutingType
      );

      if (filteredFrameSize.length === 0) {
        // If no data is available, return empty frameSize
        return {
          ...item,
          frameSize: "",
        };
      }

      const filteredKWs = filteredFrameSize
        .map((data: any) => data.kw)
        .sort((a: any, b: any) => a - b);

      const sameSizeKw = filteredFrameSize.find((data: any) => data.kw === kw);
      if (sameSizeKw) {
        return {
          ...item,
          frameSize: sameSizeKw.frame_size,
        };
      }

      const nextHigherKw = filteredKWs.find((value: number) => value > kw);

      if (nextHigherKw) {
        // Find the frame size for the next higher `kw`
        const nextHigherKwFrame = filteredFrameSize.find(
          (data: any) => data.kw === nextHigherKw
        );
        return {
          ...item,
          frameSize: nextHigherKwFrame ? nextHigherKwFrame.frame_size : "",
        };
      }

      return {
        ...item,
        frameSize: "",
      };
    });
    return calculatedData;
  }
};

export const motorCanopyCalculation = async (loadListData: any) => {
  const motorCanopyListMetadata = await getData(
    `${MOTOR_CANOPY_METADATA}?fields=["*"]&limit=1000`
  );
  const calculatedData = loadListData.data.map((item: any) => {
    const kw = item.kw;
    const speed = item.rpm;
    const moutingType = item.mounting_type;

    const filteredFrameSize = motorCanopyListMetadata.filter(
      (data: any) => data.speed === speed && data.mounting_type === moutingType
    );

    if (filteredFrameSize.length === 0) {
      return {
        ...item,
        canopy_model_number: "",
        canopy_leg_length: "",
        canopy_cut_out: "",
        part_code: "",
      };
    }

    const filteredKWs = filteredFrameSize
      .map((data: any) => data.kw)
      .sort((a: any, b: any) => a - b);

    const sameSizeKw = filteredFrameSize.find((data: any) => data.kw === kw);
    if (sameSizeKw) {
      return {
        ...item,
        canopy_model_number: sameSizeKw.model,
        canopy_leg_length: sameSizeKw.leg_length,
        canopy_cut_out: sameSizeKw.cut_out,
        part_code: sameSizeKw.canopy_model_number,
        description: sameSizeKw.description,
      };
    }

    const nextHigherKw = filteredKWs.find((value: number) => value > kw);

    if (nextHigherKw) {
      // Find the frame size for the next higher `kw`
      const nextHigherKwFrame = filteredFrameSize.find(
        (data: any) => data.kw === nextHigherKw
      );
      return {
        ...item,
        canopy_model_number: nextHigherKwFrame.model,
        canopy_leg_length: nextHigherKwFrame.leg_length,
        canopy_cut_out: nextHigherKwFrame.cut_out,
        part_code: nextHigherKwFrame.canopy_model_number,
        description: nextHigherKwFrame.description,
      };
    }

    return {
      ...item,
      canopy_model_number: "",
      canopy_leg_length: "",
      canopy_cut_out: "",
      part_code: "",
    };
  });

  return calculatedData;
};

const findCableHeatingUpto100M = (
  cableAsPerHeatingChart: any,
  kw: number,
  supplyVoltage: number,
  phase: string,
  starterType: string,
  cableMaterial: string,
  numberOfCores: number,
  copper_conductor: number
) => {
  const cables = cableAsPerHeatingChart.filter(
    (data: any) =>
      data.voltage === supplyVoltage &&
      data.starter === starterType &&
      data.material === cableMaterial &&
      data.no_of_runs_core === `${numberOfCores}C`
  );
  const sortedByKW = cables?.sort((a: any, b: any) => a.kw - b.kw);

  const cable = sortedByKW.find((item: any) => item.kw >= kw);
  let cabel_size = "";
  let cabel_od = "";
  let cabel_gland_size = "";
  if (cable) {
    if (Object.keys(cable).length > 0) {
      let size = cable.size;
      if (size && size.includes("/")) {
        size = size.split("/")[0];
        cabel_od = size.approx_cable_od;
        cabel_gland_size = size.et;
      }

      const sizeNumber = +parseFloat(size).toFixed(2);
      if (sizeNumber <= copper_conductor) {
        cabel_size = cable.size;
      } else {
        const cables = cableAsPerHeatingChart.filter(
          (data: any) =>
            data.voltage === supplyVoltage &&
            data.starter === starterType &&
            data.material === "Aluminium" &&
            data.no_of_runs_core === `${numberOfCores}C`
        );
        const sortedByKW = cables?.sort((a: any, b: any) => a.kw - b.kw);

        const cable = sortedByKW.find((item: any) => item.kw >= kw);
        if (cable) {
          cabel_size = cable.size;
          cabel_od = size.approx_cable_od;
          cabel_gland_size = size.et;
        }
      }
    }
  }

  // return cable ? cable.size : "";
  return { cabel_size, cabel_od, cabel_gland_size };
};

const findCable = (
  cableSizeData: any,
  row: any,
  layoutCableTray: any,
  division: string,
  cableAsPerHeatingChart: any
) => {
  const kw: number = +parseFloat(row.kw).toFixed(2);
  const supplyVoltage: number = row.supplyVoltage;
  const appxLength: number = +parseFloat(row.appx_length).toFixed(2);
  const phase = row.phase;
  const starterType = row.starterType;
  const cableMaterial = row.cableMaterial;
  const numberOfCores = parseFloat(row.numberOfCores.replace(/[^\d.]/g, ""));
  const numberOfRuns = parseInt(row.numberOfRuns);
  // const efficiency = 0.86
  const cosPhiRunning: number = row.runningCos;
  const sinPhiRunning = +Math.sqrt(1 - cosPhiRunning ** 2).toFixed(2);
  const cosPhiStarting: number = row.startingCos;
  const sinPhiStarting = +Math.sqrt(1 - cosPhiStarting ** 2).toFixed(2);
  const motorRatedCurrent: number = +parseFloat(row.motorRatedCurrent).toFixed(
    2
  );
  const deratingFactor: number = +parseFloat(row.deratingFactor).toFixed(2);
  const tagNo = row.tagNo;

  const perc_voltage_drop_running = +parseFloat(
    layoutCableTray.motor_voltage_drop_during_running
  ).toFixed(2);
  const perc_voltage_drop_starting = +parseFloat(
    layoutCableTray.motor_voltage_drop_during_starting
  ).toFixed(2);

  let motorStartingCurrent = 0;

  if (starterType === "DOL STARTER") {
    motorStartingCurrent = +(motorRatedCurrent * 7.5).toFixed(2);
  } else if (starterType === "Supply Feeder") {
    motorStartingCurrent = motorRatedCurrent;
  } else {
    motorStartingCurrent = +(motorRatedCurrent * 3).toFixed(2);
  }

  let finalCable = {};
  for (const cable of cableSizeData) {
    if (
      cable.current_air >= motorRatedCurrent &&
      cable.number_of_core === numberOfCores
    ) {
      const dbl_x = +parseFloat(cable.dbl_x).toFixed(2);
      const dbl_r = +parseFloat(cable.dbl_r).toFixed(2);

      const vd_run = +(
        (1.732 *
          motorRatedCurrent *
          appxLength *
          (cosPhiRunning * dbl_r + sinPhiRunning * dbl_x)) /
        numberOfRuns /
        1000
      ).toFixed(2);
      const vd_start = +(
        (1.732 *
          motorStartingCurrent *
          appxLength *
          (cosPhiStarting * dbl_r + sinPhiStarting * dbl_x)) /
        numberOfRuns /
        1000
      ).toFixed(2);

      const vd_run_percentage = +((vd_run / supplyVoltage) * 100).toFixed(2);
      const vd_start_percentage = +((vd_start / supplyVoltage) * 100).toFixed(
        2
      );
      const final_current_carrying_capacity = +(
        cable.current_air *
        deratingFactor *
        numberOfRuns
      ).toFixed(2);

      if (
        vd_run_percentage <= perc_voltage_drop_running &&
        vd_start_percentage <= perc_voltage_drop_starting
      ) {
        finalCable = {
          ...cable,
          vd_run,
          vd_start,
          vd_run_percentage,
          vd_start_percentage,
          final_current_carrying_capacity,
          tagNo,
        };
        break; // Stop iterating once a suitable cable is found.
      }
    }
  }
  let heating_chart_cable_size = "";
  let heating_chart_cable_od = "";
  let heating_chart_cable_gland_size = "";
  if (division === HEATING && appxLength <= 100 && supplyVoltage === 415) {
    const result = findCableHeatingUpto100M(
      cableAsPerHeatingChart,
      kw,
      supplyVoltage,
      phase,
      starterType,
      cableMaterial,
      numberOfCores,
      layoutCableTray?.copper_conductor
    );
    heating_chart_cable_size = result.cabel_size;
    heating_chart_cable_od = result.cabel_od;
    heating_chart_cable_gland_size = result.cabel_gland_size;
  }
  return {
    ...finalCable,
    heating_chart_cable_size,
    heating_chart_cable_od,
    heating_chart_cable_gland_size,
  };
};

export const getCableSizingCalculation = async (cableScheduleData: any) => {
  const division = cableScheduleData.divisionName;
  const cableScheduleRows = cableScheduleData.data;
  const layoutCableTray = cableScheduleData.layoutCableTray;
  const cableAsPerHeatingChart = await getData(
    `${CABLE_SIZE_HEATING_API}?fields=["*"]&limit=3000`
  );
  const cableSizingData = await getData(
    `${CABLE_SIZING_DATA_API}?fields=["*"]&limit=3000`
  );

  const copperCableSize = cableSizingData
    .filter((data: any) => data.moc === "Copper")
    .sort((a: any, b: any) => a.current_air - b.current_air);
  const aluminiumCableSize = cableSizingData
    .filter((data: any) => data.moc === "Aluminium")
    .sort((a: any, b: any) => a.current_air - b.current_air);

  const calculatedData = cableScheduleRows?.map((row: any) => {
    let finalCable: any = {};

    const copperConductor = layoutCableTray.copper_conductor;
    const aluminiumConductor = layoutCableTray.aluminium_conductor;

    if (copperConductor === "All") {
      finalCable = findCable(
        copperCableSize,
        row,
        layoutCableTray,
        division,
        cableAsPerHeatingChart
      );
      return { ...finalCable };
    }

    if (aluminiumConductor === "All") {
      finalCable = findCable(
        aluminiumCableSize,
        row,
        layoutCableTray,
        division,
        cableAsPerHeatingChart
      );
      return { ...finalCable };
    }

    const copper_conductor = +parseFloat(
      layoutCableTray.copper_conductor
    ).toFixed(2);

    if (copper_conductor <= 4) {
      finalCable = findCable(
        copperCableSize,
        row,
        layoutCableTray,
        division,
        cableAsPerHeatingChart
      );

      if (Object.keys(finalCable).length > 0) {
        let size = finalCable.sizes;
        // Handle cases with slash-separated values
        if (size && size.includes("/")) {
          size = size.split("/")[0]; // Take the first part before the slash
        }

        // Convert to a number
        const sizeNumber = +parseFloat(size).toFixed(2);
        if (sizeNumber <= copper_conductor) {
          finalCable = finalCable;
        } else {
          finalCable = findCable(
            aluminiumCableSize,
            row,
            layoutCableTray,
            division,
            cableAsPerHeatingChart
          );
        }
      }
    } else {
      finalCable = findCable(
        aluminiumCableSize,
        row,
        layoutCableTray,
        division,
        cableAsPerHeatingChart
      );
    }

    return { ...finalCable };
  });

  return calculatedData;
};

export const copyRevision = async (payload: any) => { 
  const old_revision_id = payload.revision_id;
  const clone_note = payload.clone_notes;
  const module_name = payload.module_name;
  const copy_load_list = async () => {
    try {
      const existing_load_list_data = await getData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${old_revision_id}`
      );
      const new_load_list_revision = {
        status: LOAD_LIST_REVISION_STATUS.NotReleased,
        project_id: existing_load_list_data.project_id,
        electrical_load_list_data:
          existing_load_list_data.electrical_load_list_data,
        clone_note,
      };
      const response = await createData(
        ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
        false,
        new_load_list_revision
      ); 
      if (response) {
        await updateData(
          `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${old_revision_id}`,
          false,
          {
            is_copied: 1,
          }
        );
      }
    } catch (error) {}
  };
  const copy_cable_schedule = async () => {
    try {
      const existing_cable_schedule_data = await getData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${old_revision_id}`
      );
      const new_cable_schedule_revision = {
        status: LOAD_LIST_REVISION_STATUS.NotReleased,
        project_id: existing_cable_schedule_data.project_id,
        cable_schedule_data: existing_cable_schedule_data.cable_schedule_data,
        clone_note,
        excel_payload: existing_cable_schedule_data.excel_payload,
      };
      console.log(existing_cable_schedule_data);

      const response = await createData(
        CABLE_SCHEDULE_REVISION_HISTORY_API,
        false,
        new_cable_schedule_revision
      ); 
      if (response) {
        await updateData(
          `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${old_revision_id}`,
          false,
          {
            is_copied: 1,
          }
        );
      }
    } catch (error) {}
  };
  const copy_motor_canopy = async () => {
    try {
      const existing_motor_canopy = await getData(
        `${MOTOR_CANOPY_REVISION_HISTORY_API}/${old_revision_id}`
      );
      const new_motor_canopy_revision = {
        status: LOAD_LIST_REVISION_STATUS.NotReleased,
        project_id: existing_motor_canopy.project_id,
        motor_canopy_data: existing_motor_canopy.motor_canopy_data,
        clone_note,
      }; 

      const response = await createData(
        MOTOR_CANOPY_REVISION_HISTORY_API,
        false,
        new_motor_canopy_revision
      ); 
      if (response) {
        await updateData(
          `${MOTOR_CANOPY_REVISION_HISTORY_API}/${old_revision_id}`,
          false,
          {
            is_copied: 1,
          }
        ); 
      }
    } catch (error) {}
  };
  const copy_motor_specs = async () => {
    try {
      const existing_motor_specs = await getData(
        `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}/${old_revision_id}`
      );
      const new_motor_specs_revision = {
        status: LOAD_LIST_REVISION_STATUS.NotReleased,
        project_id: existing_motor_specs.project_id,
        clone_note,
        is_safe_area_selected: existing_motor_specs.is_safe_area_selected,
        is_hazardous_area_selected:
          existing_motor_specs.is_hazardous_area_selected,
        motor_specification_data: existing_motor_specs.motor_specification_data,
        motor_details_data: existing_motor_specs.motor_details_data,
      }; 

      const response = await createData(
        MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
        false,
        new_motor_specs_revision
      ); 
      if (response) {
        await updateData(
          `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}/${old_revision_id}`,
          false,
          {
            is_copied: 1,
          }
        ); 
      }
    } catch (error) {}
  };
  const copy_lpbs_specs = async () => {
    try {
      const existing_lpbs_specs = await getData(
        `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}/${old_revision_id}`
      );
      const new_lpbs_specs_revision = {
        status: LOAD_LIST_REVISION_STATUS.NotReleased,
        project_id: existing_lpbs_specs.project_id,
        clone_note,
        is_safe_lpbs_selected: existing_lpbs_specs.is_safe_lpbs_selected,
        is_hazardous_lpbs_selected:
          existing_lpbs_specs.is_hazardous_lpbs_selected,
        lpbs_specification_data: existing_lpbs_specs.lpbs_specification_data,
        lpbs_specifications_motor_details: existing_lpbs_specs.lpbs_specifications_motor_details,
      }; 

      const response = await createData(
        LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
        false,
        new_lpbs_specs_revision
      ); 
      if (response) {
        await updateData(
          `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}/${old_revision_id}`,
          false,
          {
            is_copied: 1,
          }
        ); 
      }
    } catch (error) {}
  };
  const copy_local_isolator = async () => {
    try {
      const existing_local_isolator = await getData(
        `${LOCAL_ISOLATOR_REVISION_HISTORY_API}/${old_revision_id}`
      );
      const new_local_isolator_revision = {
        status: LOAD_LIST_REVISION_STATUS.NotReleased,
        project_id: existing_local_isolator.project_id,
        clone_note,
        is_safe_area_isolator_selected: existing_local_isolator.is_safe_area_isolator_selected,
        is_hazardous_area_isolator_selected:
          existing_local_isolator.is_hazardous_area_isolator_selected,
          local_isolator_data: existing_local_isolator.local_isolator_data,
        local_isolator_motor_details_data: existing_local_isolator.local_isolator_motor_details_data,
      }; 

      const response = await createData(
        LOCAL_ISOLATOR_REVISION_HISTORY_API,
        false,
        new_local_isolator_revision
      ); 
      if (response) {
        await updateData(
          `${LOCAL_ISOLATOR_REVISION_HISTORY_API}/${old_revision_id}`,
          false,
          {
            is_copied: 1,
          }
        ); 
      }
    } catch (error) {}
  };
  if (module_name === "load-list") {
    copy_load_list();
  }
  if (module_name === "cable-schedule") {
    copy_cable_schedule();
  }
  if (module_name === "motor-canopy") {
    copy_motor_canopy();
  }
  if (module_name === "motor-specs") {
    copy_motor_specs();
  }
  if (module_name === "lpbs-specs") {
    copy_lpbs_specs();
  }
  if (module_name === "local-isolator") {
    copy_local_isolator();
  }
};
