"use client";

import { createData } from "@/actions/crud-actions";
import { useEffect, useState } from "react";

type DropdownState = {
  [key: string]: any[]; // Each key is a string and the value is an array of any type
};

export default function useCommonConfigDropdowns() {
  const [dropdown, setDropdown] = useState<DropdownState>({});

  useEffect(() => {
    const getDropdown = async () => {
      const response = await createData(
        "/method/pcc_panel.get_pcc_panel_dropdown",
        true,
        {
          "DOL Starter": "name",
          "Layout Type of Insulation": "name",
          "Power Terminal Type": "name",
          "Layout Specific Requirement": "name",
          "Star Delta Starter": "name",
          Ammeter: "name",
          "Ammeter Configuration": "name",
          "MCC Switchgear Type": "name",
          "Switchgear Combination": "name",
          "Metering for Feeder": "name", //Ammeter Type

          "Control Transformer Type": "name",
          "Control Transformer primary voltage": "name",
          "Control Transformer secondary voltage": "name",
          "Current Transformer Coating": "name",
          "Control Transformer Quantity": "name",
          "Control Transformer Configuration": "name",

          "Digital Meters": "name",
          "Analog Meters": "name",
          "Communication Protocol": "name",

          "Current Transformer": "name",
          "Current Transformer Configuration": "name",
          "Forward and Reverse Push Button": "name",

          "Supply Feeder Pole": "name",
          "Supply Feeder DM Standard": "name",
          "Supply Feeder Testing Standard": "name",
          "Power Wiring Color": "name",
          "Power Wiring Size": "name",
          "Control Wiring Color": "name",
          "Control Wiring Size": "name",
          "VDC 24 Wiring Color": "name",
          "VDC 24 Wiring Size": "name",
          "Analog Signal Wiring Color": "name",
          "Analog Signal Wiring Size": "name",
          "CT Wiring Color": "name",
          "CT Wiring Size": "name",
          "Cable Insulation PVC": "name",
          Ferrule: "name",
          "Power Terminal Clipon": "name",
          "Power Terminal Busbar Type": "name",
          "Control Terminal": "name",
          "Spare Terminal": "name",
          "Air Clearance Doctype": "name",

          "Test Dropdown": "name",
          "Reset Dropdown": "name",
          "Alarm Acknowledge Dropdown": "name",
          "Lamp Test Dropdown": "name",
          "Speed Decrease PB": "name",
          "Speed Increase PB": "name",
          "Push Button ESS": "name",
          "Push Button Stop Color": "name",
          "Push Button Start Color": "name",

          "Indicating Lamp Stopped Closed": "name",
          "Indicating Lamp Running Open": "name",
          "Indicating Lamp Trip": "name",

          "Hazardous Area Type Isolator and Lpbs": "name",
          "Field Motor Isolator General Type": "name",
          "Field Motor Isolator General Enclosure": "name",
          "Field Motor Isolator General Material": "name",
          "Field Motor Thickness": "name",
          "Field Motor Isolator General QTY": "name",
          "Field Motor Isolator Color Shade": "name",
          "Field Motor Isolator General Cable Entry": "name",
          "Field Motor Isolator Canopy On Top": "name",
          "Field Motor Isolator Canopy Type": "name",

          "Local Push Button Station Type": "name",
          "Local Push Button Station Enclosure": "name",
          "Local Push Button Station Material": "name",
          "Local Push Button Station Qty": "name",
          "Local Push Button Station LPBS Color Shade": "name",
          "Local Push Button Station Canopy On top": "name",
          "LPBS Start Push Button Color": "name",
          "LPBS Start On Indication Lamp Color": "name",
          "LPBS Stop Off Indication Lamp Color": "name",
          "LPBS Speed Increase Push Button": "name",
          "LPBS Speed Decrease Push Button": "name",

          "APFC Relay": "name",

          "Power Bus Main Busbar Selection": "name",
          "Power Bus Heat Shrinkable Color PVC sleeve": "name",
          "Power Bus Current Density": "name",
          "Control Bus Main Busbar Selection": "name",
          "Control Bus Heat Shrinkable Color PVC sleeve": "name",
          "Control Bus Current Density": "name",
          "Earth Bus Main Busbar Selection": "name",
          "Earth Bus Busbar Position": "name",
          "Earth Bus Current Density": "name",
        }
      );

      setDropdown(response);
    };

    getDropdown();
  }, []);

  return dropdown;
}
