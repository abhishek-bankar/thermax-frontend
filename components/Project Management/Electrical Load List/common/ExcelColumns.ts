import {
  ENVIRO,
  HEATING,
  WWS_IPG,
  WWS_SERVICES,
  WWS_SPG,
} from "@/configs/constants";
export const getStarterList = () => {
  return [
    "DOL STARTER",
    "STAR-DELTA",
    "VFD",
    "R-DOL",
    "VFD BYPASS-S/D",
    "SOFT STARTER",
    "SOFT STARTER BYPASS - S/D",
    "SUPPLY FEEDER",
    "VFD Bypass DOL",
    "SS Bypass DOL",
    "DOL-HTR",
    "DOL-ZSS",
    "SP-DOL MCB",
    "SP-DOL MPCB",
  ];
};
export const LoadListcolumns = (division: string) => {
  const columns = [
    {
      type: "text",
      name: "feederTag",
      title: "TAG NO",
      width: "100",
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
      title: "WORKING LOAD (kW)",
      width: "80",
    },
    {
      type: "text",
      name: "standBy",
      title: "STAND-BY LOAD (kW)",
      width: "80",
    },

    {
      type: "dropdown",
      name: "starter",
      source: getStarterList(),
      title: "STARTER TYPE",
      width: "130",
    },
    //value not provided
    {
      type: "dropdown",
      name: "supplyVoltage",
      source: [],
      title: "SUPPLY  VOLTAGE",
      width: "100",
    },
    {
      type: "dropdown",
      name: "phase",
      source: [
        "3 Phase",
        "1 Phase",
        ...(division === ENVIRO ? ["Control Transformer"] : []),
      ],
      title: "PHASE",
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
      type: division === HEATING ? "text" : "dropdown",
      name: "lbpsType",
      source: [],
      title: "LPBS  TYPE",
      width: "70",
      readOnly: division === HEATING ? true : false,
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
      width: "90",
      height: "60",
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
      source: ["Safe", "Hazardous", "NA"],
      title: "AREA",
      width: "100",
    },
    //applicable only if Hazardous selected
    {
      type: "dropdown",
      name: "standard",
      source: [
        "IEC",
        "IS",
        "NEC",
        "Other",
        "ATEX",
        "IEC Exd",
        "IEC Exe",
        "IEC Exia",
        "IEC Exp",
        "NEMA",
        "PESO",
        "FM",
        "CSA",
        "NA",
      ],
      title: "STANDARD",
      width: "100",
    },
    {
      type: "dropdown",
      name: "zone",
      source: [
        "Class 1, Division 1",
        "Class 1, Division 2",
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
      width: "100",
    },
    //options not availble
    {
      type: "dropdown",
      name: "gasGroup",
      source: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "IIA",
        "IIA/IIB",
        "IIB",
        "IIC",
        "NA",
      ],
      title: "GAS GROUP",
      width: "100",
    },
    {
      type: "dropdown",
      name: "tempClass",
      source: ["T1", "T2", "T3", "T4", "T5", "T6", "NA"],
      title: "TEMPERATURE  CLASS",
      width: "100",
    },

    { type: "text", name: "remark", title: "REMARK", width: "200" },
    { type: "text", name: "rev", title: "REV.", width: "70" },
    {
      type: "dropdown",
      source: ["No", "Yes", "All", "As per OEM Standard"],
      name: "spaceHeater",
      title: "SPACE HEATER",
      width: "150",
    },
    {
      type: "dropdown",
      source: ["No", "Yes"],
      name: "bearingRTD",
      title: "BEARING RTD",
      width: "100",
    },
    {
      type: "dropdown",
      source: ["No", "Yes"],
      name: "windingRTD",
      title: "WINDING RTD",
      width: "100",
    },
    {
      type: "dropdown",
      source: ["No", "Yes", "All", "As per OEM Standard"],
      name: "thermistor",
      title: "THERMISTOR",
      width: "150",
    },

    {
      type: "text",
      name: "powerFactor",
      title: "POWER FACTOR",
      width: "70",
    },
    {
      type: "dropdown",
      source: ["IE-2", "IE-3", "IE-4", "NA"],
      name: "motorEfficiency",
      title: "MOTOR EFFICIENCY",
      width: "100",
    },
    {
      type: "dropdown",
      source: ["Yes", "No"],
      name: "localIsolator",
      title: "LOCAL ISOLATOR",
      width: "100",
    },
    {
      type: "dropdown",
      name: "pannelAmmeter",
      source: [
        "All Phase With CT",
        "Y-Phase with CT",
        "Y-Phase-Direct",
        "All Phase-Direct",
        "NA",
      ],
      title: "PANEL AMMETER",
      width: "150",
    },

    {
      type: "dropdown",
      name: "motorScope",
      source: ["THERMAX", "CLIENT", "VENDOR", "NA"],
      title: "MOTOR SCOPE",
      width: "130",
    },
    {
      type: "dropdown",
      name: "motorLocation",
      source: ["INDOOR", "OUTDOOR", "NA"],
      title: "MOTOR LOCATION",
      width: "130",
    },

    {
      type: "text",
      name: "partcode",
      title: "MOTOR RATED CURRENT (Amp) ",
      width: "150",
    },
  ];
  if (division === ENVIRO) {
    columns.splice(4, 0, {
      type: "text",
      name: "kva",
      title: "KVA",
      width: "70",
    });
  }
  if (division === HEATING) {
    columns.splice(7, 0, {
      type: "dropdown",
      name: "startingTime",
      source: ["10 Sec", "30 Sec", "60 Sec", "NA"],
      title: "STARTING TIME",
      width: "80",
    });
  }
  if (division === ENVIRO) {
    columns.splice(
      12,
      0,
      {
        type: "dropdown",
        name: "busSegregation",
        source: ["A", "B", "C", "NA"],
        title: "BUS  SEGREGATION",
        width: "90",
      },
      {
        type: "dropdown",
        name: "motorRpm",
        source: ["0", "750", "1000", "1500", "3000"],
        title: "MOTOR  RPM",
        width: "70",
      },
      {
        type: "dropdown",
        name: "typeMotorMounting",
        source: [
          "FOOT MOUNTED (B3)",
          "FLANGE MOUNTED (B5)",
          "FOOT & FLANGE MOUNTED (B35)",
          "VERTICAL FLANGE MOUNTED (V1)",
          "NA",
        ],
        title: "TYPE OF  MOTOR MOUNTING",
        width: "150",
      },
      {
        type: "dropdown",
        source: [
          "63",
          "71",
          "80",
          "90S",
          "90L",
          "100L",
          "112M",
          "132S",
          "160M",
          "160L",
          "180M",
          "180L",
          "225M",
          "200L",
          "225S",
          "250M",
          "280S",
          "280M",
          "315S",
          "315M",
          "315L",
          "NA",
        ],
        name: "motorFrameSize",

        title: "MOTOR  FRAME SIZE",
        width: "100",
      },
      {
        type: "text",
        name: "motorGD2",
        title: "MOTOR GD 2",
        width: "100",
      },
      {
        type: "text",
        name: "drivenEqGD2",

        title: "DRIVEN  EQUIPMENT GD2",
        width: "100",
      },
      {
        type: "text",
        name: "bkw",
        title: "BkW",
        width: "100",
      },
      {
        type: "dropdown",
        name: "typeOfCoupling",
        source: ["V-Belt", "Direct", "NA"],
        title: "TYPE OF  COUPLING",

        width: "100",
      }
    );
    columns.splice(32, 0, {
      type: "dropdown",
      name: "typeOfBearing",
      source: ["Roller", "Insulated", "Roller and Insulated", "NA"],
      title: "TYPE OF BEARING",
      width: "120",
    });
    columns.splice(37, 0, {
      type: "dropdown",
      source: [
        "ABB",
        "Bharat Bijlee",
        "Crompton Greaves",
        "Havells",
        "Kirloskar",
        "LHP",
        "Siemens",
        "Thermax Standard",
        "NA",
      ],
      name: "motorMake",
      title: "MOTOR MAKE",
      width: "150",
    });
    columns.splice(40, 0, {
      type: "text",
      name: "partcode",
      title: "MOTOR PART CODE",
      width: "200",
    });
  }
  if (
    division === WWS_IPG ||
    division === WWS_SPG ||
    division === WWS_SERVICES
  ) {
    columns.splice(
      11,
      0,
      {
        type: "dropdown",
        name: "busSegregation",
        source: ["A", "B", "C", "NA"],
        title: "BUS  SEGREGATION",
        width: "90",
      },
      {
        type: "dropdown",
        name: "motorRpm",
        source: ["0", "750", "1000", "1500", "3000"],
        title: "MOTOR  RPM",
        width: "70",
      },
      {
        type: "dropdown",
        name: "typeMotorMounting",
        source: [
          "FOOT MOUNTED (B3)",
          "FLANGE MOUNTED (B5)",
          "FOOT & FLANGE MOUNTED (B35)",
          "VERTICAL FLANGE MOUNTED (V1)",
          "NA",
        ],
        title: "TYPE OF  MOTOR MOUNTING",
        width: "150",
      },
      {
        type: "dropdown",
        source: [
          "63",
          "71",
          "80",
          "90S",
          "90L",
          "100L",
          "112M",
          "132S",
          "160M",
          "160L",
          "180M",
          "180L",
          "225M",
          "200L",
          "225S",
          "250M",
          "280S",
          "280M",
          "315S",
          "315M",
          "315L",
          "NA",
        ],
        name: "motorFrameSize",

        title: "MOTOR  FRAME SIZE",
        width: "100",
      },
      {
        type: "text",
        name: "motorGD2",
        title: "MOTOR GD 2",
        width: "100",
      },
      {
        type: "text",
        name: "drivenEqGD2",

        title: "DRIVEN  EQUIPMENT GD2",
        width: "100",
      },
      {
        type: "text",
        name: "bkw",
        title: "BkW",
        width: "100",
      },
      {
        type: "dropdown",
        name: "typeOfCoupling",
        source: ["V-Belt", "Direct", "NA"],
        title: "TYPE OF  COUPLING",

        width: "100",
      }
    );
    columns.splice(31, 0, {
      type: "dropdown",
      name: "typeOfBearing",
      source: ["Roller", "Insulated", "Roller and Insulated", "NA"],
      title: "TYPE OF BEARING",
      width: "120",
    });
    columns.splice(36, 0, {
      type: "dropdown",
      source: [
        "ABB",
        "Bharat Bijlee",
        "Crompton Greaves",
        "Havells",
        "Kirloskar",
        "LHP",
        "Siemens",
        "Thermax Standard",
        "NA",
      ],
      name: "motorMake",
      title: "MOTOR MAKE",
      width: "150",
    });
    columns.splice(39, 0, {
      type: "text",
      name: "partcode",
      title: "MOTOR PART CODE",
      width: "200",
    });
  }

  return columns;
};
export const CableSchedulecolumns = () => {
  return [
    {
      type: "text",
      name: "feederTag",
      title: "TAG NO",
      width: "110",
      readOnly: true,
    },
    {
      type: "text",
      name: "serviceDescription",
      title: "SERVICE DESCRIPTION",
      width: "225",
      readOnly: true,
    },

    {
      type: "text",
      name: "working",
      title: "WORKING LOAD IN KW",
      width: "80",
      readOnly: true,
    },
    {
      type: "text",
      name: "standBy",
      title: "STAND-BY LOAD IN KW",
      width: "80",
      readOnly: true,
    },
    {
      type: "text",
      name: "kva",
      title: "KVA",
      width: "50",
      readOnly: true,
    },
    {
      type: "dropdown",
      name: "starter",
      source: [
        "DOL STARTER",
        "STAR-DELTA",
        "VFD",
        "R-DOL",
        "VFD BYPASS-S/D",
        "SOFT STARTER",
        "SOFT STARTER BYPASS - S/D",
        "SUPPLY FEEDER",
        "VFD Bypass DOL",
        "SS Bypass DOL",
        "DOL-HTR",
        "DOL-ZSS",
        "SP-DOL MCB",
        "SP-DOL MPCB",
      ],
      title: "STARTER TYPE",
      width: "130",
      readOnly: true,
    },
    //value not provided
    {
      type: "text",
      name: "supplyVoltage",
      // source: [],
      title: "SUPPLY VOLTAGE",
      width: "80",
      readOnly: true,
    },
    // { type: "text", name: "panel", title: "PANEL", width: "150" },
    {
      type: "text",
      name: "phase",
      // source: ["", "3 Phase", "1 Phase"],
      title: "MOTOR RATED CURRENT IN AMP",
      width: "120",
    },
    {
      type: "text",
      name: "apxLength",
      title: "CABLE LENGTH (m)",
      width: "100",
    },
    {
      type: "text",
      name: "noOfRuns",
      title: "NO. OF RUNS",
      width: "80",
    },
    {
      type: "dropdown",
      source: ["2C", "3C", "3.5C", "4C"],
      name: "noOfCores",
      title: "NO. OF CORES",
      width: "80",
    },
    {
      type: "dropdown",
      name: "cableAsPerFl",
      source: [
        "2.5",
        "2.0",
        "4.0",
        "6.0",
        "10.0",
        "16.0",
        "25.0",
        "35.0",
        "50.0",
        "70.0",
        "95.0",
        "120.0",
        "150.0",
        "185.0",
        "240.0",
        "25/16",
        "35/16",
        "50/25",
        "70/35",
        "95/50",
        "120/70",
        "150/70",
        "185/95",
      ], //this has to be come from backend
      title: "FINAL CALCULATED CABLE SIZE",
      width: "130",
    },
    {
      type: "dropdown",
      name: "cableMaterial",
      source: ["Copper", "Aluminium"],
      title: "CABLE MATERIAL",
      width: "100",
    },

    {
      type: "text",
      name: "cableAsPerFl",
      title: "CABLE SIZE AS PER HEATING CHART ",
      width: "130",
    },
    {
      type: "text",
      name: "cosRunning",
      title: "COSφ (Running)",
      width: "70",
    },
    {
      type: "text",
      name: "cosStarting",
      title: "COSφ (starting)",
      width: "70",
    },
    {
      type: "text",
      name: "resistanceMtr",
      title: "RESISTANCE / Mtr",
      width: "130",
    },
    {
      type: "text",
      name: "reactanceMtr",
      title: "REACTANCE / Mtr",
      width: "130",
    },

    {
      type: "text",
      name: "vdRunning",
      title: "VOLTAGE DROP (RUNNING)",
      width: "100",
    },
    {
      type: "text",
      name: "vdStarting",
      title: "VOLTAGE DROP (STARTING)",
      width: "100",
    },
    {
      type: "text",
      name: "percentVdAtRunning",
      title: "% VOLTAGE DROP AT RUNNING ",
      width: "110",
    },
    {
      type: "text",
      name: "percentVdAtStart",
      title: "% VOLTAGE DROP AT STARTING ",
      width: "110",
    },
    {
      type: "text",
      name: "selectedCableCarryCapacity",
      title: "SELECTED CABLE CURRENT CARRYING CAPACITY (Amp)",
      width: "180",
    },
    {
      type: "text",
      name: "deratingFactor",
      title: "DERATING FACTOR",
      width: "70",
    },
    {
      type: "text",
      name: "finalCurrentCarryCapacity",
      title: "FINAL CURRENT CARRYING CAPACITY (Amp)",
      width: "180",
    },

    {
      type: "dropdown",
      name: "cableAsPerFl",
      source: ["Unsafe", "Safe"],
      title: "CABLE SELECTED STATUS",
      width: "120",
    },
  ];
};

