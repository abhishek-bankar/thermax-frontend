"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Button, Divider, message } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { updateData } from "@/actions/crud-actions";
import CustomTextInput from "@/components/FormInputs/CustomInput";
import CustomTextNumber from "@/components/FormInputs/CustomInputNumber";
import CustomRadioSelect from "@/components/FormInputs/CustomRadioSelect";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import CustomTextAreaInput from "@/components/FormInputs/CustomTextArea";
import {
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  MCC_PCC_PLC_PANEL_3,
  PROJECT_API,
} from "@/configs/api-endpoints";
import { useGetData, useNewGetData } from "@/hooks/useCRUD";
import usePLCDropdowns from "./PLCDropdown";
import { plcPanelValidationSchema } from "../schemas";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { HEATING } from "@/configs/constants";
import {
  moveNAtoEnd,
  sortAlphaNumericArray,
  sortDropdownOptions,
} from "@/utils/helpers";
import { useParams, useRouter } from "next/navigation";
import { PercentageOutlined } from "@ant-design/icons";

const getDefaultValues = (plcData: any) => {
  const defaultValues = {
    // Supply Requirements
    ups_control_voltage:
      plcData?.ups_control_voltage || "230 VAC, 1-Phase, 2 Wire",
    non_ups_control_voltage:
      plcData?.non_ups_control_voltage || "230 VAC, 1-Phase, 2 Wire",
    is_bulk_power_supply_selected: plcData?.is_bulk_power_supply_selected,
    // UPS
    ups_scope: plcData?.ups_scope || "Client Scope",
    ups_input_voltage_3p: plcData?.ups_input_voltage_3p || "NA",
    ups_input_voltage_1p: plcData?.ups_input_voltage_1p || "NA",
    ups_output_voltage_1p:
      plcData?.ups_output_voltage_1p || "230 VAC, 1-Phase, 2 Wire",
    ups_type: plcData?.ups_type || "NA",
    ups_battery_type: plcData?.ups_battery_type || "NA",
    is_ups_battery_mounting_rack_selected:
      plcData?.is_ups_battery_mounting_rack_selected,
    ups_battery_backup_time: plcData?.ups_battery_backup_time || "NA",
    ups_redundancy: plcData?.ups_redundancy || "NA",
    // PLC Hardware
    plc_cpu_system_series: plcData?.plc_cpu_system_series || "VTS",
    plc_cpu_system_input_voltage:
      plcData?.plc_cpu_system_input_voltage || "24 VDC",
    plc_cpu_system_battery_backup: plcData?.plc_cpu_system_battery_backup || "",
    plc_cpu_system_memory_free_space_after_program:
      plcData?.plc_cpu_system_memory_free_space_after_program || "20",
    // Redundancy
    is_power_supply_plc_cpu_system_selected:
      plcData?.is_power_supply_plc_cpu_system_selected,
    is_power_supply_input_output_module_selected:
      plcData?.is_power_supply_input_output_module_selected,
    is_plc_input_output_modules_system_selected:
      plcData?.is_plc_input_output_modules_system_selected,
    is_plc_cpu_system_and_input_output_modules_system_selected:
      plcData?.is_plc_cpu_system_and_input_output_modules_system_selected,
    is_plc_cpu_system_and_hmi_scada_selected:
      plcData?.is_plc_cpu_system_and_hmi_scada_selected,
    is_plc_cpu_system_and_third_party_devices_selected:
      plcData?.is_plc_cpu_system_and_third_party_devices_selected,
    is_plc_cpu_system_selected: plcData?.is_plc_cpu_system_selected,
    plc_cpu_system: plcData?.plc_cpu_system || "",
    // PLC Panel Mounted
    panel_mounted_ac: plcData?.panel_mounted_ac || "",
    is_marshalling_cabinet_for_plc_and_ups_selected:
      plcData?.is_marshalling_cabinet_for_plc_and_ups_selected,
    marshalling_cabinet_for_plc_and_ups:
      plcData?.marshalling_cabinet_for_plc_and_ups || "As per OEM",
    // Panel Mounted Push Buttons, Indication lamps & Colors
    is_electronic_hooter_selected: plcData?.is_electronic_hooter_selected,
    electronic_hooter_acknowledge:
      plcData?.electronic_hooter_acknowledge || "NA",
    panel_power_supply_on_color: plcData?.panel_power_supply_on_color || "NA",
    panel_power_supply_off_color:
      plcData?.panel_power_supply_off_color || "Green",
    indicating_lamp_color_for_nonups_power_supply:
      plcData?.indicating_lamp_color_for_nonups_power_supply || "Red",
    indicating_lamp_colour_for_ups_power_supply:
      plcData?.indicating_lamp_colour_for_ups_power_supply || "NA",
    // IO Modules
    // DI Modules
    di_module_channel_density:
      plcData?.di_module_channel_density || "8 Nos. Per Card",
    di_module_loop_current: plcData?.di_module_loop_current || "VTS",
    di_module_isolation: plcData?.di_module_isolation || "Galvanic Isolation",
    di_module_input_type:
      plcData?.di_module_input_type || "Potential Free Contacts",
    di_module_interrogation_voltage:
      plcData?.di_module_interrogation_voltage || "24 VDC",
    di_module_scan_time: plcData?.di_module_scan_time || "VTS",
    // DO Modules
    do_module_channel_density:
      plcData?.do_module_channel_density || "8 Nos. Per Card",
    do_module_loop_current: plcData?.do_module_loop_current || "VTS",
    do_module_isolation: plcData?.do_module_isolation || "Galvanic Isolation",
    do_module_output_type:
      plcData?.do_module_output_type || "Potential Free Contacts",
    // Interposing Relay
    interposing_relay: plcData?.interposing_relay || "Applicable for DI",
    interposing_relay_contacts_rating:
      plcData?.interposing_relay_contacts_rating || "230 VAC, 5AMP",
    is_no_of_contacts_selected: plcData?.is_no_of_contacts_selected,
    no_of_contacts: plcData?.no_of_contacts || "1NO + 1NC",
    // AI Modules
    ai_module_channel_density:
      plcData?.ai_module_channel_density || "8 Nos. Per Card",
    ai_module_loop_current: plcData?.ai_module_loop_current || "VTS",
    ai_module_isolation: plcData?.ai_module_isolation || "Galvanic Isolation",
    ai_module_input_type: plcData?.ai_module_input_type || "4-20 mA DC",
    ai_module_scan_time: plcData?.ai_module_scan_time || "VTS",
    is_ai_module_hart_protocol_support_selected:
      plcData?.is_ai_module_hart_protocol_support_selected,
    // AO Modules
    ao_module_channel_density:
      plcData?.ao_module_channel_density || "8 Nos. Per Card",
    ao_module_loop_current: plcData?.ao_module_loop_current || "VTS",
    ao_module_isolation: plcData?.ao_module_isolation || "Galvanic Isolation",
    ao_module_output_type:
      plcData?.ao_module_output_type || "Potential Free Contacts",
    ao_module_scan_time: plcData?.ao_module_scan_time || "VTS",
    is_ao_module_hart_protocol_support_selected:
      plcData?.is_ao_module_hart_protocol_support_selected,
    // RTD Modules
    rtd_module_channel_density:
      plcData?.rtd_module_channel_density || "8 Nos. Per Card",
    rtd_module_loop_current: plcData?.rtd_module_loop_current || "VTS",
    rtd_module_isolation: plcData?.rtd_module_isolation || "Galvanic Isolation",
    rtd_module_input_type: plcData?.rtd_module_input_type || "",
    rtd_module_scan_time: plcData?.rtd_module_scan_time || "VTS",
    is_rtd_module_hart_protocol_support_selected:
      plcData?.is_rtd_module_hart_protocol_support_selected,
    // Thermocouple Modules
    thermocouple_module_channel_density:
      plcData?.thermocouple_module_channel_density || "8 Nos. Per Card",
    thermocouple_module_loop_current:
      plcData?.thermocouple_module_loop_current || "VTS",
    thermocouple_module_isolation:
      plcData?.thermocouple_module_isolation || "Galvanic Isolation",
    thermocouple_module_input_type:
      plcData?.thermocouple_module_input_type || "",
    thermocouple_module_scan_time:
      plcData?.thermocouple_module_scan_time || "VTS",
    is_thermocouple_module_hart_protocol_support_selected:
      plcData?.is_thermocouple_module_hart_protocol_support_selected,
    // Universal Modules
    universal_module_channel_density:
      plcData?.universal_module_channel_density || "8 Nos. Per Card",
    universal_module_loop_current:
      plcData?.universal_module_loop_current || "VTS",
    universal_module_isolation:
      plcData?.universal_module_isolation || "Galvanic Isolation",
    universal_module_input_type: plcData?.universal_module_input_type || "",
    universal_module_scan_time: plcData?.universal_module_scan_time || "VTS",
    is_universal_module_hart_protocol_support_selected:
      plcData?.is_universal_module_hart_protocol_support_selected,
    // Terminal Block Connectors
    di_module_terminal: plcData?.di_module_terminal || "Fuse With LED Terminal",
    do_module_terminal: plcData?.do_module_terminal || "Fuse With LED Terminal",
    ai_module_terminal: plcData?.ai_module_terminal || "Fuse Terminal",
    ao_module_terminal: plcData?.ao_module_terminal || "Fuse Terminal",
    rtd_module_terminal: plcData?.rtd_module_terminal || "Fuse Terminal",
    thermocouple_module_terminal:
      plcData?.thermocouple_module_terminal || "Fuse Terminal",
    // HMI
    is_hmi_selected: plcData?.is_hmi_selected,
    hmi_size: plcData?.hmi_size || "10",
    hmi_quantity: plcData?.hmi_quantity || 1,
    hmi_hardware_make: plcData?.hmi_hardware_make || "Allen Bradley",
    hmi_series: plcData?.hmi_series || "",
    hmi_input_voltage: plcData?.hmi_input_voltage || "24 VDC",
    hmi_battery_backup: plcData?.hmi_battery_backup || "",
    // Human Interface Device
    is_engineering_station_quantity_selected:
      plcData?.is_engineering_station_quantity_selected,
    engineering_station_quantity: plcData?.engineering_station_quantity || 1,
    is_engineering_cum_operating_station_quantity_selected:
      plcData?.is_engineering_cum_operating_station_quantity_selected,
    engineering_cum_operating_station_quantity:
      plcData?.engineering_cum_operating_station_quantity || 1,
    is_operating_station_quantity_selected:
      plcData?.is_operating_station_quantity_selected,
    operating_station_quantity: plcData?.operating_station_quantity || 1,
    // Software
    is_scada_program_development_license_quantity_selected:
      plcData?.is_scada_program_development_license_quantity_selected,
    scada_program_development_license_quantity:
      plcData?.scada_program_development_license_quantity || 1,
    is_scada_runtime_license_quantity_selected:
      plcData?.is_scada_runtime_license_quantity_selected,
    scada_runtime_license_quantity:
      plcData?.scada_runtime_license_quantity || 1,
    is_plc_progamming_software_license_quantity:
      plcData?.is_plc_progamming_software_license_quantity,
    plc_programming_software_license_quantity:
      plcData?.plc_programming_software_license_quantity || 1,

    // Engineering / Operating SCADA Station
    system_hardware: plcData?.system_hardware || "Commercial Grade",
    pc_hardware_specifications:
      plcData?.pc_hardware_specifications ||
      "Minimum Configuration = Min. I5/Latest Processor, Min. 16GB RAM, Min. 1 TB Hard Disk, Multimedia With DVD R/W Drive, Keyboard Mouse Set 1 No's With 4 USB Port.",
    monitor_size: plcData?.monitor_size || "32",
    windows_operating_system: plcData?.windows_operating_system || "",
    hardware_between_plc_and_scada_pc:
      plcData?.hardware_between_plc_and_scada_pc || "Approx 50 meter per PC",
    printer_type: plcData?.printer_type || "Laser Printer",
    printer_size: plcData?.printer_size || "A4",
    printer_quantity: plcData?.printer_quantity || 1,
    is_printer_with_suitable_communication_cable_selected:
      plcData?.is_printer_with_suitable_communication_cable_selected,
    is_furniture_selected: plcData?.is_furniture_selected,
    is_console_with_chair_selected: plcData?.is_console_with_chair_selected,
    is_plc_logic_diagram_selected: plcData?.is_plc_logic_diagram_selected,
    is_loop_drawing_for_complete_project_selected:
      plcData?.is_loop_drawing_for_complete_project_selected,
    // Communication
    interface_signal_and_control_logic_implementation:
      plcData?.interface_signal_and_control_logic_implementation || "NA",
    differential_pressure_flow_linearization:
      plcData?.differential_pressure_flow_linearization || "NA",
    third_party_comm_protocol_for_plc_cpu_system:
      plcData?.third_party_comm_protocol_for_plc_cpu_system || "Modbus",
    third_party_communication_protocol:
      plcData?.third_party_communication_protocol ||
      `1) IIOT Gateway - Ethernet communication
2) Boiler MCC Remote IO Section - Ethernet communication
(Note : MCC Panel Internal Communication to Remote IO Section -
- Panel Incomer communication to Remote IO PLC Section - Ethernet
- MFM communication to Remote IO PLC Section - Ethernet
- VFD communication to Remote IO PLC Section - Ethernet
- Feeder IO - Refer Remote IO List.
Note - MFM, VFD, ACB Incomer - Address List & Parameter shall be configure by PLC Vendor for Status indications`,
    client_system_communication:
      plcData?.client_system_communication ||
      `Applicable (Redundant Communication ports to Fiber Optic Gateway for Communication to customer DCS.
Note: Ethernet IP is preferrable protocol for communication of above package.
`,
    hardware_between_plc_and_third_party:
      plcData?.hardware_between_plc_and_third_party || "",
    hardware_between_plc_and_client_system:
      plcData?.hardware_between_plc_and_client_system || "Approx. 50 meter",
    is_iiot_selected: plcData?.is_iiot_selected,
    is_client_system_comm_with_plc_cpu_selected:
      plcData?.is_client_system_comm_with_plc_cpu_selected,
    iiot_gateway_note:
      plcData?.iiot_gateway_note ||
      `1) IIOT Gateway - Ethernet communication
2) Boiler MCC Remote IO Section - Ethernet communication
(Note : MCC Panel Internal Communication to Remote IO Section -
- Panel Incomer communication to Remote IO PLC Section - Ethernet
- MFM communication to Remote IO PLC Section - Ethernet
- VFD communication to Remote IO PLC Section - Ethernet
- Feeder IO - Refer Remote IO List.

Note - MFM, VFD, ACB Incomer - Address List & Parameter shall be configure by PLC Vendor for Status indications`,
    iiot_gateway_mounting:
      plcData?.iiot_gateway_mounting ||
      `IIOT gate way is mounted in PLC panel. Vendor to make the necessary mounting provision for the same. (Details will be shared during detailing). IIOT is in Thermax SSBU Scope of supply. IIOT will be installed at Site. IIOT is suitable for Profinet/Ethernet communication for which PLC vendor to ensure the compatability with Supplied PLC's.`,
    // Burner Controller LMV
    is_burner_controller_lmv_mounting_selected:
      plcData?.is_burner_controller_lmv_mounting_selected,
    hardware_between_plc_and_burner_controller_lmv:
      plcData?.hardware_between_plc_and_burner_controller_lmv ||
      `Burner Controller LMV in PLC panel. Vendor to make the necessary mounting provision for the same. (Details will be shared during detailing). Burner Controller LMV is in Thermax Scope of supply. Burner Controller LMV is suitable for Profinet/Ethernet communication for which PLC vendor to ensure the compatability with Supplied PLC's.`,
    burner_controller_lmv_mounting:
      plcData?.burner_controller_lmv_mounting || "APPROX. 50 METER",
    burner_controller_lmv_note: plcData?.burner_controller_lmv_note || "",
    // PLC Spares
    spare_input_and_output_notes: plcData?.spare_input_and_output_notes || "",
    commissioning_spare: plcData?.commissioning_spare || "",
    two_year_operational_spare: plcData?.two_year_operational_spare || "",
    project_specific_notes: plcData?.project_specific_notes || "",
  };
  return defaultValues;
};

