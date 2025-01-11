"use client";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, message, Skeleton } from "antd"; // Import Select for dropdown
import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { updateData } from "@/actions/crud-actions";
import CustomCheckboxInput from "@/components/FormInputs/CustomCheckbox";
import CustomTextInput from "@/components/FormInputs/CustomInput";
import CustomRadioSelect from "@/components/FormInputs/CustomRadioSelect";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import {
  PCC_PANEL,
  PROJECT_API,
  PROJECT_INFO_API,
} from "@/configs/api-endpoints";
import { useGetData } from "@/hooks/useCRUD";
import useMCCPCCPanelDropdowns from "./MCCPCCPanelDropdown";
import { pccPanelValidationSchema } from "../schemas";
import { HEATING, WWS_SPG } from "@/configs/constants";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useParams, useRouter } from "next/navigation";
import CustomTextAreaInput from "@/components/FormInputs/CustomTextArea";
import { moveNAtoEnd, parseToArray } from "@/utils/helpers";
import CustomMultiSelect from "@/components/FormInputs/CustomMultiSelect";

const getDefaultValues = (
  projectMetadata: any,
  projectInfo: any,
  pccPanelData: any
) => {
  return {
    incomer_ampere: pccPanelData?.incomer_ampere || "1000",
    special_note: pccPanelData?.special_note || "Not Applicable",
    led_type_other_input: pccPanelData?.led_type_other_input || "NA",
    incomer_pole: pccPanelData?.incomer_pole || "3",
    incomer_type: pccPanelData?.incomer_type || "SFU",
    incomer_above_ampere: pccPanelData?.incomer_above_ampere || "1001",
    incomer_above_pole: pccPanelData?.incomer_above_pole || "4",
    incomer_above_type: pccPanelData?.incomer_above_type || "SFU",
    is_under_or_over_voltage_selected:
      pccPanelData?.is_under_or_over_voltage_selected || 0,
    is_other_selected: pccPanelData?.is_other_selected || 0,
    is_lsig_selected: pccPanelData?.is_lsig_selected || 0,
    is_lsi_selected: pccPanelData?.is_lsi_selected || 0,
    is_neural_link_with_disconnect_facility_selected:
      pccPanelData?.is_neural_link_with_disconnect_facility_selected || 0,

    is_led_type_lamp_selected:
      pccPanelData?.is_led_type_lamp_selected?.toString() || "1",
    is_indication_on_selected: Boolean(pccPanelData?.is_indication_on_selected),
    led_type_on_input: pccPanelData?.led_type_on_input || "Green",
    is_indication_off_selected: Boolean(
      pccPanelData?.is_indication_off_selected
    ),
    led_type_off_input: pccPanelData?.led_type_off_input || "Red",
    is_indication_trip_selected: Boolean(
      pccPanelData?.is_indication_trip_selected
    ),
    led_type_trip_input: pccPanelData?.led_type_trip_input || "Amber",

    is_blue_cb_spring_charge_selected:
      pccPanelData?.is_blue_cb_spring_charge_selected || "Blue",
    is_red_cb_in_service: pccPanelData?.is_red_cb_in_service || "Red",
    is_white_healthy_trip_circuit_selected:
      pccPanelData?.is_white_healthy_trip_circuit_selected || "White",

    current_transformer_coating:
      pccPanelData?.current_transformer_coating || "Cast Resin",
    current_transformer_number:
      pccPanelData?.current_transformer_number || "One",
    current_transformer_configuration:
      pccPanelData?.current_transformer_configuration || "Y-Phase with CT",

    alarm_annunciator: pccPanelData?.alarm_annunciator || "Applicable",
    control_transformer_coating:
      pccPanelData?.control_transformer_coating || "Cast Resin",
    control_transformer_configuration:
      pccPanelData?.control_transformer_configuration || "Single",

    mi_analog: pccPanelData?.mi_analog
      ? parseToArray(pccPanelData?.mi_analog)
      : ["Ammeter with ASS"],
    mi_digital: pccPanelData?.mi_digital
      ? parseToArray(pccPanelData?.mi_digital)
      : ["Multifunction meter"],
    mi_communication_protocol:
      pccPanelData?.mi_communication_protocol || "Ethernet",

    ga_moc_material: pccPanelData?.ga_moc_material || "FRP",
    ga_moc_thickness_door: pccPanelData?.ga_moc_thickness_door || "1.6 mm",
    door_thickness: pccPanelData?.door_thickness || "1.6 mm",
    ga_moc_thickness_covers: pccPanelData?.ga_moc_thickness_covers || "1.6 mm",
    ga_pcc_compartmental:
      pccPanelData?.ga_pcc_compartmental || "Form-I A (Non Compartmental)",
    ga_pcc_construction_front_type:
      pccPanelData?.ga_pcc_construction_front_type || "Single Front",

    incoming_drawout_type:
      pccPanelData?.incoming_drawout_type || "Non Drawout Type",
    outgoing_drawout_type:
      pccPanelData?.outgoing_drawout_type || "Non Drawout Type",

    ga_pcc_construction_type:
      pccPanelData?.ga_pcc_construction_type || "Intelligent",
    busbar_material_of_construction:
      pccPanelData?.busbar_material_of_construction || "Aluminium",
    ga_current_density: pccPanelData?.ga_current_density || "0.8 A/Sq. mm",
    ga_panel_mounting_frame:
      pccPanelData?.ga_panel_mounting_frame || "Base Frame",
    ga_panel_mounting_height: pccPanelData?.ga_panel_mounting_height || "100",

    is_marshalling_section_selected:
      pccPanelData?.is_marshalling_section_selected || "0",
    marshalling_section_text_area:
      pccPanelData?.marshalling_section_text_area ||
      "a) Min width 400 mm & Above\nb) Separate Marshaling for each shiping section with Partition\nc) Signal from MCC to PLC DI/DO/AI/AO with Separate TB.\nd) DI, DO TB to be mounted on separate column\ne) Signal from MCC to Field with Separate TB.",

    is_cable_alley_section_selected:
      pccPanelData?.is_cable_alley_section_selected || 1,
    is_power_and_bus_separation_section_selected:
      pccPanelData?.is_power_and_bus_separation_section_selected || 1,
    is_both_side_extension_section_selected:
      pccPanelData?.is_both_side_extension_section_selected || 1,
    ga_gland_plate_3mm_drill_type:
      pccPanelData?.ga_gland_plate_3mm_drill_type || "Knockout",
    ga_gland_plate_thickness:
      pccPanelData?.ga_gland_plate_thickness || "1.6 mm",
    ga_busbar_chamber_position:
      pccPanelData?.ga_busbar_chamber_position || "Top",
    ga_power_and_control_busbar_separation:
      pccPanelData?.ga_power_and_control_busbar_separation || "FRP",
    ga_enclosure_protection_degree:
      pccPanelData?.ga_enclosure_protection_degree || "IP65",
    ga_cable_entry_position: pccPanelData?.ga_cable_entry_position || "Top",
    ppc_painting_standards: pccPanelData?.ppc_painting_standards || "OEM",
    ppc_interior_and_exterior_paint_shade:
      pccPanelData?.ppc_interior_and_exterior_paint_shade || "RAL 7035",
    ppc_component_mounting_plate_paint_shade:
      pccPanelData?.ppc_component_mounting_plate_paint_shade || "RAL 7035",
    ppc_base_frame_paint_shade:
      pccPanelData?.ppc_base_frame_paint_shade || "Black",
    ppc_minimum_coating_thickness:
      pccPanelData?.ppc_minimum_coating_thickness ||
      "As per Client Specification",
    ppc_pretreatment_panel_standard:
      pccPanelData?.ppc_pretreatment_panel_standard ||
      "- Panel Shall Be Degreased And Derusted(7 Tank Pretreatment)\n- Panel Shall Be Powder Coated.\nOR\n- OEM standard for pretreatment.    ",
    general_requirments_for_construction:
      pccPanelData?.general_requirments_for_construction || "Not Applicable",
    is_punching_details_for_boiler_selected:
      pccPanelData?.is_punching_details_for_boiler_selected?.toString() || "0",
    boiler_model: pccPanelData?.boiler_model || "NA",
    boiler_fuel: pccPanelData?.boiler_fuel || "NA",
    boiler_year: pccPanelData?.boiler_year || "NA",
    boiler_power_supply_vac:
      pccPanelData?.boiler_power_supply_vac || projectInfo?.main_supply_lv,
    boiler_power_supply_phase:
      pccPanelData?.boiler_power_supply_phase ||
      projectInfo?.main_supply_lv_phase,
    boiler_power_supply_frequency:
      pccPanelData?.boiler_power_supply_frequency || projectInfo?.frequency,
    boiler_control_supply_vac:
      pccPanelData?.boiler_control_supply_vac || projectInfo?.control_supply,
    boiler_control_supply_phase:
      pccPanelData?.boiler_control_supply_phase ||
      projectInfo?.control_supply_phase,
    boiler_control_supply_frequency:
      pccPanelData?.boiler_control_supply_frequency || projectInfo?.frequency,
    boiler_evaporation: pccPanelData?.boiler_evaporation || "NA",
    boiler_output: pccPanelData?.boiler_output || "NA",
    boiler_connected_load: pccPanelData?.boiler_connected_load || "NA",
    boiler_design_pressure: pccPanelData?.boiler_design_pressure || "NA",
    is_punching_details_for_heater_selected:
      pccPanelData?.is_punching_details_for_heater_selected?.toString() || "0",
    heater_model: pccPanelData?.heater_model || "NA",
    heater_fuel: pccPanelData?.heater_fuel || "NA",
    heater_year: pccPanelData?.heater_year || "NA",
    heater_power_supply_vac:
      pccPanelData?.heater_power_supply_vac || projectInfo?.main_supply_lv,
    heater_power_supply_phase:
      pccPanelData?.heater_power_supply_phase ||
      projectInfo?.main_supply_lv_phase,
    heater_power_supply_frequency:
      pccPanelData?.heater_power_supply_frequency || projectInfo?.frequency,
    heater_control_supply_vac:
      pccPanelData?.heater_control_supply_vac || projectInfo?.control_supply,
    heater_control_supply_phase:
      pccPanelData?.heater_control_supply_phase ||
      projectInfo?.control_supply_phase,
    heater_control_supply_frequency:
      pccPanelData?.heater_control_supply_frequency || projectInfo?.frequency,
    heater_evaporation: pccPanelData?.heater_evaporation || "NA",
    heater_output: pccPanelData?.heater_output || "NA",
    heater_connected_load: pccPanelData?.heater_connected_load || "NA",
    heater_temperature: pccPanelData?.heater_temperature || "NA",
    spg_name_plate_unit_name: pccPanelData?.spg_name_plate_unit_name || "NA",
    spg_name_plate_capacity: pccPanelData?.spg_name_plate_capacity || "NA",
    spg_name_plate_manufacturing_year:
      pccPanelData?.spg_name_plate_manufacturing_year || "NA",
    spg_name_plate_weight: pccPanelData?.spg_name_plate_weight || "NA",
    spg_name_plate_oc_number:
      pccPanelData?.spg_name_plate_oc_number ||
      projectMetadata?.project_oc_number,
    spg_name_plate_part_code: pccPanelData?.spg_name_plate_part_code || "NA",
    is_spg_applicable: pccPanelData?.is_spg_applicable?.toString() || "0",
    commissioning_spare: pccPanelData?.commissioning_spare || "Not Applicable",
    two_year_operational_spare:
      pccPanelData?.two_year_operational_spare || "Not Applicable",
  };
};