export const multicoreCableConfigColumns = [
  {
    type: "checkbox",
    title: "SELECT",
    width: "80",
  },
  {
    type: "text",
    name: "tag",
    title: "TAG NO.",
    width: "110",
  },
  {
    type: "text",
    name: "description",
    title: "SERVICE DESCRIPTION",
    width: "250",
  },
  {
    type: "text",
    name: "schemeTitle",
    title: "SCHEME TITLE",
    width: "100",
  },
  {
    type: "text",
    name: "subScheme",
    title: "SUB SCHEME",
    width: "90",
  },
  {
    type: "text",
    name: "breaker",
    title: "DI CABLE",
    width: "70",
  },
  {
    type: "text",
    name: "breaker",
    title: "DO CABLE",
    width: "70",
  },
  {
    type: "text",
    name: "breaker",
    title: "AI CABLE",
    width: "70",
  },
  {
    type: "text",
    name: "breaker",
    title: "AO CABLE",
    width: "70",
  },
  {
    type: "text",
    name: "rev",
    title: "ADDITIONAL CONTROL CABLE",
    width: "100",
  },
  {
    type: "text",
    name: "panelName",
    title: "PANEL NAME",
    width: "90",
  },
];
export const multicoreCableConfigGroupedColumns = [
  {
    type: "text",
    name: "tag",
    title: "GROUP NO.",
    width: "80",
  },
  {
    type: "text",
    name: "tag",
    title: "TYPE OF CABLE",
    width: "100",
  },
  {
    type: "text",
    name: "tag",
    title: "TOTAL NO. OF CORES",
    width: "100",
  },
  {
    type: "text",
    name: "tag",
    title: "TOTAL NO. OF CORES WITH SPARE",
    width: "100",
  },
  {
    type: "dropdown",
    name: "tag",
    title: "MULTICORE/PAIR CABLE SELECTED",
    autocomplete: true,
    source: [
      "2C",
      "3C",
      "4C",
      "6C",
      "8C",
      "12C",
      "16C",
      "24C",
      "30C",
      "37C",
      "1P",
      "2P",
      "6P",
      "12P",
    ],
    multiple: false,
    width: "100",
  },
  {
    type: "text",
    name: "tag",
    title: "NO. OF CABLE",
    width: "50",
  },
  {
    type: "text",
    name: "tag",
    title: "SERVICE DESCRIPTION",
    width: "350",
  },
  {
    type: "text",
    name: "panelName",
    title: "PANEL NAME",
    width: "100",
  },
];
export const motorCanopyColumns = [
  {
    type: "text",
    name: "tagNo",
    title: "TAG NO.",
    width: "115",
    readOnly: true,
  },
  {
    readOnly: true,
    type: "text",
    name: "description",
    title: "DESCRIPTION",
    width: "225",
  },

  {
    type: "text",
    name: "qty-nos",
    title: "QUANTITY (NOS.)",
    width: "80",
  },
  {
    type: "text",
    name: "motorRating",
    title: "MOTOR RATING (KW)",
    width: "110",
  },

  {
    type: "text",
    name: "rpm",
    title: "RPM",
    width: "70",
  },
  {
    type: "text",
    name: "typeOfMounting",
    title: "TYPE OF MOUNTING",
    width: "270",
  },
  {
    type: "text",
    name: "motorFrameSize",
    title: "MOTOR FRAME SIZE",
    width: "110",
  },
  {
    type: "text",
    name: "location",
    title: "LOCATION",
    width: "90",
  },
  {
    type: "dropdown",
    source: ["FRP", "GI", "SS"],
    name: "moc",
    title: "MOC",
    width: "90",
  },
  {
    type: "text",
    name: "canopyModelNo",
    title: " CANOPY MODEL NO.",
    width: "140",
  },
  {
    type: "text",
    name: "canopyLegLength",
    title: " CANOPY LEG LENGTH",
    width: "100",
  },
  {
    type: "text",
    name: "canopyCutOut",
    title: " CANOPY CUT OUT",
    width:"150"
  },
  {
    type: "text",
    name: "partcode",
    title: "PART CODE",
    width: "150",
  },
  {
    type: "text",
    name: "motorScopr",
    title: "MOTOR SCOPE",
    width: "130",
  },
  {
    type: "text",
    name: "remark",
    title: "REMARK",
    width: "150",
  },
];