const MCCcumPCCPLCPanel = ({
  revision_id,
  panel_id,
  setActiveKey,
}: {
  revision_id: string;
  panel_id: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { data: plcPanelData1 } = useNewGetData(
    `${MCC_PCC_PLC_PANEL_1}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${panel_id}"]]`
  );
  const { data: plcPanelData2 } = useNewGetData(
    `${MCC_PCC_PLC_PANEL_2}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${panel_id}"]]`
  );
  const { data: plcPanelData3 } = useNewGetData(
    `${MCC_PCC_PLC_PANEL_3}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${panel_id}"]]`
  );
  const params = useParams();
  const project_id = params.project_id;
  const router = useRouter();

  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);

  const plcPanelData = useMemo(
    () => ({
      ...(plcPanelData1?.[0] || {}),
      ...(plcPanelData2?.[0] || {}),
      ...(plcPanelData3?.[0] || {}),
    }),
    [plcPanelData1, plcPanelData2, plcPanelData3]
  );

  const [loading, setLoading] = useState(false);
  const dropdown = usePLCDropdowns();
  const userInfo: { division: string } = useCurrentUser();
  const projectDivision = projectData?.division;
  const userDivision = userInfo?.division;

  const plc_control_voltage_options = dropdown["PLC Control Voltage"];
  const plc_ups_1p_voltage_options = dropdown["PLC UPS 1 Phase Voltage"];
  const plc_ups_type_options = dropdown["PLC UPS Type"];
  const plc_ups_battery_type_options = dropdown["PLC UPS Battery Type"];
  const plc_ups_battery_backup_time_options =
    dropdown["PLC UPS Battery Backup Time"];
  const plc_ups_redundancy_options = dropdown["UPS Redundancy"];
  const plc_cpu_system_options = dropdown["PLC CPU System"];
  const marshalling_cabinet_options =
    dropdown["Marshalling Cabinet for PLC and UPS"];
  const electronic_hooter_acknowledge_options =
    dropdown["Electronic Hooter Acknowledge"];
  const panel_power_supply_on_options = dropdown["Panel Power Supply On"];
  const panel_power_supply_off_options = dropdown["Panel Power Supply Off"];
  const indicating_lamp_color_options =
    dropdown["Indicating Lamp Color for Non-UPS Power Supply"];
  const channel_density_options = dropdown["Channel Density"];
  const isolation_dropdown_options = dropdown["Isolation Dropdown"];
  const interposing_relay_options = dropdown["Interposing Relay"];
  const di_module_interrogation_voltage_options =
    dropdown["DI Modules Interrogation Voltage"];
  const do_module_output_type_options = dropdown["DO Modules Type Of Output"];
  const number_of_contacts_options = dropdown["Number of Contacts"];
  const ao_module_output_type_options = dropdown["AO Modules Type of Output"];
  const terminal_block_connector_options =
    dropdown["Terminal Block Connector Dropdown"];
  const plc_hmi_size_options = dropdown["PLC HMI Size"];
  const hmi_hardware_make_options = dropdown["HMI Hardware Make"];
  const eo_system_hardware_options = dropdown["EO System Hardware"];
  const eo_monitor_size_options = dropdown["EO Monitor Size"];

  const { control, handleSubmit, reset, watch, setValue, formState } = useForm({
    resolver: zodResolver(plcPanelValidationSchema),
    defaultValues: getDefaultValues(plcPanelData),
    mode: "onSubmit",
  });
  const tabsCount = useRef("0");
  useEffect(() => {
    if (typeof window !== "undefined") {
      tabsCount.current = localStorage.getItem("dynamic-tabs-count") ?? "0";
    }
  }, []);
  console.log("form errors PLC", plcPanelData);

  const upsScope = watch("ups_scope");
  const is_electronic_hooter_selected = watch("is_electronic_hooter_selected");
  const noOfContacts = [
    {
      name: "1NO + 1NC",
      value: "1NO + 1NC",
      label: "1NO + 1NC",
    },
    {
      name: "2NO + 2NC",
      value: "2NO + 2NC",
      label: "2NO + 2NC",
    },
  ];
  useEffect(() => {
    window.scroll(0, 0);
  }, []);
  useEffect(() => {
    reset(getDefaultValues(plcPanelData));
  }, [plcPanelData, reset]);
  useEffect(() => {
    if (is_electronic_hooter_selected) {
      setValue("electronic_hooter_acknowledge", "Black");
    } else {
      setValue("electronic_hooter_acknowledge", "NA");
    }
  }, [is_electronic_hooter_selected, setValue]);

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
    zod.infer<typeof plcPanelValidationSchema>
  > = async (data) => {
    setLoading(true);
    try {
      await updateData(
        `${MCC_PCC_PLC_PANEL_1}/${plcPanelData1[0].name}`,
        false,
        data
      );
      await updateData(
        `${MCC_PCC_PLC_PANEL_2}/${plcPanelData2[0].name}`,
        false,
        data
      );
      await updateData(
        `${MCC_PCC_PLC_PANEL_3}/${plcPanelData3[0].name}`,
        false,
        data
      );
      message.success("PLC Data updated successfully");
      const redirectToLayout = () => {
        router.push(`/project/${project_id}/design-basis/layout`);
      };

      setActiveKey((prevKey: string) => {
        if (prevKey == tabsCount.current) {
          redirectToLayout();
          // return "1";
        }

        return (parseInt(prevKey, 10) + 1).toString();
      });
      // setActiveKey((prevKey: string) => (parseInt(prevKey, 10) + 1).toString());
    } catch (error) {
      console.error(error);
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
          <span className="font-bold text-slate-700">Supply Requirements</span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="ups_control_voltage"
              label="Incoming UPS Supply"
              options={plc_control_voltage_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="non_ups_control_voltage"
              label="Incoming Non-UPS Supply"
              options={plc_control_voltage_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomRadioSelect
              control={control}
              name="is_bulk_power_supply_selected"
              label="Bulk Power Supply for I/O"
              options={[
                { label: "Yes", value: 1 },
                { label: "No", value: 0 },
              ]}
            />
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">UPS</span>
        </Divider>

        <div className="flex flex-col gap-4">
          {/* First Row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_scope"
                label="UPS Scope"
                options={dropdown["PLC UPS Scope"] || []}
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_input_voltage_3p"
                label="UPS Input Voltage 3-Phase"
                options={dropdown["PLC UPS 3 Phase Voltage"] || []}
                size="small"
                disabled={upsScope === "Client Scope"}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_input_voltage_1p"
                label="UPS Input Voltage 1-Phase"
                options={plc_ups_1p_voltage_options || []}
                size="small"
                disabled={upsScope === "Client Scope"}
              />
            </div>
          </div>

          {/* Second Row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_output_voltage_1p"
                label="UPS Output Voltage 1-Phase"
                options={plc_ups_1p_voltage_options || []}
                size="small"
                disabled={upsScope === "Client Scope"}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_type"
                label="UPS Type"
                options={plc_ups_type_options || []}
                disabled={upsScope === "Client Scope"}
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_battery_type"
                label="UPS Battery Type"
                options={moveNAtoEnd(plc_ups_battery_type_options) || []}
                disabled={upsScope === "Client Scope"}
                size="small"
              />
            </div>
          </div>

          {/* Third Row */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <CustomRadioSelect
                control={control}
                name="is_ups_battery_mounting_rack_selected"
                label="UPS Battery Mounting Rack"
                options={[
                  { label: "Yes", value: 1 },
                  { label: "No", value: 0 },
                ]}
                disabled={upsScope === "Client Scope"}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_battery_backup_time"
                label="UPS Battery Backup Time In Min"
                options={plc_ups_battery_backup_time_options || []}
                size="small"
                disabled={upsScope === "Client Scope"}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ups_redundancy"
                label="UPS Redundancy"
                options={moveNAtoEnd(plc_ups_redundancy_options) || []}
                size="small"
                disabled={upsScope === "Client Scope"}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* PLC Hardware Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">PLC Hardware</span>
            </Divider>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <CustomTextInput
                    control={control}
                    name="plc_cpu_system_series"
                    label="PLC CPU System Series"
                    size="small"
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="plc_cpu_system_input_voltage"
                    label="PLC CPU System Input Voltage"
                    size="small"
                    options={plc_control_voltage_options || []}
                  />
                </div>
                <div className="flex-1">
                  <CustomTextInput
                    control={control}
                    name="plc_cpu_system_memory_free_space_after_program"
                    label="PLC CPU Memory Free Space"
                    size="small"
                    suffix={
                      <>
                        <PercentageOutlined style={{ color: "#3b82f6" }} />
                      </>
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Redundancy Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">Redundancy</span>
            </Divider>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 pb-4">
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_power_supply_plc_cpu_system_selected"
                    label="Power Supply PLC CPU System"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_power_supply_input_output_module_selected"
                    label="Power Supply Input - Output Module"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_plc_input_output_modules_system_selected"
                    label="PLC Input - Output Modules System"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-4 pb-4">
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_plc_cpu_system_and_input_output_modules_system_selected"
                    label="PLC CPU System and PLC Input - Output Modules System"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_plc_cpu_system_and_hmi_scada_selected"
                    label="PLC CPU System and HMI / SCADA"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_plc_cpu_system_and_third_party_devices_selected"
                    label="PLC CPU System and Third Party Devices"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 flex gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_plc_cpu_system_selected"
                      label="PLC CPU System"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex-1" />
                <div className="flex-1" />
              </div>
            </div>
          </div>

          {/* PLC Panel Mounted Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">
                PLC Panel Mounted
              </span>
            </Divider>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomTextInput
                  control={control}
                  name="panel_mounted_ac"
                  label="Panel Mounted AC"
                  size="small"
                />
              </div>
              <div className="flex-1 items-end flex gap-4">
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_marshalling_cabinet_for_plc_and_ups_selected"
                    label="Marshalling Cabinet For PLC and UPS"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomTextInput
                    control={control}
                    name="marshalling_cabinet_for_plc_and_ups"
                    label=""
                    size="small"
                    // options={marshalling_cabinet_options || []}
                    disabled={
                      watch(
                        "is_marshalling_cabinet_for_plc_and_ups_selected"
                      ) === 0
                    }
                  />
                </div>
              </div>
              {/* <div className="flex-1" /> */}
            </div>
          </div>

          {/* Panel Mounted Push Buttons Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">
                Panel Mounted Push Buttons, Indication Lamps & Colors
              </span>
            </Divider>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_electronic_hooter_selected"
                    label="Electronic Hooter"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="electronic_hooter_acknowledge"
                    label="Electronic Hooter Acknowledge"
                    options={
                      moveNAtoEnd(electronic_hooter_acknowledge_options) || []
                    }
                    disabled={watch("is_electronic_hooter_selected") === 0}
                    size="small"
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="panel_power_supply_on_color"
                    label="Panel Power Supply On"
                    options={moveNAtoEnd(panel_power_supply_on_options) || []}
                    size="small"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="panel_power_supply_off_color"
                    label="Panel Power Supply Off"
                    options={moveNAtoEnd(panel_power_supply_off_options) || []}
                    size="small"
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="indicating_lamp_color_for_nonups_power_supply"
                    label="Indicating Lamp Colour for Non-UPS Power Supply"
                    options={moveNAtoEnd(indicating_lamp_color_options) || []}
                    size="small"
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="indicating_lamp_colour_for_ups_power_supply"
                    label="Indicating Lamp Colour for UPS Power Supply"
                    options={moveNAtoEnd(indicating_lamp_color_options) || []}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Divider>
          <span className="font-bold text-slate-700">IO Modules</span>
        </Divider>
        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">DI Modules</span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="di_module_channel_density"
                label="Channel Density"
                size="small"
                options={sortAlphaNumericArray(channel_density_options) || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="di_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="di_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="di_module_input_type"
                label="Type of Input"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="di_module_interrogation_voltage"
                label="Interrogation Voltage"
                size="small"
                options={di_module_interrogation_voltage_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="di_module_scan_time"
                label="Scan Time"
                size="small"
              />
            </div>
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">DO Modules</span>
        </Divider>
        <div className="flex flex-col gap-4">
          {" "}
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="do_module_channel_density"
                label="Channel Density"
                size="small"
                options={channel_density_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="do_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="do_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="do_module_output_type"
                label="Type of Output"
                size="small"
              />
            </div>
            <div className="flex-1" />
            <div className="flex-1" />
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">
            Interposing Relay
          </span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="interposing_relay"
                label="Interposing Relay"
                size="small"
                options={interposing_relay_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="interposing_relay_contacts_rating"
                label="Interposing Relay Contacts Rating"
                size="small"
              />
            </div>
            <div className="flex flex-1 items-end gap-4">
              <div>
                <CustomRadioSelect
                  control={control}
                  name="is_no_of_contacts_selected"
                  label="No. of Contacts"
                  options={[
                    { label: "Yes", value: 1 },
                    { label: "No", value: 0 },
                  ]}
                />
              </div>
              <div className="flex-1">
                <CustomSingleSelect
                  control={control}
                  name="no_of_contacts"
                  label=""
                  size="small"
                  options={noOfContacts}
                  disabled={watch("is_no_of_contacts_selected") === 0}
                />
              </div>
            </div>
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">AI Modules</span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ai_module_channel_density"
                label="Channel Density"
                size="small"
                options={channel_density_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="ai_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ai_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="ai_module_input_type"
                label="Type of Input"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="ai_module_scan_time"
                label="Scan Time"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomRadioSelect
                control={control}
                name="is_ai_module_hart_protocol_support_selected"
                label="HART Protocol Support"
                options={[
                  { label: "Yes", value: 1 },
                  { label: "No", value: 0 },
                ]}
              />
            </div>
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">AO Modules</span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex flex-1 gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ao_module_channel_density"
                label="Channel Density"
                size="small"
                options={channel_density_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="ao_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ao_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex flex-1 items-center gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="ao_module_output_type"
                label="Type of Output"
                size="small"
                // options={ao_module_output_type_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="ao_module_scan_time"
                label="Scan Time"
                size="small"
              />
            </div>
            <div className="flex flex-1 items-center gap-4">
              <div className="flex-1">
                <CustomRadioSelect
                  control={control}
                  name="is_ao_module_hart_protocol_support_selected"
                  label="HART Protocol Support"
                  options={[
                    { label: "Yes", value: 1 },
                    { label: "No", value: 0 },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">RTD Module</span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="rtd_module_channel_density"
                label="Channel Density"
                size="small"
                options={channel_density_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="rtd_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="rtd_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="rtd_module_input_type"
                label="Type of Input"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="rtd_module_scan_time"
                label="Scan Time"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomRadioSelect
                control={control}
                name="is_rtd_module_hart_protocol_support_selected"
                label="HART Protocol Support"
                options={[
                  { label: "Yes", value: 1 },
                  { label: "No", value: 0 },
                ]}
              />
            </div>
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">
            Thermocouple Modules
          </span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="thermocouple_module_channel_density"
                label="Channel Density"
                size="small"
                options={channel_density_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="thermocouple_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="thermocouple_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="thermocouple_module_input_type"
                label="Type of Input"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="thermocouple_module_scan_time"
                label="Scan Time"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomRadioSelect
                control={control}
                name="is_thermocouple_module_hart_protocol_support_selected"
                label="HART Protocol Support"
                options={[
                  { label: "Yes", value: 1 },
                  { label: "No", value: 0 },
                ]}
              />
            </div>
          </div>
        </div>

        <Divider orientation="left" orientationMargin={0}>
          <span className="text-sm font-bold text-blue-500">
            Universal Modules
          </span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="universal_module_channel_density"
                label="Channel Density"
                size="small"
                options={channel_density_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="universal_module_loop_current"
                label="Loop Current"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="universal_module_isolation"
                label="Isolation"
                size="small"
                options={moveNAtoEnd(isolation_dropdown_options) || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="universal_module_input_type"
                label="Type of Input"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="universal_module_scan_time"
                label="Scan Time"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomRadioSelect
                control={control}
                name="is_universal_module_hart_protocol_support_selected"
                label="HART Protocol Support"
                options={[
                  { label: "Yes", value: 1 },
                  { label: "No", value: 0 },
                ]}
              />
            </div>
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">
            Terminal Block Connectors
          </span>
        </Divider>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="di_module_terminal"
                label="DI Module Terminal"
                size="small"
                options={terminal_block_connector_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="do_module_terminal"
                label="DO Module Terminal"
                size="small"
                options={terminal_block_connector_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ai_module_terminal"
                label="AI Module Terminal"
                size="small"
                options={terminal_block_connector_options || []}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="ao_module_terminal"
                label="AO Module Terminal"
                size="small"
                options={terminal_block_connector_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="rtd_module_terminal"
                label="RTD Module Terminal"
                size="small"
                options={terminal_block_connector_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="thermocouple_module_terminal"
                label="Thermocouple Module Terminal"
                size="small"
                options={terminal_block_connector_options || []}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* HMI Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">HMI</span>
            </Divider>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1" />
                <div className="flex-1 justify-center">
                  <div className="flex justify-center">
                    <CustomRadioSelect
                      control={control}
                      name="is_hmi_selected"
                      label=""
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                </div>
                <div className="flex-1" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="hmi_size"
                    label="HMI Size"
                    size="small"
                    options={sortDropdownOptions(plc_hmi_size_options) || []}
                    suffixIcon={
                      <p className="font-semibold text-blue-500">inch</p>
                    }
                    disabled={watch("is_hmi_selected") === 0}
                  />
                </div>
                <div className="flex-1">
                  <CustomTextNumber
                    control={control}
                    name="hmi_quantity"
                    label="HMI (Quantity)"
                    size="small"
                    min={0}
                    disabled={watch("is_hmi_selected") === 0}
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="hmi_hardware_make"
                    label="HMI Hardware Make"
                    size="small"
                    options={moveNAtoEnd(hmi_hardware_make_options) || []}
                    disabled={watch("is_hmi_selected") === 0}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <CustomTextInput
                    control={control}
                    name="hmi_series"
                    label="HMI Series"
                    size="small"
                    disabled={watch("is_hmi_selected") === 0}
                  />
                </div>
                <div className="flex-1">
                  <CustomSingleSelect
                    control={control}
                    name="hmi_input_voltage"
                    label="HMI Input Voltage"
                    size="small"
                    options={plc_control_voltage_options || []}
                    disabled={watch("is_hmi_selected") === 0}
                  />
                </div>
                <div className="flex-1">
                  <CustomTextInput
                    control={control}
                    name="hmi_battery_backup"
                    label="HMI Battery Backup"
                    size="small"
                    disabled={watch("is_hmi_selected") === 0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Human Interface Device Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">
                Human Interface Device
              </span>
            </Divider>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_engineering_station_quantity_selected"
                      label="Engineering Station (Quantity)"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomTextNumber
                      control={control}
                      name="engineering_station_quantity"
                      label=""
                      min={0}
                      size="small"
                      disabled={
                        watch("is_engineering_station_quantity_selected") === 0
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_engineering_cum_operating_station_quantity_selected"
                      label="Engineering Cum Operating Station (Quantity)"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomTextNumber
                      control={control}
                      name="engineering_cum_operating_station_quantity"
                      label=""
                      min={0}
                      size="small"
                      disabled={
                        watch(
                          "is_engineering_cum_operating_station_quantity_selected"
                        ) === 0
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_operating_station_quantity_selected"
                      label="Operating Station (Quantity)"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomTextNumber
                      control={control}
                      name="operating_station_quantity"
                      label=""
                      min={0}
                      size="small"
                      disabled={
                        watch("is_operating_station_quantity_selected") === 0
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Software License Section */}
          <div>
            <Divider>
              <span className="font-bold text-slate-700">Software License</span>
            </Divider>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_scada_program_development_license_quantity_selected"
                      label="SCADA Development License (Quantity)"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomTextNumber
                      control={control}
                      name="scada_program_development_license_quantity"
                      label=""
                      min={0}
                      size="small"
                      disabled={
                        watch(
                          "is_scada_program_development_license_quantity_selected"
                        ) === 0
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_scada_runtime_license_quantity_selected"
                      label="SCADA Runtime License (Quantity)"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomTextNumber
                      control={control}
                      name="scada_runtime_license_quantity"
                      label=""
                      min={0}
                      size="small"
                      disabled={
                        watch("is_scada_runtime_license_quantity_selected") ===
                        0
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <CustomRadioSelect
                      control={control}
                      name="is_plc_progamming_software_license_quantity"
                      label="PLC Programming License Software"
                      options={[
                        { label: "Yes", value: 1 },
                        { label: "No", value: 0 },
                      ]}
                    />
                  </div>
                  <div className="flex-1">
                    <CustomTextNumber
                      control={control}
                      name="plc_programming_software_license_quantity"
                      label=""
                      size="small"
                      min={0}
                      disabled={
                        watch("is_plc_progamming_software_license_quantity") ===
                        0
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">
            Engineering / Operating SCADA Station
          </span>
        </Divider>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="system_hardware"
                label="System Hardware"
                size="small"
                options={eo_system_hardware_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextAreaInput
                control={control}
                name="pc_hardware_specifications"
                label="PC Hardware Specifications"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="monitor_size"
                label="Monitor Size"
                size="small"
                suffixIcon={<p className="font-semibold text-blue-500">inch</p>}
                options={eo_monitor_size_options || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="windows_operating_system"
                label="Window Operating System, Microsoft Office, Anti Virus (3 Year) License"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomTextInput
                control={control}
                name="hardware_between_plc_and_scada_pc"
                label="Communication Cable & hardware Between PLC CPU System & SCADA PC"
                size="small"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4"></div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CustomRadioSelect
                control={control}
                name="is_printer_with_suitable_communication_cable_selected"
                label="Printer With Suitable Communication Cable"
                options={[
                  { label: "Yes", value: 1 },
                  { label: "No", value: 0 },
                ]}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="printer_type"
                label="Printer Type"
                size="small"
                disabled={
                  watch(
                    "is_printer_with_suitable_communication_cable_selected"
                  ) === 0
                }
                options={dropdown["Printer Type"] || []}
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="printer_size"
                label="Printer Size"
                size="small"
                disabled={
                  watch(
                    "is_printer_with_suitable_communication_cable_selected"
                  ) === 0
                }
                options={dropdown["Printer Size"] || []}
              />
            </div>
            <div className="flex-1">
              <CustomTextNumber
                control={control}
                name="printer_quantity"
                label="Printer Quantity"
                min={0}
                disabled={
                  watch(
                    "is_printer_with_suitable_communication_cable_selected"
                  ) === 0
                }
                size="small"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_furniture_selected"
                    label="Furniture ( Wooden Table With Chair)"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_console_with_chair_selected"
                    label="Console With Chair"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_plc_logic_diagram_selected"
                    label="PLC Logic Diagram With Tag No. / Rung No & It's Descriptions."
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_loop_drawing_for_complete_project_selected"
                    label="Loop Drawing For Complete Project"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider>
          <span className="font-bold text-slate-700">Communication</span>
        </Divider>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="interface_signal_and_control_logic_implementation"
                label="All Interface Signals and Control Logic Shall be Implemented."
                size="small"
                options={
                  moveNAtoEnd(dropdown["Interface Signal and Control Logic"]) ||
                  []
                }
              />
            </div>
            <div className="flex-1">
              <CustomSingleSelect
                control={control}
                name="differential_pressure_flow_linearization"
                label="Signals From Differential Pressure Flow Transmitters Shall Be Linearized."
                size="small"
                options={
                  moveNAtoEnd(
                    dropdown["Differential Pressure Flow Linearization"]
                  ) || []
                }
              />
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="pb-6">
                <CustomSingleSelect
                  control={control}
                  name="third_party_comm_protocol_for_plc_cpu_system"
                  label="PLC CPU System  With Third Party Communication Protocol"
                  size="small"
                  options={
                    moveNAtoEnd(dropdown["PLC CPU Communication Protocol"]) ||
                    []
                  }
                />
              </div>
              <CustomTextInput
                control={control}
                name="hardware_between_plc_and_third_party"
                label="Communication Cable & Hardware Between PLC CPU System & Third Party"
                size="small"
              />
            </div>
            <div className="flex-1">
              <CustomTextAreaInput
                control={control}
                name="third_party_communication_protocol"
                label="Third Party Communication Protocol"
                rows={5}
              />
            </div>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="pb-6">
                <CustomRadioSelect
                  control={control}
                  name="is_client_system_comm_with_plc_cpu_selected"
                  label="PLC CPU System With Client System Communication "
                  options={[
                    { label: "Yes", value: 1 },
                    { label: "No", value: 0 },
                  ]}
                />
              </div>
              <CustomTextInput
                control={control}
                name="hardware_between_plc_and_client_system"
                label="Communication Cable & Hardware Between PLC CPU System & Client System"
                size="small"
                disabled={!watch("is_client_system_comm_with_plc_cpu_selected")}
              />
            </div>
            <div className="flex-1">
              <CustomTextAreaInput
                control={control}
                name="client_system_communication"
                label="Client System Communication"
                rows={5}
                disabled={!watch("is_client_system_comm_with_plc_cpu_selected")}
              />
            </div>
          </div>
          <div
            className="flex 
           items-end gap-4"
          >
            <div className="flex-1">
              <div className="flex-1 pb-2">
                <div className="flex item-center gap-5 pb-2">
                  <div className="flex flex-row items-center justify-start gap-4">
                    <div className="font-semibold mt-1 text-slate-700">
                      IIOT
                    </div>
                    <div className="">
                      <CustomRadioSelect
                        control={control}
                        name="is_iiot_selected"
                        label=""
                        options={[
                          { label: "Yes", value: 1 },
                          { label: "No", value: 0 },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <CustomTextAreaInput
                  control={control}
                  name="iiot_gateway_note"
                  label="IIOT Gateway Note"
                  rows={5}
                  disabled={!watch("is_iiot_selected")}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex-1 items-end">
                <CustomTextAreaInput
                  control={control}
                  name="iiot_gateway_mounting"
                  label="IIOT Gateway is Mounted in PLC Panel"
                  rows={5}
                  disabled={!watch("is_iiot_selected")}
                />
              </div>
            </div>
          </div>
        </div>

        {userInfo?.division === HEATING && (
          <>
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CustomRadioSelect
                    control={control}
                    name="is_burner_controller_lmv_mounting_selected"
                    label="Burner Controller LMV"
                    options={[
                      { label: "Yes", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                  />
                </div>
                <div className="flex-1">
                  <CustomTextInput
                    control={control}
                    name="hardware_between_plc_and_burner_controller_lmv"
                    label="Communication Cable & Hardware Between PLC CPU System & Burner Controller LMV"
                    size="small"
                    disabled={
                      !watch("is_burner_controller_lmv_mounting_selected")
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <CustomTextAreaInput
                    control={control}
                    name="burner_controller_lmv_mounting"
                    label="Burner Controller LMV is Mounted in PLC Panel"
                    disabled={
                      !watch("is_burner_controller_lmv_mounting_selected")
                    }
                  />
                </div>
                <div className="flex-1">
                  <CustomTextAreaInput
                    control={control}
                    name="burner_controller_lmv_note"
                    label="Burner Controller LMV Note"
                    disabled={
                      !watch("is_burner_controller_lmv_mounting_selected")
                    }
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <Divider>
          <span className="font-bold text-slate-700">PLC Spares</span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="spare_input_and_output_notes"
              label="Spare Input / Output Notes"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="commissioning_spare"
              label="Commissioning Spare"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="two_year_operational_spare"
              label="Two Year Operational Spare"
            />
          </div>
          <div className="flex-1">
            <CustomTextAreaInput
              control={control}
              name="project_specific_notes"
              label="Project Specific Notes"
            />
          </div>
        </div>
        <div className="mt-2 flex w-full justify-end">
          <Button
            type="primary"
            loading={loading}
            htmlType="submit"
            disabled={userDivision !== projectDivision}
          >
            Save and Next
          </Button>
        </div>
      </form>
    </>
  );
};

export default MCCcumPCCPLCPanel;
