"use client";

import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { updateData } from "@/actions/crud-actions";
import CustomTextInput from "@/components/FormInputs/CustomInput";
import CustomRadioSelect from "@/components/FormInputs/CustomRadioSelect";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import CustomTextAreaInput from "@/components/FormInputs/CustomTextArea";
import {
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  PROJECT_API,
  PROJECT_MAIN_PKG_LIST_API,
} from "@/configs/api-endpoints";
import { useGetData, useNewGetData } from "@/hooks/useCRUD";
import useCommonConfigDropdowns from "./CommonConfigDropdowns";
import { configItemValidationSchema } from "../schemas";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { WWS_SPG } from "@/configs/constants";
import {
  moveNAtoEnd,
  parseToArray,
  sortAlphaNumericArray,
  sortDropdownOptions,
} from "@/utils/helpers";
import { useParams } from "next/navigation";
import CustomMultiSelect from "@/components/FormInputs/CustomMultiSelect";

const getDefaultValues = (commonConfigData: any, mainPkgData: any) => {
  return {
    rtd_thermocouple_wiring_color:
      commonConfigData?.rtd_thermocouple_wiring_color?.toString() ||
      "Brown, White Shielded Cable",
    rtd_thermocouple_wiring_size:
      commonConfigData?.rtd_thermocouple_wiring_size?.toString() || "1 Sq. mm",
    is_field_motor_isolator_selected:
      commonConfigData?.is_field_motor_isolator_selected?.toString() || "1",
    is_safe_area_isolator_selected:
      commonConfigData?.is_safe_area_isolator_selected?.toString() || "1",
    is_hazardous_area_isolator_selected:
      commonConfigData?.is_hazardous_area_isolator_selected?.toString() || "1",
    is_local_push_button_station_selected:
      commonConfigData?.is_local_push_button_station_selected?.toString() ||
      "1",
    is_safe_lpbs_selected:
      commonConfigData?.is_safe_lpbs_selected?.toString() || "1",
    is_hazardous_lpbs_selected:
      commonConfigData?.is_hazardous_lpbs_selected?.toString() || "1",

    dol_starter: commonConfigData?.dol_starter || "0.37",
    star_delta_starter: commonConfigData?.star_delta_starter || "0.55",
    ammeter: commonConfigData?.ammeter || "0.37",
    ammeter_configuration:
      commonConfigData?.ammeter_configuration || "All Phase With CT",
    mcc_switchgear_type:
      commonConfigData?.mcc_switchgear_type ||
      "Type II Coordination-Fuseless-One Size Higher",
    switchgear_combination:
      commonConfigData?.switchgear_combination || "Without MCB",

    is_control_transformer_applicable:
      commonConfigData?.is_control_transformer_applicable?.toString() || "1",
    control_transformer_primary_voltage:
      commonConfigData?.control_transformer_primary_voltage ||
      "230 VAC, 1-Phase, 2 wire",
    control_transformer_secondary_voltage_copy:
      commonConfigData?.control_transformer_secondary_voltage_copy ||
      "230 VAC, 1-Phase, 2 wire",
    control_transformer_coating:
      commonConfigData?.control_transformer_coating || "Tape Wound",
    control_transformer_quantity:
      commonConfigData?.control_transformer_quantity || "One",
    control_transformer_configuration:
      commonConfigData?.control_transformer_configuration || "Single",
    control_transformer_type:
      commonConfigData?.control_transformer_type ||
      "Industrial control Step down transformer",

    digital_meters: commonConfigData?.digital_meters
      ? parseToArray(commonConfigData?.digital_meters)
      : ["NA"],
    analog_meters: commonConfigData?.analog_meters
      ? parseToArray(commonConfigData?.analog_meters)
      : ["Ammeter with ASS"],
    communication_protocol: commonConfigData?.communication_protocol || "NA",

    current_transformer: commonConfigData?.current_transformer || "0.37",
    current_transformer_coating:
      commonConfigData?.current_transformer_coating || "Cast Resin",
    current_transformer_quantity:
      commonConfigData?.current_transformer_quantity || "One",
    current_transformer_configuration:
      commonConfigData?.current_transformer_configuration || "Y-Phase with CT",

    pole: commonConfigData?.pole || "4 POLE",
    supply_feeder_standard: commonConfigData?.supply_feeder_standard || "IEC",
    dm_standard: commonConfigData?.dm_standard || "IEC 61439",
    // testing_standard: commonConfigData?.testing_standard || "IEC 61439",
    power_wiring_color:
      commonConfigData?.power_wiring_color || "Brown, Black, Grey, Blue",

    power_wiring_size: commonConfigData?.power_wiring_size || "Min. 2.5 Sq. mm",
    control_wiring_color:
      commonConfigData?.control_wiring_color || "Grey, Black",
    control_wiring_size: commonConfigData?.control_wiring_size || "1 Sq. mm",
    vdc_24_wiring_color:
      commonConfigData?.vdc_24_wiring_color || "Orange, White",
    vdc_24_wiring_size: commonConfigData?.vdc_24_wiring_size || "0.75 Sq. mm",
    analog_signal_wiring_color:
      commonConfigData?.analog_signal_wiring_color ||
      "Brown, White Shielded Cable",
    analog_signal_wiring_size:
      commonConfigData?.analog_signal_wiring_size || "1 Sq. mm",
    ct_wiring_color:
      commonConfigData?.ct_wiring_color || "Red, Yellow, Blue, Black",
    ct_wiring_size: commonConfigData?.ct_wiring_size || "2.5 Sq. mm",
    cable_insulation_pvc:
      commonConfigData?.cable_insulation_pvc || "Fire Resistant",
    air_clearance_between_phase_to_phase_bus:
      commonConfigData?.air_clearance_between_phase_to_phase_bus || "25mm",
    air_clearance_between_phase_to_neutral_bus:
      commonConfigData?.air_clearance_between_phase_to_neutral_bus || "19mm",
    ferrule: commonConfigData?.ferrule || "Cross Ferrule",
    ferrule_note:
      commonConfigData?.ferrule_note ||
      "Printed Ferrules-Black Letters On White Sleeves",
    device_identification_of_components:
      commonConfigData?.device_identification_of_components ||
      "PVC sticker with black letters",
    general_note_internal_wiring:
      commonConfigData?.general_note_internal_wiring || "Not Applicable",

    common_requirement:
      commonConfigData?.common_requirement ||
      "660/1100 V Grade PVC insulated, FR/FRLS, Multistranded, Copper, Flexible cable identified with colour code",
    power_terminal_clipon:
      commonConfigData?.power_terminal_clipon || "Min.4 Sq.mm Clipon Type",
    power_terminal_busbar_type:
      commonConfigData?.power_terminal_busbar_type ||
      "Above 4 sq.mm Busbar Type",
    control_terminal:
      commonConfigData?.control_terminal || "Min.4 Sq.mm Clipon Type",
    spare_terminal: commonConfigData?.spare_terminal || "10",
    forward_push_button_start:
      commonConfigData?.forward_push_button_start || "Yellow",
    reverse_push_button_start:
      commonConfigData?.reverse_push_button_start || "Yellow",
    push_button_start: commonConfigData?.push_button_start || "Green",
    push_button_stop: commonConfigData?.push_button_stop || "Green",
    push_button_ess:
      commonConfigData?.push_button_ess ||
      "Mushroom headed Stayput ( Key to release) Red Colour",
    potentiometer: commonConfigData?.potentiometer || "0",
    is_push_button_speed_selected:
      commonConfigData?.is_push_button_speed_selected?.toString() || "1",
    speed_increase_pb: commonConfigData?.speed_increase_pb || "Yellow",
    speed_decrease_pb: commonConfigData?.speed_decrease_pb || "Black",
    alarm_acknowledge_and_lamp_test:
      commonConfigData?.alarm_acknowledge_and_lamp_test || "Black",
    lamp_test_push_button: commonConfigData?.lamp_test_push_button || "NA",
    test_dropdown: commonConfigData?.test_dropdown || "Yellow",
    reset_dropdown: commonConfigData?.reset_dropdown || "Black",
    selector_switch_applicable:
      commonConfigData?.selector_switch_applicable || "Not Applicable",
    selector_switch_lockable:
      commonConfigData?.selector_switch_lockable || "Lockable",
    running_open: commonConfigData?.running_open || "Green",
    stopped_closed: commonConfigData?.stopped_closed || "Red",
    trip: commonConfigData?.trip || "Amber",
    safe_field_motor_type: commonConfigData?.type || "Weather Proof Enclosure",
    safe_field_motor_enclosure: commonConfigData?.enclosure || "IP 65",
    safe_field_motor_material: commonConfigData?.material || "SS 316",
    safe_field_motor_thickness: commonConfigData?.thickness || "1.6 mm",
    safe_field_motor_qty:
      commonConfigData?.qty || "As Mentioned in Electrical Load List",
    safe_field_motor_isolator_color_shade:
      commonConfigData?.field_motor_isolator_color_shade || "RAL 7035",
    safe_field_motor_cable_entry: commonConfigData?.cable_entry || "Bottom",
    safe_field_motor_canopy: commonConfigData?.canopy_on_top || "All",
    safe_field_motor_canopy_type: commonConfigData?.type || "On Top",
    hazardous_field_motor_type:
      commonConfigData?.type || mainPkgData?.standard
        ? mainPkgData?.standard
        : "IS",
    hazardous_field_motor_enclosure: commonConfigData?.enclosure || "IP 65",
    hazardous_field_motor_material: commonConfigData?.material || "SS 316",
    hazardous_field_motor_thickness: commonConfigData?.thickness || "1.6 mm",
    hazardous_field_motor_qty:
      commonConfigData?.qty || "As Mentioned in Electrical Load List",
    hazardous_field_motor_isolator_color_shade:
      commonConfigData?.field_motor_isolator_color_shade || "RAL 7035",
    hazardous_field_motor_cable_entry:
      commonConfigData?.cable_entry || "Bottom",
    hazardous_field_motor_canopy: commonConfigData?.canopy_on_top || "All",
    hazardous_field_motor_canopy_type: commonConfigData?.type || "On Top",

    safe_lpbs_type: commonConfigData?.lpbs_type || "Weather Proof Enclosure",
    safe_lpbs_enclosure: commonConfigData?.lpbs_enclosure || "IP 65",
    safe_lpbs_material: commonConfigData?.lpbs_material || "CRCA",
    safe_lpbs_thickness: commonConfigData?.thickness || "1.6 mm",
    safe_lpbs_qty:
      commonConfigData?.lpbs_qty || "As Mentioned in Electrical Load List",
    safe_lpbs_color_shade: commonConfigData?.lpbs_color_shade || "RAL 7035",
    safe_lpbs_canopy: commonConfigData?.lpbs_canopy_on_top || "All",
    safe_lpbs_canopy_type: commonConfigData?.type || "On Top",

    hazardous_lpbs_type:
      commonConfigData?.lpbs_type || mainPkgData?.standard
        ? mainPkgData?.standard
        : "IS",
    hazardous_lpbs_enclosure: commonConfigData?.lpbs_enclosure || "IP 65",
    hazardous_lpbs_material: commonConfigData?.lpbs_material || "CRCA",
    hazardous_lpbs_thickness: commonConfigData?.thickness || "1.6 mm",
    hazardous_lpbs_qty:
      commonConfigData?.lpbs_qty || "As Mentioned in Electrical Load List",
    hazardous_lpbs_color_shade:
      commonConfigData?.lpbs_color_shade || "RAL 7035",
    hazardous_lpbs_canopy: commonConfigData?.lpbs_canopy_on_top || "All",
    hazardous_lpbs_canopy_type: commonConfigData?.type || "On Top",

    lpbs_push_button_start_color:
      commonConfigData?.lpbs_push_button_start_color || "Green",
    lpbs_indication_lamp_start_color:
      commonConfigData?.lpbs_indication_lamp_start_color || "Green",
    lpbs_indication_lamp_stop_color:
      commonConfigData?.lpbs_indication_lamp_stop_color || "Red",
    lpbs_speed_increase: commonConfigData?.lpbs_speed_increase || "Yellow",
    lpbs_speed_decrease: commonConfigData?.lpbs_speed_decrease || "Black",

    lpbs_forward_push_button_start:
      commonConfigData?.lpbs_forward_push_button_start || "Yellow",
    lpbs_reverse_push_button_start:
      commonConfigData?.lpbs_reverse_push_button_start || "Yellow",
    lpbs_push_button_ess:
      commonConfigData?.lpbs_push_button_ess ||
      "Mushroom headed Stayput ( Key to release) Red Colour",

    apfc_relay: commonConfigData?.apfc_relay || "4",
    power_bus_main_busbar_selection:
      commonConfigData?.power_bus_main_busbar_selection || "As per IS8623",
    power_bus_heat_pvc_sleeve:
      commonConfigData?.power_bus_heat_pvc_sleeve || "Red, Yellow, Blue, Black",
    power_bus_material: commonConfigData?.power_bus_material || "Aluminium",
    power_bus_current_density:
      commonConfigData?.power_bus_current_density || "0.8 A/Sq. mm",
    power_bus_rating_of_busbar:
      commonConfigData?.power_bus_rating_of_busbar ||
      "(Min - 1R x 65 mm X 10 mm)",
    control_bus_main_busbar_selection:
      commonConfigData?.control_bus_main_busbar_selection || "As per IS8623",
    control_bus_heat_pvc_sleeve:
      commonConfigData?.control_bus_heat_pvc_sleeve || "Red, Black",
    control_bus_material: commonConfigData?.control_bus_material || "Aluminium",
    control_bus_current_density:
      commonConfigData?.control_bus_current_density || "0.8 A/Sq. mm",

    control_bus_rating_of_busbar:
      commonConfigData?.control_bus_rating_of_busbar || "VTS",
    earth_bus_main_busbar_selection:
      commonConfigData?.earth_bus_main_busbar_selection || "As per IS8623",
    earth_bus_busbar_position:
      commonConfigData?.earth_bus_busbar_position || "Top",

    earth_bus_material: commonConfigData?.earth_bus_material || "Aluminium",
    earth_bus_current_density:
      commonConfigData?.earth_bus_current_density || "0.8 A/Sq. mm",
    earth_bus_rating_of_busbar:
      commonConfigData?.earth_bus_rating_of_busbar ||
      "(Min - 1R x 30 mm X 10 mm )",
    metering_for_feeders:
      commonConfigData?.metering_for_feeders || "Ammeter (Digital)",
    general_note_busbar_and_insulation_materials:
      commonConfigData?.general_note_busbar_and_insulation_materials ||
      "Not Applicable",
    door_earthing:
      commonConfigData?.door_earthing ||
      "Through Separate Stud With Yellow-Green PVC stranded copper wire (2.5 sq.mm)",
    instrument_earth:
      commonConfigData?.instrument_earth ||
      "1. Dark Green PVC Copper Wire 0.5/1 Sq.mm & Copper Busbar \n2. Every VFD section shall have isolated Instrument Earth busbar",
    cooling_fans: commonConfigData?.cooling_fans || "Not Applicable",
    louvers_and_filters:
      commonConfigData?.louvers_and_filters || "Not Applicable",
    alarm_annunciator: commonConfigData?.alarm_annunciator || "Not Applicable",
    control_transformer:
      commonConfigData?.control_transformer || "Not Applicable",
    commissioning_spare:
      commonConfigData?.commissioning_spare || "Not Applicable",
    two_year_operational_spare:
      commonConfigData?.two_year_operational_spare || "Not Applicable",
  };
};

