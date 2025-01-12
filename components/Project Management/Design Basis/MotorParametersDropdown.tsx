"use client";

import { createData } from "@/actions/crud-actions";

import { useEffect, useState } from "react";

type DropdownState = {
  [key: string]: any[]; // Each key is a string and the value is an array of any type
};

export default function useMotorParametersDropdowns() {
  const [dropdown, setDropdown] = useState<DropdownState>({});

  useEffect(() => {
    const getDropdown = async () => {
      const response = await createData(
        "method/design_basis_make_of_component.get_make_of_component_dropdowns",
        true,
        {
          "Efficiency Level Safe Area": "name",
          "Efficiency Level Hazardous Area": "name",
          "Insulation Class Safe Area": "name",
          "Insulation Class Hazardous Area": "name",
          "Safe Temperature Rise": "name",
          "Hazardous Temperature Rise": "name",
          "Enclosure IP Rating Safe": "name",
          "Enclosure IP Rating Hazardous": "name",
          "IP rating for Terminal Box Safe": "name",
          "IP rating for Terminal Box Hazardous": "name",
          "Thermister Safe": "name",
          "Thermister Hazardous": "name",
          "Space Heater Hazardous": "name",
          "Space Heater Safe": "name",
          "Hazardous Area Certification": "name",
          "Bearing RTD Safe": "name",
          "Bearing RTD Hazardous": "name",
          "Winding RTD Safe": "name",
          "Winding RTD Hazardous": "name",
          "Body Material Safe": "name",
          "Body Material Hazardous": "name",
          "Material of Terminal Box Safe": "name",
          "Material of Terminal Box Hazardous": "name",
        }
      );
      setDropdown(response);
    };

    getDropdown();
  }, []);

  return dropdown;
}