const PCCPanel = ({
  revision_id,
  panel_id,
  setActiveKey,
}: {
  revision_id: string;
  panel_id: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const params = useParams();
  const project_id = params.project_id;
  const { data: pccPanelData, isLoading: isPccPanelLoading } = useGetData(
    `${PCC_PANEL}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${panel_id}"]]`
  );
  const getProjectInfoUrl = `${PROJECT_INFO_API}/${project_id}`;
  const getProjectMetadataUrl = `${PROJECT_API}/${project_id}`;

  const { data: projectMetadata, isLoading: isProjectMetaDataLoading } =
    useGetData(getProjectMetadataUrl);
  const { data: projectInfo, isLoading: isProjectInfoLoading } =
    useGetData(getProjectInfoUrl);

  const [loading, setLoading] = useState(false);
  const userInfo = useCurrentUser();

  const isLoading =
    isPccPanelLoading || isProjectInfoLoading || isProjectMetaDataLoading;

  const { dropdown } = useMCCPCCPanelDropdowns();

  const incomer_ampere_options = dropdown["SD Incomer Ampere"];
  const current_transformer_coating_options =
    dropdown["Current Transformer Coating"];
  const current_transformer_number_options =
    dropdown["Current Transformer Number"];
  const current_transformer_configuration_options =
    dropdown["Current Transformer Configuration"];

  const led_type_on_input_options = dropdown["ON Indication Lamp"];
  const led_type_off_input_options = dropdown["OFF Indication Lamp"];
  const led_type_trip_input_options = dropdown["Trip Indication Lamp"];

  const acb_service_indication_options =
    dropdown["ACB Service Indication lamp"];
  const acb_spring_charge_options =
    dropdown["ACB Spring Charge Indication lamp"];
  const trip_circuit_healthy_indication_options =
    dropdown["Trip Circuit Healthy Indication lamp"];

  const incomer_pole_options = dropdown["SD Incomer Pole"];
  const incomer_type_options = dropdown["SD Incomer Type"];
  const incomer_above_ampere_options = dropdown["SD Incomer Above Ampere"];
  const incomer_above_pole_options = dropdown["SD Incomer Above Pole"];
  const incomer_above_type_options = dropdown["SD Incomer Above Type"];
  const analog_meters_options = dropdown["Analog Meters"];
  const digital_meters_options = dropdown["Digital Meters"];
  const communication_protocol_options = dropdown["Communication Protocol"];
  const ga_moc_material_options = dropdown["GA MOC"];
  const ga_moc_thickness_door_options = dropdown["GA MOC Thickness Door"];
  const ga_moc_thickness_covers_options = dropdown["GA MOC Thickness Covers"];
  const ga_mcc_compartmental_options = dropdown["GA MCC Compartmental"];
  const ga_mcc_construction_front_type_options =
    dropdown["GA MCC Construction Front Type"];
  const ga_mcc_construction_drawout_type_options =
    dropdown["GA MCC Construction Draw Out Type"];
  const ga_mcc_construction_type_options = dropdown["GA MCC Construction Type"];
  const ga_current_density_options = dropdown["GA Current Density"];
  const ga_panel_mounting_frame_options = dropdown["GA Panel Mounting Frame"];
  const ga_panel_mounting_height_options = dropdown["GA Panel Mounting Height"];
  const ga_gland_plate_3mm_drill_type_options =
    dropdown["GA Gland Plate 3mm Drill Type"];
  const ga_busbar_chamber_position_options =
    dropdown["GA Busbar Chamber Position"];
  const ga_power_and_control_busbar_separation_options =
    dropdown["GA Power and Control Busbar Separation"];
  const ga_enclosure_protection_degree_options =
    dropdown["GA Enclosure Protection Degree"];
  const ga_cable_entry_position_options = dropdown["GA Cable Entry Position"];
  const ppc_interior_and_exterior_paint_shade_options =
    dropdown["PPC Interior and Exterior Paint Shade"];
  const ppc_component_mounting_plate_paint_shade_options =
    dropdown["PPC Component Mounting Plate Paint Shade"];

  const base_frame_options = ga_panel_mounting_height_options?.filter(
    (item: any) => item.name == "100" || item.name === "75"
  );

  const extended_frame_options = ga_panel_mounting_height_options?.filter(
    (item: any) =>
      item.name === "200" || item.name === "300" || item.name === "500"
  );

  const { formState, control, watch, reset, setValue, handleSubmit } = useForm({
    resolver: zodResolver(pccPanelValidationSchema),
    defaultValues: getDefaultValues(
      projectMetadata,
      projectInfo,
      pccPanelData?.[0]
    ),
    mode: "onSubmit",
  });
  const router = useRouter();

  console.log("form errors", formState.errors);
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  useEffect(() => {
    console.log(pccPanelData?.[0], "PCC");
    console.log(
      getDefaultValues(projectMetadata, projectInfo, pccPanelData?.[0]),
      "PCC default"
    );

    reset(getDefaultValues(projectMetadata, projectInfo, pccPanelData?.[0]));
  }, [pccPanelData, projectMetadata, projectInfo, reset]);

  const incomer_ampere_controlled = watch("incomer_ampere");
  const ga_panel_mounting_frame_controlled = watch("ga_panel_mounting_frame");
  const ga_current_density_controlled = watch(
    "busbar_material_of_construction"
  );
  const control_transformer_coating_controlled = watch(
    "control_transformer_coating"
  );
  const [hasACB, setHasACB] = useState(false);
  const incomer_type = watch("incomer_type");
  const currentTransformerNumber = watch("current_transformer_number");
  const tabsCount = useRef("0");
  useEffect(() => {
    if (typeof window !== "undefined") {
      tabsCount.current = localStorage.getItem("dynamic-tabs-count") ?? "0";
    }
  }, []);
  const incomer_above_type = watch("incomer_above_type");
  useEffect(() => {
    const hasACB =
      (incomer_type && incomer_type.includes("ACB")) ||
      (incomer_above_type && incomer_above_type.includes("ACB"));
    if (!hasACB) {
      setValue("is_blue_cb_spring_charge_selected", "NA");
      setValue("is_red_cb_in_service", "NA");
      setValue("is_white_healthy_trip_circuit_selected", "NA");
    } else {
      setValue("is_blue_cb_spring_charge_selected", "Blue");
      setValue("is_red_cb_in_service", "Red");
      setValue("is_white_healthy_trip_circuit_selected", "White");
    }
    setHasACB(hasACB);
  }, [incomer_type, incomer_above_type, setValue]);
  useEffect(() => {
    if (control_transformer_coating_controlled === "NA") {
      setValue("control_transformer_configuration", "NA");
    }
  }, [control_transformer_coating_controlled, setValue]);

  useEffect(() => {
    if (ga_panel_mounting_frame_controlled !== "Base Frame") {
      setValue("ga_panel_mounting_height", "200");
    } else {
      setValue("ga_panel_mounting_height", "100");
    }
  }, [
    ga_panel_mounting_frame_controlled,
    ga_panel_mounting_height_options,
    setValue,
  ]);

  useEffect(() => {
    if (ga_current_density_controlled === "Aluminium") {
      setValue("ga_current_density", "0.8 A/Sq. mm");
    } else {
      setValue("ga_current_density", "1.0 A/Sq. mm");
    }
  }, [ga_current_density_controlled, ga_current_density_options, setValue]);
  useEffect(() => {
    if (currentTransformerNumber === "One") {
      setValue("current_transformer_configuration", "Y-Phase with CT");
    } else if (currentTransformerNumber === "Three") {
      setValue("current_transformer_configuration", "All Phase with CT");
    } else if (currentTransformerNumber === "NA") {
      setValue("current_transformer_configuration", "NA");
    }
  }, [currentTransformerNumber, setValue]);
  useEffect(() => {
    if (incomer_ampere_controlled === "1000") {
      setValue("incomer_above_ampere", "1001");
    } else if (incomer_ampere_controlled === "400") {
      setValue("incomer_above_ampere", "401");
    } else if (incomer_ampere_controlled === "630") {
      setValue("incomer_above_ampere", "631");
    } else {
      setValue("incomer_above_ampere", "801");
    }
  }, [incomer_ampere_controlled, setValue]);

  const handleError = (error: any) => {
    try {
      const errorObj = JSON.parse(error?.message) as any;
      message?.error(errorObj?.message);
    } catch (parseError) {
      console.error(parseError);
      message?.error(error?.message || "An unknown error occured");
    }
  };

  const onSubmit: SubmitHandler<
    zod.infer<typeof pccPanelValidationSchema>
  > = async (data) => {
    setLoading(true);
    try {
      // console.log(data);

      const fieldsToStringify = ["mi_analog", "mi_digital"];

      const transformedData: any = { ...data };

      fieldsToStringify.forEach((field) => {
        if (Array.isArray(transformedData[field])) {
          transformedData[field] = JSON.stringify(transformedData[field]);
        }
      });
      await updateData(
        `${PCC_PANEL}/${pccPanelData[0].name}`,
        false,
        transformedData
      );
      message.success("Panel Data Saved Successfully");
      const redirectToLayout = () => {
        router.push(`/project/${project_id}/design-basis/layout`);
      };
      // const tabsCount = localStorage.getItem("dynamic-tabs-count") ?? "0";
      setActiveKey((prevKey: string) => {
        if (prevKey == tabsCount.current) {
          redirectToLayout();
          return "1";
        }

        return (parseInt(prevKey, 10) + 1).toString();
      });
      // setActiveKey((prevKey: string) => (parseInt(prevKey, 10) + 1).toString());
    } catch (error) {
      console.error("error: ", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <>
      <Divider>
        <span className="font-bold text-slate-700">Incomer Selection</span>
      </Divider>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 px-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h4 className="flex-1 text-sm font-semibold text-slate-700">
              Incomer
            </h4>
            <div className="text-xs font-semibold text-blue-500">
              Upto and including
            </div>
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incomer_ampere"
              label="Ampere"
              options={incomer_ampere_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incomer_pole"
              label="Pole"
              options={incomer_pole_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incomer_type"
              label="Type"
              options={incomer_type_options || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h4 className="flex-1 text-sm font-semibold text-slate-700">
              Incomer Above
            </h4>
            <div className="text-xs font-semibold text-blue-500">
              Above and including
            </div>
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incomer_above_ampere"
              label="Ampere"
              options={incomer_above_ampere_options || []}
              disabled={true}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incomer_above_pole"
              label="Pole"
              options={incomer_above_pole_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incomer_above_type"
              label="Type"
              options={incomer_above_type_options || []}
              size="small"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="">
            <CustomCheckboxInput
              control={control}
              name="is_under_or_over_voltage_selected"
              label="Under / Over Voltage"
            />
          </div>
          <div className="">
            <CustomCheckboxInput
              control={control}
              name="is_lsig_selected"
              label="LSIG"
            />
          </div>
          <div className="">
            <CustomCheckboxInput
              control={control}
              name="is_lsi_selected"
              label="LSI"
            />
          </div>
          <div className="">
            <CustomCheckboxInput
              control={control}
              name="is_neural_link_with_disconnect_facility_selected"
              label="Neutral Link With Disconnect Facility"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            {/* <div className="col-span-2 font-semibold">Indication (LED Type Lamp)</div> */}
            {/*<CustomRadioSelect
              control={control}
              name="is_led_type_lamp_selected"
              label=""
              options={[
                { label: "ON", value: "1" },
                { label: "OFF", value: "0" },
              ]}
            /> */}
            <CustomCheckboxInput
              control={control}
              name="is_indication_on_selected"
              label="ON Indication Lamp"
            />
            <CustomSingleSelect
              control={control}
              name="led_type_on_input"
              label=""
              disabled={!Boolean(watch("is_indication_on_selected"))}
              // options={led_type_on_input_options || []}
              options={
                led_type_on_input_options
                  ? led_type_on_input_options.filter(
                      (el: any) => el.name !== "NA"
                    )
                  : []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomCheckboxInput
              control={control}
              name="is_indication_off_selected"
              label="OFF Indication Lamp"
            />
            <CustomSingleSelect
              control={control}
              name="led_type_off_input"
              label=""
              disabled={!Boolean(watch("is_indication_off_selected"))}
              // options={led_type_off_input_options || []}
              options={
                led_type_off_input_options
                  ? led_type_off_input_options.filter(
                      (el: any) => el.name !== "NA"
                    )
                  : []
              }
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomCheckboxInput
              control={control}
              name="is_indication_trip_selected"
              label="Trip Indication Lamp"
            />
            <CustomSingleSelect
              control={control}
              name="led_type_trip_input"
              label=""
              disabled={!Boolean(watch("is_indication_trip_selected"))}
              // options={led_type_trip_input_options || []}
              options={
                led_type_trip_input_options
                  ? led_type_trip_input_options.filter(
                      (el: any) => el.name !== "NA"
                    )
                  : []
              }
              size="small"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="is_blue_cb_spring_charge_selected"
              label="ACB Spring Charge Indication lamp"
              size="small"
              disabled={!hasACB}
              options={moveNAtoEnd(acb_spring_charge_options) || []}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="is_red_cb_in_service"
              label="ACB Service Indication lamp"
              size="small"
              disabled={!hasACB}
              options={moveNAtoEnd(acb_service_indication_options) || []}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="is_white_healthy_trip_circuit_selected"
              label="Trip Circuit Healthy Indication lamp"
              size="small"
              disabled={!hasACB}
              options={
                moveNAtoEnd(trip_circuit_healthy_indication_options) || []
              }
            />
          </div>
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="alarm_annunciator"
              label="Alarm Annunciator"
              options={[
                { label: "Applicable", value: "Applicable" },
                { label: "Not Applicable", value: "Not Applicable" },
              ]}
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Metering Instruments for Incomer
          </span>
        </Divider>

        <div className="flex gap-4">
          <div className="flex-1">
            <CustomMultiSelect
              control={control}
              name="mi_analog"
              label="Analog Meter"
              options={moveNAtoEnd(analog_meters_options) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomMultiSelect
              control={control}
              name="mi_digital"
              label="Digital Meter"
              options={moveNAtoEnd(digital_meters_options) || []}
              size="small"
            />
          </div>

          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="mi_communication_protocol"
              label="Communication Protocol"
              options={moveNAtoEnd(communication_protocol_options) || []}
              size="small"
            />
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">
            Current Transformer for Incomer
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer_coating"
              label="Current Transformer Coating"
              options={moveNAtoEnd(current_transformer_coating_options) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer_number"
              label="Current Transformer Quantity"
              options={moveNAtoEnd(current_transformer_number_options) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="current_transformer_configuration"
              label="Current Transformer Configuration"
              options={
                moveNAtoEnd(current_transformer_configuration_options) || []
              }
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">General Arrangement</span>
        </Divider>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_moc_material"
              label="MOC"
              options={ga_moc_material_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_moc_thickness_door"
              label="Component Mounting Plate Thickness"
              options={ga_moc_thickness_door_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="door_thickness"
              label="Door Thickness"
              options={ga_moc_thickness_door_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_moc_thickness_covers"
              label="Top & Side Thickness"
              options={ga_moc_thickness_covers_options || []}
              size="small"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_pcc_compartmental"
              label="Panel Front Type"
              options={ga_mcc_compartmental_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_pcc_construction_front_type"
              label="Type of Construction for Board"
              options={ga_mcc_construction_front_type_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="incoming_drawout_type"
              label="Panel Incoming Feeder Drawout Type"
              options={ga_mcc_construction_drawout_type_options || []}
              disabled={watch("ga_pcc_compartmental").includes("Non ")}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="outgoing_drawout_type"
              label="Panel Outgoing Feeder Drawout Type"
              options={ga_mcc_construction_drawout_type_options || []}
              disabled={watch("ga_pcc_compartmental").includes("Non ")}
              size="small"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_pcc_construction_type"
              label="Panel Construction Type"
              options={ga_mcc_construction_type_options || []}
              size="small"
            />
          </div>
          {/* <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="busbar_material_of_construction"
              label="Busbar Material Of Construction"
              options={[
                { label: "Aluminium", value: "Aluminium" },
                { label: "Copper", value: "Copper" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_current_density"
              label="Current Density"
              options={
                watch("busbar_material_of_construction") === "Aluminium"
                  ? aluminium_current_density_options
                  : copper_current_density_options
              }
              size="small"
            />
          </div> */}
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_panel_mounting_frame"
              label="Panel Mounting"
              options={ga_panel_mounting_frame_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_panel_mounting_height"
              label="Height of Base Frame"
              options={
                (watch("ga_panel_mounting_frame") === "Base Frame"
                  ? base_frame_options
                  : extended_frame_options) || []
              }
              size="small"
              suffixIcon={
                <>
                  <p className="font-semibold text-blue-500">mm</p>
                </>
              }
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          {/* <h4 className="mr-2 font-semibold text-slate-700">Sections</h4> */}
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="is_marshalling_section_selected"
              label="Marshalling Section"
              options={[
                { label: "Applicable", value: "1" },
                { label: "Not Applicable", value: "0" },
              ]}
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="marshalling_section_text_area"
              label=""
              disabled={watch("is_marshalling_section_selected") === "0"}
            />
          </div>
          <div className="flex-1">
            <CustomCheckboxInput
              control={control}
              name="is_cable_alley_section_selected"
              label="Cable Alley Section"
            />
          </div>
          <div className="flex-1">
            <CustomCheckboxInput
              control={control}
              name="is_power_and_bus_separation_section_selected"
              label="Separation Between Power & Control Bus"
            />
          </div>
          <div className="">
            <CustomCheckboxInput
              control={control}
              name="is_both_side_extension_section_selected"
              label="Extension On Both Sides"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_gland_plate_3mm_drill_type"
              label="Gland Plate Type"
              options={moveNAtoEnd(ga_gland_plate_3mm_drill_type_options) || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_gland_plate_thickness"
              label="Gland Plate Thickness"
              options={ga_moc_thickness_covers_options || []}
              size="small"
            />
          </div>
          {/* <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_gland_plate_3mm_attachment_type"
              label="Gland Plate (3mm) Opening Type"
              options={ga_gland_plate_3mm_attachment_type_options}
              size="small"
            />
          </div> */}
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_busbar_chamber_position"
              label="Busbar Chamber Position"
              options={ga_busbar_chamber_position_options || []}
              size="small"
            />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_power_and_control_busbar_separation"
              label="Separation Between Power & Control Busbar"
              options={ga_power_and_control_busbar_separation_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_enclosure_protection_degree"
              label="Degree of Enclosure Protection"
              options={ga_enclosure_protection_degree_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ga_cable_entry_position"
              label="Cable Entry Position"
              options={ga_cable_entry_position_options || []}
              size="small"
            />
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">
            Painting / Powder Coating
          </span>
        </Divider>

        <div className="mt-2 flex items-center gap-4">
          {/* <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ppc_painting_standards"
              label="Painting Standards"
              options={ppc_painting_standards_options || []}
              size="small"
              disabled
            />
          </div> */}
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ppc_interior_and_exterior_paint_shade"
              label="Paint Shade for Interior and Exterior"
              options={ppc_interior_and_exterior_paint_shade_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ppc_component_mounting_plate_paint_shade"
              label="Paint Shade for Component Mounting Plate"
              options={ppc_component_mounting_plate_paint_shade_options || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="ppc_minimum_coating_thickness"
              label="Minimum Paint Thickness"
              // options={ppc_minimum_coating_thickness_options}
              size="small"
            />
          </div>
          {/* <div className="">
            <CustomSingleSelect
              control={control}
              name="ppc_base_frame_paint_shade"
              label="Paint Shade for Base Frame"
              options={ppc_base_frame_paint_shade_options || []}
              size="small"
              disabled
            />
          </div> */}

          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="ppc_pretreatment_panel_standard"
              label="Standard for Pretreatment"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="general_requirments_for_construction"
              label="General Requirements for Construction"
            />
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">Spares</span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="commissioning_spare"
              label="Commissioning Spare"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="two_year_operational_spare"
              label="Two Year Operational Spare"
            />
          </div>
        </div>

        {userInfo?.division === HEATING && (
          <>
            <Divider>
              <span className="font-bold text-slate-700">Punching Details</span>
            </Divider>
            <div className="flex items-center gap-4">
              <h4 className="font-bold text-slate-700">
                Punching Details For Boiler
              </h4>
              <div>
                <CustomRadioSelect
                  control={control}
                  name="is_punching_details_for_boiler_selected"
                  label=""
                  options={[
                    { label: "Yes", value: "1" },
                    { label: "No", value: "0" },
                  ]}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_model"
                  label="Model"
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_fuel"
                  label="Fuel"
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_year"
                  label="Year"
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_power_supply_vac"
                  label="Power Supply"
                  addonAfter={"VAC"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_power_supply_phase"
                  label="Power Supply"
                  addonAfter={"Phase"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_power_supply_frequency"
                  label="Power Supply"
                  addonAfter={"Hz"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_control_supply_vac"
                  label="Control Supply"
                  addonAfter={"VAC"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_control_supply_phase"
                  label="Control Supply"
                  addonAfter={"Phase"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_control_supply_frequency"
                  label="Control Supply"
                  addonAfter={"Hz"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_evaporation"
                  label="Evaporation"
                  addonAfter={"Kg/Hr"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_output"
                  label="Output"
                  addonAfter={"MW"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_connected_load"
                  label="Connected Load"
                  addonAfter={"KW"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="boiler_design_pressure"
                  label="Design Pressure"
                  addonAfter={"Kg/cm2(g)/Bar"}
                  disabled={
                    watch("is_punching_details_for_boiler_selected") === "0"
                  }
                />
              </div>
            </div>
            <Divider />
            <div className="mt-2 flex items-center gap-4">
              <h4 className="font-bold text-slate-700">
                Punching Details For Heater
              </h4>
              <div>
                <CustomRadioSelect
                  control={control}
                  name="is_punching_details_for_heater_selected"
                  label=""
                  options={[
                    { label: "Yes", value: "1" },
                    { label: "No", value: "0" },
                  ]}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_model"
                  label="Model"
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_fuel"
                  label="Fuel"
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_year"
                  label="Year"
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_power_supply_vac"
                  label="Power Supply"
                  addonAfter={"VAC"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_power_supply_phase"
                  label="Power Supply"
                  addonAfter={"Phase"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_power_supply_frequency"
                  label="Power Supply"
                  addonAfter={"Hz"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_control_supply_vac"
                  label="Control Supply"
                  addonAfter={"VAC"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_control_supply_phase"
                  label="Control Supply"
                  addonAfter={"Phase"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_control_supply_frequency"
                  label="Control Supply"
                  addonAfter={"Hz"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_evaporation"
                  label="Evaporation"
                  addonAfter={"Kcal/Hr"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_output"
                  label="Output"
                  addonAfter={"MW"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_connected_load"
                  label="Connected Load"
                  addonAfter={"KW"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="heater_temperature"
                  label="Temperature"
                  addonAfter={"Deg C"}
                  disabled={
                    watch("is_punching_details_for_heater_selected") === "0"
                  }
                />
              </div>
            </div>
          </>
        )}
        {userInfo?.division === WWS_SPG && (
          <>
            <Divider>
              <span className="font-bold text-slate-700">
                Name Plate Details For SPG
              </span>
              <div>
                <CustomRadioSelect
                  control={control}
                  name="is_spg_applicable"
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
                <CustomTextInput
                  control={control}
                  name="spg_name_plate_unit_name"
                  label="Unit Name"
                  disabled={watch("is_spg_applicable") === "0"}
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="spg_name_plate_capacity"
                  label="Capacity"
                  disabled={watch("is_spg_applicable") === "0"}
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="spg_name_plate_manufacturing_year"
                  label="Year of Manufacturing"
                  disabled={watch("is_spg_applicable") === "0"}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="spg_name_plate_weight"
                  label="Weight"
                  disabled={watch("is_spg_applicable") === "0"}
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="spg_name_plate_oc_number"
                  label="OC No."
                  disabled={watch("is_spg_applicable") === "0"}
                />
              </div>
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="spg_name_plate_part_code"
                  label="Part Code"
                  disabled={watch("is_spg_applicable") === "0"}
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-4 w-full">
          <CustomTextAreaInput
            control={control}
            name="special_note"
            label="Special Notes"
            rows={4}
          />
        </div>

        <div className="mt-2 flex w-full justify-end">
          <Button type="primary" htmlType="submit" loading={loading}>
            Save and Next
          </Button>
        </div>
      </form>
    </>
  );
};

export default PCCPanel;