const CommonConfiguration = ({
  revision_id,
  setActiveKey,
}: {
  revision_id: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { data: commonConfiguration1 } = useNewGetData(
    `${COMMON_CONFIGURATION_1}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
  );
  const { data: commonConfiguration2 } = useNewGetData(
    `${COMMON_CONFIGURATION_2}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
  );
  const { data: commonConfiguration3 } = useNewGetData(
    `${COMMON_CONFIGURATION_3}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
  );

  const commonConfigurationData = useMemo(
    () => [
      ...(commonConfiguration1 || []),
      ...(commonConfiguration2 || []),
      ...(commonConfiguration3 || []),
    ],
    [commonConfiguration1, commonConfiguration2, commonConfiguration3]
  );

  const [loading, setLoading] = useState(false);

  const userInfo = useCurrentUser();
  const params = useParams();
  const project_id = params?.project_id;
  const dropdown = useCommonConfigDropdowns();

  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);
  const projectDivision = projectData?.division;
  const userDivision = userInfo?.division;
  const getMainPkgUrl = `${PROJECT_MAIN_PKG_LIST_API}?revision_id=${revision_id}`;

  const { data: mainPkgData } = useGetData(getMainPkgUrl);
  const [mainPkg, setMainPkg] = useState();
  // const mainPackageData = mainPkgData ? mainPkgData[0] : [];
  const dm_standard_options = dropdown["Supply Feeder DM Standard"];
  const pb_current_density_options = dropdown["Power Bus Current Density"];
  const cb_current_density_options = dropdown["Control Bus Current Density"];
  const eb_current_density_options = dropdown["Earth Bus Current Density"];
  useEffect(() => {
    if (mainPkgData) {
      setMainPkg(mainPkgData[0]);
    }
  }, [mainPkgData]);

  const iec_dm_standards = dm_standard_options?.filter(
    (item: any) => item.name.startsWith("IEC") || item.name === "NA"
  );
  const is_dm_standards = dm_standard_options?.filter(
    (item: any) => item.name.startsWith("IS") || item.name === "NA"
  );

  const al_pb_current_density = pb_current_density_options?.filter(
    (item: any) => item.name.startsWith("0.8")
  );
  const cu_pb_current_density = pb_current_density_options?.filter(
    (item: any) => item.name.startsWith("1.2") || item.name.startsWith("1.0")
  );
  const al_cb_current_density = cb_current_density_options?.filter(
    (item: any) => item.name.startsWith("0.8")
  );
  const cu_cb_current_density = cb_current_density_options?.filter(
    (item: any) => item.name.startsWith("1.2") || item.name.startsWith("1.0")
  );
  const al_eb_current_density = eb_current_density_options?.filter(
    (item: any) => item.name.startsWith("0.8")
  );
  const cu_eb_current_density = eb_current_density_options?.filter(
    (item: any) => item.name.startsWith("1.2") || item.name.startsWith("1.0")
  );
  const na_dropdown = [
    {
      name: "NA",
      value: "NA",
      label: "NA",
    },
  ];

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: zodResolver(configItemValidationSchema),
    defaultValues: getDefaultValues(commonConfigurationData?.[0], mainPkg),
    mode: "onSubmit",
  });

  useEffect(() => {
    console.log(commonConfigurationData, "common config data");

    reset(getDefaultValues(commonConfigurationData?.[0], mainPkg));
  }, [reset, commonConfigurationData, mainPkg]);

  const currentTransformerNumber = watch("current_transformer_quantity");
  const supply_feeder_standard_controlled = watch("supply_feeder_standard");
  const is_control_transformer_applicable = watch(
    "is_control_transformer_applicable"
  );
  const is_field_motor_isolator_selected = watch(
    "is_field_motor_isolator_selected"
  );
  const is_local_push_button_station_selected = watch(
    "is_local_push_button_station_selected"
  );
  const is_hazardous_lpbs_selected = watch("is_hazardous_lpbs_selected");
  const is_Ammeter_NA = watch("ammeter");
  const control_bus_material_controlled = watch("control_bus_material");
  const power_bus_material_controlled = watch("power_bus_material");
  const earth_bus_material_controlled = watch("earth_bus_material");
  const safe_field_motor_controlled = watch("safe_field_motor_material");
  const hazardous_field_motor_controlled = watch(
    "hazardous_field_motor_material"
  );
  const hazardous__field_motor_type_controlled = watch(
    "hazardous_field_motor_type"
  );
  const safe_lpbs_material_controlled = watch("safe_lpbs_material");
  const hazardous_lpbs_material_controlled = watch("hazardous_lpbs_material");
  const hazardous_lpbs_type_controlled = watch("hazardous_lpbs_type");
  const dm_standard = watch("dm_standard");
  const safe_field_motor_material = watch("safe_field_motor_material");
  const safe_lpbs_material = watch("safe_lpbs_material");
  const hazardous_lpbs_material = watch("hazardous_lpbs_material");
  const hazardous_field_motor_material = watch(
    "hazardous_field_motor_material"
  );

  useEffect(() => {
    setValue("power_bus_main_busbar_selection", dm_standard);
    setValue("control_bus_main_busbar_selection", dm_standard);
    setValue("earth_bus_main_busbar_selection", dm_standard);
  }, [dm_standard, setValue]);
  useEffect(() => {
    if (["SS 316", "SS 304", "CRCA"].includes(safe_field_motor_material)) {
      setValue("safe_field_motor_thickness", "3 mm");
    }
    if (["SS 316", "SS 304", "CRCA"].includes(hazardous_field_motor_material)) {
      setValue("hazardous_field_motor_thickness", "3 mm");
    }
    if (["SS 316", "SS 304", "CRCA"].includes(safe_lpbs_material)) {
      setValue("safe_lpbs_thickness", "3 mm");
    }
    if (["SS 316", "SS 304", "CRCA"].includes(hazardous_lpbs_material)) {
      setValue("hazardous_lpbs_thickness", "3 mm");
    }
  }, [
    safe_field_motor_material,
    hazardous_lpbs_material,
    safe_lpbs_material,
    hazardous_field_motor_material,
    setValue,
  ]);
  const safe_field_motor_canopy = watch("safe_field_motor_canopy");
  const safe_lpbs_canopy = watch("safe_lpbs_canopy");
  const hazardous_field_motor_canopy = watch("hazardous_field_motor_canopy");
  const hazardous_lpbs_canopy = watch("hazardous_lpbs_canopy");
  useEffect(() => {
    const transformerConfigMap: { [key: string]: string } = {
      One: "Y-Phase with CT",
      Three: "All Phase with CT",
      NA: "NA",
    };

    const configuration =
      transformerConfigMap[
        currentTransformerNumber as keyof typeof transformerConfigMap
      ] || "NA";

    setValue("current_transformer_configuration", configuration);

    if (safe_field_motor_canopy === "NA") {
      setValue("safe_field_motor_canopy_type", "NA");
    } else {
      setValue("safe_field_motor_canopy_type", "On Top");
    }
    if (safe_lpbs_canopy === "NA") {
      setValue("safe_lpbs_canopy_type", "NA");
    } else {
      setValue("safe_lpbs_canopy_type", "On Top");
    }
    if (hazardous_field_motor_canopy === "NA") {
      setValue("hazardous_field_motor_canopy_type", "NA");
    } else {
      setValue("hazardous_field_motor_canopy_type", "On Top");
    }
    if (hazardous_lpbs_canopy === "NA") {
      setValue("hazardous_lpbs_canopy_type", "NA");
    } else {
      setValue("hazardous_lpbs_canopy_type", "On Top");
    }
  }, [
    currentTransformerNumber,
    hazardous_field_motor_canopy,
    hazardous_lpbs_canopy,
    safe_field_motor_canopy,
    safe_lpbs_canopy,
    setValue,
  ]);

  useEffect(() => {
    if (supply_feeder_standard_controlled === "IS") {
      setValue("dm_standard", "IS 8623");
      setValue("power_bus_main_busbar_selection", "IS 8623");
      setValue("control_bus_main_busbar_selection", "IS 8623");
      setValue("earth_bus_main_busbar_selection", "IS 8623");
    } else {
      setValue("dm_standard", "IEC 60439");
      setValue("power_bus_main_busbar_selection", "IEC 60439");
      setValue("control_bus_main_busbar_selection", "IEC 60439");
      setValue("earth_bus_main_busbar_selection", "IEC 60439");
    }
  }, [setValue, supply_feeder_standard_controlled]);

  useEffect(() => {
    if (is_Ammeter_NA === "NA") {
      setValue("ammeter_configuration", "NA");
    }

    if (
      safe_field_motor_controlled !== "SS 316" &&
      safe_field_motor_controlled !== "SS 304" &&
      safe_field_motor_controlled !== "CRCA"
    ) {
      setValue("safe_field_motor_thickness", "NA");
    }

    if (
      hazardous_field_motor_controlled !== "SS 316" &&
      hazardous_field_motor_controlled !== "SS 304" &&
      hazardous_field_motor_controlled !== "CRCA"
    ) {
      setValue("hazardous_field_motor_thickness", "NA");
    }

    if (
      safe_lpbs_material_controlled !== "SS 316" &&
      safe_lpbs_material_controlled !== "SS 304" &&
      safe_lpbs_material_controlled !== "CRCA"
    ) {
      setValue("safe_lpbs_thickness", "NA");
    }

    if (
      hazardous_lpbs_material_controlled !== "SS 316" &&
      hazardous_lpbs_material_controlled !== "SS 304" &&
      hazardous_lpbs_material_controlled !== "CRCA"
    ) {
      setValue("hazardous_lpbs_thickness", "NA");
    }

    if (hazardous__field_motor_type_controlled === "IEC Exd") {
      setValue("hazardous_field_motor_material", "Diecast Aluminium");
    }

    if (hazardous__field_motor_type_controlled === "IEC Exe") {
      setValue("hazardous_field_motor_material", "SS 316");
    }

    if (hazardous_lpbs_type_controlled === "IEC Exd") {
      setValue("hazardous_lpbs_material", "Diecast Aluminium");
    }

    if (hazardous_lpbs_type_controlled === "IEC Exe") {
      setValue("hazardous_lpbs_material", "SS 316");
    }
  }, [
    is_Ammeter_NA,
    safe_lpbs_material_controlled,
    hazardous_lpbs_material_controlled,
    hazardous__field_motor_type_controlled,
    hazardous_lpbs_type_controlled,
    safe_field_motor_controlled,
    hazardous_field_motor_controlled,
    setValue,
  ]);

  // Control Bus (dependancy Logic)
  useEffect(() => {
    const keyValueMapping: { [key: string]: string } = {
      Aluminium: "0.8 A/Sq. mm",
      Copper: "1.0 A/Sq. mm",
    };

    const mappedKeyValue =
      keyValueMapping[
        control_bus_material_controlled as keyof typeof keyValueMapping
      ] || "1.0 A/Sq. mm";

    setValue("control_bus_current_density", mappedKeyValue);
  }, [cb_current_density_options, control_bus_material_controlled, setValue]);

  // Power Bus (dependency logic)
  useEffect(() => {
    const keyValueMapping: { [key: string]: string } = {
      Aluminium: "0.8 A/Sq. mm",
      Copper: "1.0 A/Sq. mm",
    };
    const mappedKeyValue =
      keyValueMapping[
        power_bus_material_controlled as keyof typeof keyValueMapping
      ] || "1.0 A/Sq. mm";

    setValue("power_bus_current_density", mappedKeyValue);
  }, [pb_current_density_options, power_bus_material_controlled, setValue]);

  // Earth Bus (Dependency logic)
  useEffect(() => {
    const keyValueMapping: { [key: string]: string } = {
      Aluminium: "0.8 A/Sq. mm",
      Copper: "1.0 A/Sq. mm",
    };
    const mappedKeyValue =
      keyValueMapping[
        earth_bus_material_controlled as keyof typeof keyValueMapping
      ] || "1.0 A/Sq. mm";

    setValue("earth_bus_current_density", mappedKeyValue);
  }, [earth_bus_material_controlled, eb_current_density_options, setValue]);

  const handleError = (error: any) => {
    try {
      const errorObj = JSON.parse(error?.message) as any;
      message?.error(errorObj?.message);
    } catch (parseError) {
      console.error("parseError: ", parseError);
      message?.error(error?.message || "An unknown error occured");
    }
  };

  const onSubmit: SubmitHandler<
    zod.infer<typeof configItemValidationSchema>
  > = async (data: any) => {
    setLoading(true);
    try {
      // let temp =
      const fieldsToStringify = ["analog_meters", "digital_meters"];

      const transformedData = { ...data };

      fieldsToStringify.forEach((field) => {
        if (Array.isArray(transformedData[field])) {
          transformedData[field] = JSON.stringify(transformedData[field]);
        }
      });
      console.log(transformedData);

      await updateData(
        `${COMMON_CONFIGURATION_1}/${commonConfiguration1[0].name}`,
        false,
        transformedData
      );
      await updateData(
        `${COMMON_CONFIGURATION_2}/${commonConfiguration2[0].name}`,
        false,
        transformedData
      );
      await updateData(
        `${COMMON_CONFIGURATION_3}/${commonConfiguration3[0].name}`,
        false,
        transformedData
      );
      message.success("Common Configuration Saved Successfully");
      setActiveKey((prevKey: string) => (parseInt(prevKey, 10) + 1).toString());
    } catch (error) {
      console.error("error: ", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 px-4"
      >
        <Divider>
          <span className="font-bold text-slate-700">Standard</span>
        </Divider>
        <div className="flex item-center gap-2">
          <div className="flex-1 flex flex-row items-center justify-start gap-4">
            <div className="font-semibold mt-1 text-slate-700 pt-1">
              {`Design, Manufacturer's  & Testing Standard`}
            </div>
            <div className="">
              <CustomRadioSelect
                control={control}
                name="supply_feeder_standard"
                label=""
                options={[
                  { label: "IEC", value: "IEC" },
                  { label: "IS", value: "IS" },
                ]}
              />
            </div>
          </div>
          <div className="flex-1 pt-2">
            <CustomSingleSelect
              control={control}
              name="dm_standard"
              label=""
              options={
                (watch("supply_feeder_standard").startsWith("IEC")
                  ? iec_dm_standards
                  : is_dm_standards) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1"></div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Control Transformer</span>
          <CustomRadioSelect
            control={control}
            name="is_control_transformer_applicable"
            label=""
            options={[
              { label: "Yes", value: "1" },
              { label: "No", value: "0" },
            ]}
          />
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_transformer_primary_voltage"
              label="Control Transformer Primary Voltage"
              options={
                sortAlphaNumericArray(
                  dropdown["Control Transformer primary voltage"]
                ) || []
              }
              size="small"
              disabled={is_control_transformer_applicable === "0"}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_transformer_secondary_voltage_copy"
              label="Control Transformer Secondary Voltage"
              options={
                sortAlphaNumericArray(
                  dropdown["Control Transformer primary voltage"]
                ) || []
              }
              size="small"
              disabled={is_control_transformer_applicable === "0"}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_transformer_coating"
              label="Control Transformer Coating"
              options={
                moveNAtoEnd(dropdown["Current Transformer Coating"]) || []
              }
              size="small"
              disabled={is_control_transformer_applicable === "0"}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_transformer_quantity"
              label="Control Transformer Quantity"
              options={
                moveNAtoEnd(dropdown["Control Transformer Quantity"]) || []
              }
              size="small"
              disabled={is_control_transformer_applicable === "0"}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_transformer_configuration"
              label="Control Transformer Configuration"
              options={
                moveNAtoEnd(dropdown["Control Transformer Configuration"]) || []
              }
              size="small"
              disabled={is_control_transformer_applicable === "0"}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_transformer_type"
              label="Control Transformer Type"
              options={moveNAtoEnd(dropdown["Control Transformer Type"]) || []}
              size="small"
              disabled={is_control_transformer_applicable === "0"}
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">APFC</span>
        </Divider>
        <div className="w-1/3">
          <CustomSingleSelect
            control={control}
            name="apfc_relay"
            label="APFC Relay"
            options={sortDropdownOptions(dropdown["APFC Relay"]) || []}
            suffixIcon={
              <>
                <p className="font-semibold text-blue-500">Stage</p>
              </>
            }
            size="small"
          />
        </div>

        <Divider>
          <span className="font-bold text-slate-700">Power Bus</span>
        </Divider>
        <div className="flex w-2/3 items-center gap-4">
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="power_bus_main_busbar_selection"
              label="Main Busbar Selection"
              // options={dropdown["Power Bus Main Busbar Selection"] || []}
              disabled={true}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="power_bus_heat_pvc_sleeve"
              label="Heat Shrinkable Color PVC sleeve (L1, L2, L3, N)"
              options={
                dropdown["Power Bus Heat Shrinkable Color PVC sleeve"] || []
              }
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="power_bus_material"
              label="Material"
              options={[
                { label: "Aluminium", value: "Aluminium" },
                { label: "Copper", value: "Copper" },
                { label: "Tinned Copper", value: "Tinned Copper" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="power_bus_current_density"
              label="Current Density"
              options={
                (watch("power_bus_material") === "Aluminium"
                  ? al_pb_current_density
                  : cu_pb_current_density) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="power_bus_rating_of_busbar"
              label="Busbar Size & Rating"
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Control Bus</span>
        </Divider>
        <div className="flex w-2/3 items-center gap-4">
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="control_bus_main_busbar_selection"
              label="Main Busbar Selection"
              // options={dropdown["Control Bus Main Busbar Selection"] || []}
              size="small"
              disabled={true}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_bus_heat_pvc_sleeve"
              label="Heat Shrinkable Color PVC sleeve (L, N)"
              options={
                dropdown["Control Bus Heat Shrinkable Color PVC sleeve"] || []
              }
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="control_bus_material"
              label="Material"
              options={[
                { label: "Aluminium", value: "Aluminium" },
                { label: "Copper", value: "Copper" },
                { label: "Tinned Copper", value: "Tinned Copper" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_bus_current_density"
              label="Current Density"
              options={
                (watch("control_bus_material") === "Aluminium"
                  ? al_cb_current_density
                  : cu_cb_current_density) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="control_bus_rating_of_busbar"
              label="Busbar Size & Rating"
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Earth Bus</span>
        </Divider>
        <div className="flex w-2/3 items-center gap-4">
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="earth_bus_main_busbar_selection"
              label="Main Busbar Selection"
              disabled={true}
              // options={dropdown["Earth Bus Main Busbar Selection"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="earth_bus_busbar_position"
              label="Earth Busbar Position"
              options={dropdown["Earth Bus Busbar Position"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="earth_bus_material"
              label="Material"
              options={[
                { label: "Aluminium", value: "Aluminium" },
                { label: "Copper", value: "Copper" },
                { label: "Tinned Copper", value: "Tinned Copper" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="earth_bus_current_density"
              label="Current Density"
              options={
                (watch("earth_bus_material") === "Aluminium"
                  ? al_eb_current_density
                  : cu_eb_current_density) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="earth_bus_rating_of_busbar"
              label="Busbar Size & Rating"
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="door_earthing"
              label="Door Earthing"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="instrument_earth"
              label="Instrumental Earth"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="general_note_busbar_and_insulation_materials"
              label="General Note Busbar & Instrumental Materials"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Outgoing Feeder</span>
        </Divider>
        <div className="flex items-center gap-8">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="dol_starter"
              label={
                <>
                  DOL Starter{" "}
                  <span className="text-xs text-blue-500">
                    (kW including and below)
                  </span>
                </>
              }
              options={sortDropdownOptions(dropdown["DOL Starter"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="star_delta_starter"
              label={
                <>
                  Star Delta Starter{" "}
                  <span className="text-xs text-blue-500">
                    (kW including and above)
                  </span>
                </>
              }
              options={
                sortDropdownOptions(dropdown["Star Delta Starter"]) || []
              }
              size="small"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="col-1">
            <CustomSingleSelect
              control={control}
              name="mcc_switchgear_type"
              label="MCC Switchgear Type"
              options={dropdown["MCC Switchgear Type"] || []}
              size="small"
            />
          </div>

          {userInfo?.division === WWS_SPG && (
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="switchgear_combination"
                label="Switchgear Combination"
                disabled={
                  watch("mcc_switchgear_type") ===
                    "Type II Coordination-Fuse" ||
                  watch("mcc_switchgear_type") ===
                    "Type II Coordination-Fuse-One Size Higher"
                }
                options={dropdown["Switchgear Combination"] || []}
                size="small"
              />
            </div>
          )}
        </div>

        <Divider>
          <span className="font-bold text-slate-700">
            Metering Instruments for Feeder
          </span>
        </Divider>
        <div className="flex gap-8">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ammeter"
              label={
                <>
                  Ammeter{" "}
                  <span className="text-xs text-blue-500">
                    (kW including and above)
                  </span>
                </>
              }
              options={sortDropdownOptions(dropdown["Ammeter"]) || []}
              size="small"
            />
          </div>

          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ammeter_configuration"
              label="Ammeter Configuration"
              options={moveNAtoEnd(dropdown["Ammeter Configuration"]) || []}
              size="small"
              disabled={is_Ammeter_NA === "NA"}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomMultiSelect
              control={control}
              name="analog_meters"
              label="Analog Meter"
              options={moveNAtoEnd(dropdown["Analog Meters"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomMultiSelect
              control={control}
              name="digital_meters"
              label="Digital Meter"
              options={moveNAtoEnd(dropdown["Digital Meters"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="communication_protocol"
              label="Communication Protocol"
              options={moveNAtoEnd(dropdown["Communication Protocol"]) || []}
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Current Transformer for Feeder
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer"
              label={
                <>
                  Current Transformer{" "}
                  <span className="text-xs text-blue-500">
                    (kW including and above)
                  </span>
                </>
              }
              options={
                sortDropdownOptions(dropdown["Current Transformer"]) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer_coating"
              label="Current Transformer Coating "
              options={
                moveNAtoEnd(dropdown["Current Transformer Coating"]) || []
              }
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer_quantity"
              label="Current Transformer Quantity "
              options={
                moveNAtoEnd(
                  dropdown["Control Transformer Quantity"]?.filter(
                    (el: any) => el.value !== "Two"
                  )
                ) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer_configuration"
              label="Current Transformer Configruration"
              options={
                moveNAtoEnd(dropdown["Current Transformer Configuration"]) || []
              }
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Supply Feeder</span>
        </Divider>
        <div className="flex items-center gap-4">
          <div className="w-1/4">
            <CustomSingleSelect
              control={control}
              name="pole"
              label="Pole"
              options={dropdown["Supply Feeder Pole"] || []}
              size="small"
            />
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">Wiring</span>
        </Divider>
        <div className="flex items-center gap-4">
          <h4 className="flex-1 text-sm font-semibold text-slate-700">
            Power Wiring (L1, L2, L3, N)
          </h4>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="power_wiring_color"
              label="Color"
              options={moveNAtoEnd(dropdown["Power Wiring Color"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="power_wiring_size"
              label="Size"
              options={moveNAtoEnd(dropdown["Power Wiring Size"]) || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h4 className="flex-1 text-sm font-semibold text-slate-700">
            Control Wiring (P, N)
          </h4>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_wiring_color"
              label="Color"
              options={moveNAtoEnd(dropdown["Control Wiring Color"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_wiring_size"
              label="Size"
              options={moveNAtoEnd(dropdown["Control Wiring Size"]) || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h4 className="flex-1 text-sm font-semibold text-slate-700">
            24 VDC Wiring (+ / -)
          </h4>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="vdc_24_wiring_color"
              label="Color"
              options={moveNAtoEnd(dropdown["VDC 24 Wiring Color"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="vdc_24_wiring_size"
              label="Size"
              options={dropdown["VDC 24 Wiring Size"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h4 className="flex-1 text-sm font-semibold text-slate-700">
            Analog Signal Wiring (+ / -)
          </h4>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="analog_signal_wiring_color"
              label="Color"
              options={dropdown["Analog Signal Wiring Color"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="analog_signal_wiring_size"
              label="Size"
              options={dropdown["Analog Signal Wiring Size"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h4 className="flex-1 text-sm font-semibold text-slate-700">
            CT Wiring (L1, L2, L3, N)
          </h4>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ct_wiring_color"
              label="Color"
              options={moveNAtoEnd(dropdown["CT Wiring Color"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ct_wiring_size"
              label="Size"
              options={dropdown["CT Wiring Size"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <h4 className="flex-1 text-sm font-semibold text-slate-700">
            RTD / Thermocouple Wiring (+, - )
          </h4>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="rtd_thermocouple_wiring_color"
              label="Color"
              options={dropdown["Analog Signal Wiring Color"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="rtd_thermocouple_wiring_size"
              label="Size"
              options={dropdown["Analog Signal Wiring Size"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="cable_insulation_pvc"
              label="Cable Insulation (PVC)"
              options={dropdown["Cable Insulation PVC"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="air_clearance_between_phase_to_phase_bus"
              label="Air Clearance Between Phase to Phase Bus"
              options={dropdown["Air Clearance Doctype"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="air_clearance_between_phase_to_neutral_bus"
              label="Air Clearance Between Phase to Neutral Bus"
              options={dropdown["Air Clearance Doctype"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="general_note_internal_wiring"
              label="General Note Internal Wiring"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="common_requirement"
              label="Common Requirement"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Terminal Block Connectors
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="power_terminal_clipon"
              label="Power Terminal Clipon"
              options={dropdown["Power Terminal Clipon"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="power_terminal_busbar_type"
              label="Power Terminal Busbar Type"
              options={dropdown["Power Terminal Busbar Type"] || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="control_terminal"
              label="Control Terminal"
              options={dropdown["Control Terminal"] || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="spare_terminal"
              label="Spare Terminal"
              options={sortDropdownOptions(dropdown["Spare Terminal"])}
              size="small"
              suffixIcon={
                <>
                  <p className="text-base font-semibold text-blue-400">%</p>
                </>
              }
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Panel Mounted Push Buttons & Colours
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="push_button_start"
              label="Start Push Button"
              options={moveNAtoEnd(dropdown["Push Button Start Color"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="push_button_stop"
              label="Stop Push Button"
              options={moveNAtoEnd(dropdown["Push Button Stop Color"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="push_button_ess"
              label="Emergency Stop Push Button"
              options={moveNAtoEnd(dropdown["Push Button ESS"]) || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4"></div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="forward_push_button_start"
              label="Forward Start Push Button"
              options={
                moveNAtoEnd(dropdown["Forward and Reverse Push Button"]) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="reverse_push_button_start"
              label="Reverse Start Push Button"
              options={
                moveNAtoEnd(dropdown["Forward and Reverse Push Button"]) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="potentiometer"
              label="Potentiometer"
              options={[
                { label: "Applicable", value: "1" },
                { label: "Not Applicable", value: "0" },
              ]}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 flex flex-row items-center justify-start gap-5">
            <span className="font-semibold text-slate-700 mt-1">Speed</span>
            <CustomRadioSelect
              control={control}
              name="is_push_button_speed_selected"
              label=""
              options={[
                { label: "Yes", value: "1" },
                { label: "No", value: "0" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="speed_increase_pb"
              label="Speed Increase Push Button"
              options={moveNAtoEnd(dropdown["Speed Increase PB"]) || []}
              disabled={watch("is_push_button_speed_selected") === "0"}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="speed_decrease_pb"
              label="Speed Decrease Push Button"
              options={moveNAtoEnd(dropdown["Speed Decrease PB"]) || []}
              disabled={watch("is_push_button_speed_selected") === "0"}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="alarm_acknowledge_and_lamp_test"
              label="Alarm Acknowledge Push Button"
              options={
                moveNAtoEnd(dropdown["Alarm Acknowledge Dropdown"]) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="test_dropdown"
              label="Test"
              options={moveNAtoEnd(dropdown["Test Dropdown"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="reset_dropdown"
              label="Reset"
              options={moveNAtoEnd(dropdown["Reset Dropdown"]) || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lamp_test_push_button"
              label="Lamp Test"
              options={
                moveNAtoEnd(
                  dropdown["Reset Dropdown"]?.filter(
                    (item: any) => item.name !== "Black"
                  )
                ) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1"></div>
          <div className="flex-1"></div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Selector Switch</span>
        </Divider>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="selector_switch_applicable"
              label="Local/Remote Selector Switch On MCC Panel Front Door"
              options={[
                { label: "Applicable", value: "Applicable" },
                { label: "Not Applicable", value: "Not Applicable" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="selector_switch_lockable"
              label="Lock Type"
              options={[
                { label: "Lockable", value: "Lockable" },
                { label: "Unlockable", value: "Unlockable" },
              ]}
              disabled={watch("selector_switch_applicable") !== "Applicable"}
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Panel Mounted Indicating Lamps & Colours
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="running_open"
              label="Run"
              options={
                moveNAtoEnd(dropdown["Indicating Lamp Running Open"]) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="stopped_closed"
              label="Stop"
              options={
                moveNAtoEnd(dropdown["Indicating Lamp Stopped Closed"]) || []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="trip"
              label="Trip"
              options={moveNAtoEnd(dropdown["Indicating Lamp Trip"]) || []}
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Field Motor Isolator (General Specification)
          </span>
          <div>
            <CustomRadioSelect
              control={control}
              name="is_field_motor_isolator_selected"
              label=""
              options={[
                { label: "Yes", value: "1" },
                { label: "No", value: "0" },
              ]}
            />
          </div>
        </Divider>
        <div className="text-base font-bold text-slate-700 flex flex-row items-center gap-4">
          <div>Safe Area</div>
          <CustomRadioSelect
            control={control}
            name="is_safe_area_isolator_selected"
            label=""
            options={[
              { label: "Yes", value: "1" },
              { label: "No", value: "0" },
            ]}
            disabled={is_field_motor_isolator_selected === "0"}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_type"
              label="Type"
              options={dropdown["Field Motor Isolator General Type"] || []}
              disabled={true}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_enclosure"
              label="IP Protection"
              options={dropdown["Field Motor Isolator General Enclosure"] || []}
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_material"
              label="MOC"
              options={
                moveNAtoEnd(
                  dropdown["Field Motor Isolator General Material"]
                ) || []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_thickness"
              label="Enclosure Thickness"
              options={
                ["SS 316", "SS 304", "CRCA"].includes(
                  watch("safe_field_motor_material")
                )
                  ? dropdown["Field Motor Thickness"]?.filter(
                      (item: any) => item.name !== "NA"
                    )
                  : na_dropdown
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_qty"
              label="Qty"
              options={dropdown["Field Motor Isolator General QTY"] || []}
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_isolator_color_shade"
              label="Isolator Color Shade"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Color Shade"]) || []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_canopy"
              label="Canopy"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Canopy On Top"]) ||
                []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_field_motor_canopy_type"
              label="Canopy Type"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Canopy Type"]) || []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_safe_area_isolator_selected") === "0"
              }
            />
          </div>
        </div>
        <div className="text-base font-bold text-slate-700 flex flex-row items-center gap-4">
          <div>Hazardous Area</div>
          <CustomRadioSelect
            control={control}
            name="is_hazardous_area_isolator_selected"
            label=""
            options={[
              { label: "Yes", value: "1" },
              { label: "No", value: "0" },
            ]}
            disabled={is_field_motor_isolator_selected === "0"}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_type"
              label="Type"
              options={dropdown["Hazardous Area Type Isolator and Lpbs"] || []}
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_enclosure"
              label="IP Protection"
              options={dropdown["Field Motor Isolator General Enclosure"] || []}
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_material"
              label="MOC"
              options={
                moveNAtoEnd(
                  dropdown["Field Motor Isolator General Material"]
                ) || []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_thickness"
              label="Enclosure Thickness"
              options={
                ["SS 316", "SS 304", "CRCA"].includes(
                  watch("hazardous_field_motor_material")
                )
                  ? dropdown["Field Motor Thickness"]?.filter(
                      (item: any) => item.name !== "NA"
                    )
                  : na_dropdown
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_qty"
              label="Qty"
              options={dropdown["Field Motor Isolator General QTY"] || []}
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_isolator_color_shade"
              label="Isolator Color Shade"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Color Shade"]) || []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_canopy"
              label="Canopy"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Canopy On Top"]) ||
                []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_field_motor_canopy_type"
              label="Canopy Type"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Canopy Type"]) || []
              }
              size="small"
              disabled={
                is_field_motor_isolator_selected === "0" ||
                watch("is_hazardous_area_isolator_selected") === "0"
              }
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Local Push Button Station (General Specification)
          </span>
          <div>
            <CustomRadioSelect
              control={control}
              name="is_local_push_button_station_selected"
              label=""
              options={[
                { label: "Yes", value: "1" },
                { label: "No", value: "0" },
              ]}
            />
          </div>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_push_button_start_color"
              label="Start Push Button"
              options={
                moveNAtoEnd(dropdown["LPBS Start On Indication Lamp Color"]) ||
                []
              }
              disabled={is_local_push_button_station_selected === "0"}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_forward_push_button_start"
              label="Forward Start Push Button"
              options={
                moveNAtoEnd(dropdown["Forward and Reverse Push Button"]) || []
              }
              size="small"
              disabled={is_local_push_button_station_selected === "0"}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_reverse_push_button_start"
              label="Reverse Start Push Button"
              options={
                moveNAtoEnd(dropdown["Forward and Reverse Push Button"]) || []
              }
              size="small"
              disabled={is_local_push_button_station_selected === "0"}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-2/3">
            <CustomSingleSelect
              control={control}
              name="lpbs_push_button_ess"
              label="Emergency Stop Button"
              options={moveNAtoEnd(dropdown["Push Button ESS"]) || []}
              size="small"
              disabled={is_local_push_button_station_selected === "0"}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_speed_increase"
              label="Speed Increase Push Button"
              options={
                moveNAtoEnd(dropdown["LPBS Speed Increase Push Button"]) || []
              }
              disabled={is_local_push_button_station_selected === "0"}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_speed_decrease"
              label="Speed Decrease Push Button"
              options={
                moveNAtoEnd(dropdown["LPBS Speed Decrease Push Button"]) || []
              }
              disabled={is_local_push_button_station_selected === "0"}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_indication_lamp_start_color"
              label="Start / ON Indication Lamp Color"
              options={
                moveNAtoEnd(dropdown["LPBS Start On Indication Lamp Color"]) ||
                []
              }
              disabled={is_local_push_button_station_selected === "0"}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="lpbs_indication_lamp_stop_color"
              label="Stop / OFF Indication Lamp Color"
              options={
                moveNAtoEnd(dropdown["LPBS Stop Off Indication Lamp Color"]) ||
                []
              }
              disabled={is_local_push_button_station_selected === "0"}
              size="small"
            />
          </div>
        </div>
        <div className="text-base font-bold text-slate-700 flex flex-row items-center gap-4">
          <div>Safe Area</div>
          <CustomRadioSelect
            control={control}
            name="is_safe_lpbs_selected"
            label=""
            options={[
              { label: "Yes", value: "1" },
              { label: "No", value: "0" },
            ]}
            disabled={is_local_push_button_station_selected === "0"}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_type"
              label="Type"
              options={dropdown["Field Motor Isolator General Type"] || []}
              disabled={true}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_enclosure"
              label="IP Protection"
              options={dropdown["Field Motor Isolator General Enclosure"] || []}
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_material"
              label="MOC"
              options={
                moveNAtoEnd(
                  dropdown["Field Motor Isolator General Material"]
                ) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_thickness"
              label="Enclosure Thickness"
              options={
                ["SS 316", "SS 304", "CRCA"].includes(
                  watch("safe_lpbs_material")
                )
                  ? dropdown["Field Motor Thickness"]?.filter(
                      (item: any) => item.name !== "NA"
                    )
                  : na_dropdown
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_qty"
              label="Qty"
              options={dropdown["Local Push Button Station Qty"] || []}
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_color_shade"
              label="LPBS Color Shade"
              options={
                moveNAtoEnd(
                  dropdown["Local Push Button Station LPBS Color Shade"]
                ) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_canopy"
              label="Canopy"
              options={
                moveNAtoEnd(
                  dropdown["Local Push Button Station Canopy On top"]
                ) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="safe_lpbs_canopy_type"
              label="Canopy Type"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Canopy Type"]) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_safe_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
        </div>
        <div className="text-base font-bold text-slate-700 flex flex-row items-center gap-4">
          <div>Hazardous Area</div>
          <CustomRadioSelect
            control={control}
            name="is_hazardous_lpbs_selected"
            label=""
            options={[
              { label: "Yes", value: "1" },
              { label: "No", value: "0" },
            ]}
            disabled={is_local_push_button_station_selected === "0"}
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_type"
              label="Type"
              options={dropdown["Hazardous Area Type Isolator and Lpbs"] || []}
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_enclosure"
              label="IP Protection"
              options={dropdown["Field Motor Isolator General Enclosure"] || []}
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_material"
              label="MOC"
              options={
                moveNAtoEnd(
                  dropdown["Field Motor Isolator General Material"]
                ) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_thickness"
              label="Enclosure Thickness"
              options={
                ["SS 316", "SS 304", "CRCA"].includes(
                  watch("hazardous_lpbs_material")
                )
                  ? dropdown["Field Motor Thickness"]?.filter(
                      (item: any) => item.name !== "NA"
                    )
                  : na_dropdown
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_qty"
              label="Qty"
              options={dropdown["Local Push Button Station Qty"] || []}
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_color_shade"
              label="LPBS Color Shade"
              options={
                moveNAtoEnd(
                  dropdown["Local Push Button Station LPBS Color Shade"]
                ) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_canopy"
              label="Canopy"
              options={
                moveNAtoEnd(
                  dropdown["Local Push Button Station Canopy On top"]
                ) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="hazardous_lpbs_canopy_type"
              label="Canopy Type"
              options={
                moveNAtoEnd(dropdown["Field Motor Isolator Canopy Type"]) || []
              }
              disabled={
                is_local_push_button_station_selected === "0" ||
                watch("is_hazardous_lpbs_selected") === "0"
              }
              size="small"
            />
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">
            Identification of Components
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ferrule"
              label="Ferrule"
              options={moveNAtoEnd(dropdown["Ferrule"]) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="ferrule_note"
              label="Ferrule Note"
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="device_identification_of_components"
              label="Device Identification of Components"
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">Others</span>
        </Divider>
        <div className="flex items-center gap-4">
          <div className="flex flex-row items-center gap-4 flex-1">
            <div className="font-semibold mt-[6px]">Cooling Fans</div>
            <CustomRadioSelect
              control={control}
              name="cooling_fans"
              label=""
              options={[
                { label: "Applicable", value: "Applicable" },
                { label: "Not Applicable", value: "Not Applicable" },
              ]}
            />
          </div>

          <div className="flex flex-row items-center gap-4 flex-1">
            <div className="font-semibold mt-[6px]">Louvers and Filters</div>
            <CustomRadioSelect
              control={control}
              name="louvers_and_filters"
              label=""
              options={[
                { label: "Applicable", value: "Applicable" },
                { label: "Not Applicable", value: "Not Applicable" },
              ]}
            />
          </div>
        </div>
        <div className="mt-2 flex w-full justify-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={userDivision !== projectDivision}
          >
            Save and Next
          </Button>
        </div>
      </form>
    </>
  );
};

export default CommonConfiguration;