export const switchGearSelectionColumns = (division: string) => {
  const columns = [
    {
      type: "text",
      name: "motorTag",
      title: "TAG NO.",
      width: "150",
      readOnly: true,
    },
    {
      type: "text",
      name: "feederName",
      title: "SERVICE DESCRIPTION",
      width: "225",
      readOnly: true,
      filters: true,
    },
    { type: "text", name: "hp", title: "HP", width: "70", readOnly: true },
    {
      type: "text",
      name: "kw",
      title: "WORKING KW",
      width: "90",
      readOnly: true,
    },
    {
      type: "text",
      name: "kwstandby",
      title: "STAND-BY KW",
      width: "90",
      readOnly: true,
    },
    {
      type: "text",
      name: "current",
      title: "CURRENT",
      width: "70",
      readOnly: true,
    },
    {
      type: "text",
      name: "starter",
      title: "STARTER",
      width: "130",
      readOnly: true,
    },
    { type: "text", name: "make", title: "MAKE", width: "140", readOnly: true },
    {
      type: "dropdown",
      source: ["Type II Coordination-Fuse", "Type II Coordination-Fuseless"],
      name: "switchGearType",
      title: "SWITCH GEAR TYPE",
      width: "300",
    },
    { type: "text", name: "vfd", title: "VFD", width: "130" },
    {
      type: "text",
      name: "breakerOrFuse",
      source: ["3VA1140-5MH32-0AA0", "1", "2"],
      title: "BREAKER/FUSE",
      width: "200",
    },
    { type: "text", name: "fuseHolder", title: "FUSE HOLDER", width: "100" },
    {
      type: "text",
      name: "contactorMain",
      title: "CONTACTOR MAIN",
      width: "110",
    },
    {
      type: "text",
      name: "contactorStar",
      title: "CONTRACTOR STAR",
      width: "100",
    },
    {
      type: "text",
      name: "contactorDelta",
      title: "CONTACTOR DELTA",
      width: "120",
    },
    {
      type: "text",
      name: "overloadRealy",
      title: "OVERLAY RELAY",
      width: "110",
    },
    {
      type: "text",
      name: "termainlPartNum",
      title: "TERMINAL PART NO.",
      width: "130",
    },
    {
      type: "text",
      name: "cableSize",
      readOnly: true,
      title: "CABLE SIZE",
      width: "170",
    },
    {
      type: "dropdown",
      name: "incomer",
      source: [],
      title: "INCOMER",
      width: "115",
    },
  ];
  if (division === HEATING) {
    columns.splice(8, 0, {
      type: "text",
      name: "startingTime",
      title: "STARTING TIME",
      width: "70",
      readOnly: true,
    });
  }
  if (division === ENVIRO) {
    columns.splice(5, 0, {
      type: "text",
      name: "kva",
      title: "KVA",
      width: "70",
      readOnly: true,
    });
  }
  return columns;
};
