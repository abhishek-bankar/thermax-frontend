import React, { useRef, useEffect } from "react"
import jspreadsheet, { JspreadsheetInstance } from "jspreadsheet-ce"
import "jspreadsheet-ce/dist/jspreadsheet.css"

const ExcelGrid: React.FC = () => {
  const jRef = useRef<HTMLDivElement | null>(null)
  const spreadsheetInstance = useRef<JspreadsheetInstance | null>(null) 
  const columns = [
    {
      type: "text",
      name: "feederTag",
      title: "FEEDER  TAG NO",
      width: "110",
      height: "100",
    },
    {
      type: "text",
      name: "serviceDescription",
      title: "SERVICE DESCRIPTION",
      width: "225",
    },
    {
      type: "text",
      name: "working",
      title: "WORKING  LOAD IN KW",
      width: "90",
    },
    {
      type: "text",
      name: "standBy",
      title: "STAND-BY  LOAD IN KW",
      width: "90",
    },
    {
      type: "text",
      name: "standBy",
      title: "KVA",
      width: "90",
      readOnly: true,
    },
    {
      type: "dropdown",
      name: "starter",
      source: [],
      title: "STARTER TYPE",
      width: "130",
    },
    //value not provided
    {
      type: "dropdown",
      name: "supplyVoltage",
      source: ["230 VAC", "110 VAC"],
      title: "SUPPLY  VOLTAGE",
      width: "80",
    },
    {
      type: "dropdown",
      name: "phase",
      source: [],
      title: "PHASE",
      width: "90",
    },
    {
      type: "dropdown",
      name: "startingTime",
      source: ["10 sec", "30 sec", "60 sec"],
      title: "STARTING  TIME",
      readOnly: false,

      width: "90",
    },
    {
      type: "dropdown",
      name: "eorc",
      source: ["Yes", "No"],
      title: "EOCR  APPLICABLE",
      width: "90",
    },
    {
      type: "dropdown",
      name: "lbpsType",
      source: [],
      title: "LPBS  TYPE",
      width: "70",
    },
    {
      type: "dropdown",
      name: "controlScheme",
      source: [],
      title: "CONTROL  SCHEME",
      width: "130",
    },
    {
      type: "dropdown",
      name: "panelList",
      source: [],
      title: "PANEL",
      width: "80",
      height: "60",
    },
    {
      type: "dropdown",
      name: "busSegregation",
      source: ["A", "B", "C", "NA"],
      title: "BUS  SEGREGATION",
      readOnly: false,
      width: "100",
    },
    {
      type: "dropdown",
      name: "motorRpm",
      source: ["1500", "3000", "1000", "750", "0"],
      title: "MOTOR  RPM",
      readOnly: false,
      width: "70",
    },
    {
      type: "dropdown",
      name: "typeMotorMounting",
      source: [
        "foot mounted (B3)",
        "flange mounted (B5)",
        "foot & flange mounted (B35)",
        "vertical flange mounted (V1)",
        "NA",
      ],
      title: "TYPE OF  MOTOR MOUNTING",
      width: "150",
    },
    {
      type: "dropdown",
      source: [],
      name: "motorFrameSize",
      title: "MOTOR  FRAME SIZE",
      width: "150",
    },
    { type: "text", name: "motorGD2", title: "MOTOR GD 2", width: "150" },
    {
      type: "text",
      name: "drivenEqGD2",
      title: "DRIVEN  EQUIPMENT GD2",
      width: "150",
    },
    { type: "text", name: "bkw", title: "BKW", width: "150" },
    {
      type: "dropdown",
      name: "typeOfCoupling",
      source: ["V-belt", "Direct", "NA"],
      title: "TYPE OF  COUPLING",
      width: "150",
    },
    {
      type: "dropdown",
      name: "pkg",
      source: [],
      title: "PACKAGE",
      width: "150",
    },

    {
      type: "dropdown",
      name: "area",
      source: ["", "Safe", "Hazardous"],
      title: "AREA",
      width: "150",
    },
    //applicable only if Hazardous selected
    {
      type: "dropdown",
      name: "standard",
      source: ["IEC", "IS", "NEC", "ATEX", "Other", "NA"],
      title: "STANDARD",
      width: "150",
    },
    {
      type: "dropdown",
      name: "zone",
      source: [
        "class 1, Division 1",
        "class 1, Division 2",
        "Zone 0",
        "Zone 1",
        "Zone 1 or Zone 2",
        "Zone 2",
        "Zone 20",
        "Zone 21",
        "Zone 22",
        "NA",
      ],
      title: "ZONE",
      width: "150",
    },
    //options not availble
    {
      type: "dropdown",
      name: "gasGroup",
      source: ["A", "B", "C", "D", "E", "F", "G", "IIA", "IIA/IIB", "IIB", "IIC", "NA"],
      title: "GAS GROUP",
      width: "150",
    },
    {
      type: "dropdown",
      name: "tempClass",
      source: ["T1", "T2", "T3", "T4", "T5", "T6", "NA"],
      title: "TEMPERATURE  CLASS",
      width: "150",
    },

    { type: "text", name: "remark", title: "REMARK", width: "200" },
    { type: "text", name: "rev", title: "REV.", width: "200" },
    {
      type: "dropdown",
      source: ["No", "Yes"],
      name: "spaceHeater",
      title: "SPACE HEATER",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["No", "Yes"],
      name: "bearingRTD",
      title: "BEARING RTD",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["No", "Yes"],
      name: "windingRTD",
      title: "WINDING RTD",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["No", "Yes"],
      name: "thermistor",
      title: "THERMISTOR",
      width: "150",
    },

    {
      type: "dropdown",
      name: "typeOfBearing",
      source: ["roller", "insulated", "Roller and Insulated", "NA"],
      title: "TYPE OF  BEARING",
      width: "150",
    },
    {
      type: "text",
      name: "powerFactor",
      title: "POWER FACTOR",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["IE-2", "IE-3", "IE-4", "IE-5", "NA"],
      name: "motorEfficiency",
      title: "MOTOR EFFICIENCY",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["Yes", "No"],
      name: "localIsolator",
      title: "LOCAL ISOLATOR",
      width: "150",
    },
    {
      type: "dropdown",
      name: "pannelAmmeter",
      source: ["All Phase With CT", "Y-Phase With CT", "Y-Phase-Direct", "All Phase-Direct", "NA"],
      title: "PANEL AMMETER",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["TL Std", "Bharat Bijlee", "Crompton Greaves", "Siemens"],
      name: "motorMake",
      title: "MOTOR MAKE",
      width: "150",
    },

    {
      type: "dropdown",
      name: "motorScope",
      source: ["THERMAX", "CLIENT", "VENDOR", "NA"],
      title: "MOTOR SCOPE",
      width: "200",
    },
    {
      type: "dropdown",
      name: "motorLocation",
      source: ["INDOOR", "OUTDOOR", "NA"],
      title: "MOTOR LOCATION",
      width: "200",
    },
    {
      type: "text",
      name: "partcode",
      title: "MOTOR PART CODE",
      width: "200",
    },
    {
      type: "text",
      name: "partcode",
      title: "Motor Rated Current (AMP) ",
      width: "200",
    },
  ]

  const options = {
    data: [[]],
    minDimensions: [6, 5] as [number, number],
    columns: columns,
    // Additional configuration options
    columnSorting: true,
    columnDrag: true,
    columnResize: true,
    tableOverflow: true,
    filters: true,
    tableWidth: "100%",
    freezeColumns: 4,
    rowResize: true,
    defaultColWidth: 100,
    // tableOverflow: true,
    // tableWidth: "100%",
    // tableHeight: "100%",
    // Validation
    // columnDragAndDrop: true,
    onchange: (instance: JspreadsheetInstance, cell: HTMLElement, x: number, y: number, value: any) => {
      // Example validation for email column
      if (x === 5) {
        // Email column index
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          cell.style.backgroundColor = "#ffcccb"
        } else {
          cell.style.backgroundColor = ""
        }
      }
    },
  }
  // const options = {
  //   data: [[]],
  //   minDimensions: [10, 10] as [number, number],

  // };

  useEffect(() => {
    if (jRef.current && !spreadsheetInstance.current) {
      spreadsheetInstance.current = jspreadsheet(jRef.current, options)
    }
  }, [options])

  return (
    <div style={{ width: "90%" }}>
      <div ref={jRef} />
      {/* <input type="button" onClick={addRow} value="Add new row" /> */}
    </div>
  )
}

export default ExcelGrid
