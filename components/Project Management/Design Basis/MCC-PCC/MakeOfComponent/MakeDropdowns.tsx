"use client";

import { createData } from "@/actions/crud-actions";

import { useEffect, useState } from "react";

type DropdownState = {
  [key: string]: any[]; // Each key is a string and the value is an array of any type
};

export default function useMakeOfComponentDropdowns() {
  const [dropdown, setDropdown] = useState<DropdownState>({});

  useEffect(() => {
    const getDropdown = async () => {
      const response = await createData(
        "method/design_basis_make_of_component.get_make_of_component_dropdowns",
        true,
        {
          "Gland Make": "name",
          "Motors Make": "name",
          "Cables Make": "name",
          "LV Switchgear Make": "name",
          "Panel Enclosure Make": "name",
          "VFD VSD Make": "name",
          "Soft Starter Make": "name",
          "PLC Make": "name",
        }
      );
      setDropdown(response);
    };
    getDropdown();
  }, []);

  return dropdown;
}
