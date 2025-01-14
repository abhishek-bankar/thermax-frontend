// import { JspreadsheetInstance } from "jspreadsheet-ce";
// import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
// import jspreadsheet from "jspreadsheet-ce";
// import { Button } from "antd";
// import AlertNotification from "@/components/AlertNotification";
// import Modal from "@/components/Modal/Modal";
// import {
//   columnsForWwsSPG,
//   controlSchemeColumnsForHeating,
//   getEnviroColumns,
//   getEnviroSchemesData,
//   getIPGColumns,
//   getIPGSchemesData,
//   WWS_SPG_DATA,
// } from "@/app/Data";
// import { ValidColumnType } from "../../types";
// import { useLoading } from "@/hooks/useLoading";
// import { getData } from "@/actions/crud-actions";
// import {
//   HEATING_CONTROL_SCHEMES_URI,
//   SPG_SERVICES_CONTROL_SCHEMES_URI,
// } from "@/configs/api-endpoints";
// import {
//   ENVIRO,
//   HEATING,
//   SERVICES,
//   WWS_IPG,
//   WWS_SPG,
// } from "@/configs/constants";
// import { useCurrentUser } from "@/hooks/useCurrentUser";

// interface ControlSchemeConfiguratorProps {
//   isOpen: boolean;
//   onClose: () => void;
//   // controlSchemes: any[]
//   selectedControlSchemes: any[];
//   onConfigurationComplete: (selectedSchemes: string[]) => void;
// }

// const ControlSchemeConfigurator: React.FC<ControlSchemeConfiguratorProps> = ({
//   isOpen,
//   onClose,
//   // controlSchemes,
//   selectedControlSchemes,
//   onConfigurationComplete,
// }) => {
//   const controlSchemeSheetRef = useRef<HTMLDivElement | null>(null);
//   const controlSchemeSelectedSheetRef = useRef<HTMLDivElement | null>(null);
//   const [controlSchemeInstance, setControlSchemeInstance] =
//     useState<JspreadsheetInstance | null>(null);
//   const [selectedSchemeInstance, setSelectedSchemeInstance] =
//     useState<JspreadsheetInstance | null>(null);
//   const [selectedFilter, setSelectedFilter] = useState<string>("DOL");
//   const options = ["VFD", "DOL", "SD"];
//   const [controlSchemes, setControlSchemes] = useState<any[]>([]);
//   const { setLoading } = useLoading();
//   const userInfo: { division: string } = useCurrentUser();
//   const [controlSchemesSelected, setControlSchemesSelected] = useState<any[]>(
//     []
//   );
//   const [isControlSchemeEmpty, setIsControlSchemeEmpty] = useState(false);

//   const getColumnsForDivision = useCallback(() => {
//     switch (userInfo.division) {
//       case HEATING:
//         return controlSchemeColumnsForHeating;
//       case WWS_SPG:
//       case SERVICES:
//         return columnsForWwsSPG;
//       case WWS_IPG:
//         return getIPGColumns(selectedFilter);
//       case ENVIRO:
//         return getEnviroColumns(selectedFilter);
//       default:
//         return [];
//     }
//   }, [userInfo.division, selectedFilter]);
//   const typedControlSchemeColumns = useMemo(
//     () =>
//       getColumnsForDivision().map((column) => ({
//         ...column,
//         type: column.type as ValidColumnType,
//       })),
//     [getColumnsForDivision]
//   );
//   const getApiEndpoint = (division: string) => {
//     switch (division) {
//       case HEATING:
//         return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       case WWS_SPG:
//         return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       case SERVICES:
//         return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       case ENVIRO:
//         return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       case WWS_IPG:
//         return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;

//       default:
//         return "";
//     }
//   };
//   const getControlSchemeFields = (item: any, divison: string) => {
//     if (divison === HEATING) {
//       return [
//         false,
//         item.scheme,
//         item.sub_scheme,
//         item.scheme_title,
//         item.description,
//         item.breaker,
//         item.lpbs,
//         item.lpbs_inc_dec_ind,
//         item.ammeter,
//         item.thermistor_relay,
//         item.motor_space_heater,
//         item.plc_current_signal,
//         item.plc_speed_signal,
//         item.olr,
//         item.phase,
//         item.limit_switch,
//         item.motor_protection_relay,
//         item.field_isolator,
//         item.local_panel,
//         item.field_ess,
//         item.electronic_relay,
//         item.plc1_and_plc2,
//         item.mcc_start_stop,
//         item.input_choke,
//         item.output_choke,
//         item.separate_plc_start_stop,
//         item.di,
//         item.do,
//         item.ai,
//         item.ao,
//       ];
//     }
//     if (divison === ENVIRO) {
//       return [
//         false,
//         item.scheme,
//         item.sub_scheme,
//         item.scheme_title,
//         item.description,
//         item.breaker,
//         item.lpbs,
//         item.lpbs_inc_dec_ind,
//         item.ammeter,
//         item.thermistor_relay,
//         item.motor_space_heater,
//         item.plc_current_signal,
//         item.plc_speed_signal,
//         item.olr,
//         item.phase,
//         item.limit_switch,
//         item.motor_protection_relay,
//         item.field_isolator,
//         item.local_panel,
//         item.field_ess,
//         item.electronic_relay,
//         item.plc1_and_plc2,
//         item.mcc_start_stop,
//         item.input_choke,
//         item.output_choke,
//         item.separate_plc_start_stop,
//         item.di,
//         item.do,
//         item.ai,
//         item.ao,
//       ];
//     }
//     if (divison === WWS_IPG) {
//       return [
//         false,
//         item.scheme,
//         item.sub_scheme,
//         item.scheme_title,
//         item.description,
//         item.breaker,
//         item.lpbs,
//         item.lpbs_inc_dec_ind,
//         item.ammeter,
//         item.thermistor_relay,
//         item.motor_space_heater,
//         item.plc_current_signal,
//         item.plc_speed_signal,
//         item.olr,
//         item.phase,
//         item.limit_switch,
//         item.motor_protection_relay,
//         item.field_isolator,
//         item.local_panel,
//         item.field_ess,
//         item.electronic_relay,
//         item.plc1_and_plc2,
//         item.mcc_start_stop,
//         item.input_choke,
//         item.output_choke,
//         item.separate_plc_start_stop,
//         item.di,
//         item.do,
//         item.ai,
//         item.ao,
//       ];
//     }
//     if (divison === SERVICES || divison === WWS_SPG) {
//       // {
//       //   "name": "01uugsat91",
//       //   "owner": "Administrator",
//       //   "creation": "2024-11-11 16:03:36.513071",
//       //   "modified": "2024-11-11 16:03:36.513071",
//       //   "modified_by": "Administrator",
//       //   "docstatus": 0,
//       //   "idx": 0,
//       //   "scheme": "S/D-A-N-9",
//       //   "starter_type": "Star/Delta ",
//       //   "sub_type_filter": "SFU + Contactor + OLR+PLC",
//       //   "description": "Typical Control schematics for Star Delta feeder",
//       //   "type": "Distribution Board STP",
//       //   "switchgear_combination": "SFU + Contactor + OLR",
//       //   "selector_switch": "Auto / Manual",
//       //   "lbps": "N",
//       //   "indication": "On, Off, Trip",
//       //   "di": 3,
//       //   "do": 1,
//       //   "ao": 0,
//       //   "ai": 0,
//       //   "plc_feedback": "Run, Trip & Remote selection",
//       //   "plc_dcs_cmd": "On / Off Common CMD"
//       // }
//       return [
//         false,
//         item.scheme,
//         item.sub_scheme,
//         item.scheme_title,
//         item.description,
//         item.breaker,
//         item.lpbs,
//         item.lpbs_inc_dec_ind,
//         item.ammeter,
//         item.thermistor_relay,
//         item.motor_space_heater,
//         item.plc_current_signal,
//         item.plc_speed_signal,
//         item.olr,
//         item.phase,
//         item.limit_switch,
//         item.motor_protection_relay,
//         item.field_isolator,
//         item.local_panel,
//         item.field_ess,
//         item.electronic_relay,
//         item.plc1_and_plc2,
//         item.mcc_start_stop,
//         item.input_choke,
//         item.output_choke,
//         item.separate_plc_start_stop,
//         item.di,
//         item.do,
//         item.ai,
//         item.ao,
//       ];
//     }
//   };
//   useEffect(() => {
//     // setControlSchemes
//     if (userInfo.division === ENVIRO) {
//       getColumnsForDivision();
//       setControlSchemes(getEnviroSchemesData(selectedFilter));
//     }
//     if (userInfo.division === WWS_IPG) {
//       getColumnsForDivision();
//       setControlSchemes(getIPGSchemesData(selectedFilter));
//     }
//   }, [getColumnsForDivision, selectedFilter, userInfo.division]);

//   // Fetch control schemes
//   useEffect(() => {
//     // setLoading(true);
//     // fetchProjectInfo()

//     if (controlSchemes.length) return;
//     console.log(userInfo.division);

//     getData(getApiEndpoint(userInfo?.division)).then((res) => {
//       console.log(res);
//       let sortedSchemes;
//       if (userInfo.division === SERVICES || userInfo.division === WWS_SPG) {
//         sortedSchemes = WWS_SPG_DATA;
//       } else if (userInfo.division === ENVIRO) {
//         sortedSchemes = getEnviroSchemesData(selectedFilter);
//       } else if (userInfo.division === WWS_IPG) {
//         sortedSchemes = getIPGSchemesData(selectedFilter);
//       } else {
//         sortedSchemes = res
//           .map((item: any) => getControlSchemeFields(item, userInfo.division))
//           .sort((a: any, b: any) => {
//             const [prefixA, numA] = a[2].split("-");
//             const [prefixB, numB] = b[2].split("-");
//             return prefixA === prefixB
//               ? parseInt(numA, 10) - parseInt(numB, 10)
//               : prefixA.localeCompare(prefixB);
//           });
//       }

//       console.log(sortedSchemes, "control schemes sorted");

//       setControlSchemes(sortedSchemes);
//       setLoading(false);
//     });
//   }, [controlSchemes.length, selectedFilter, setLoading, userInfo.division]);
//   // Initialize main control scheme spreadsheet

//   useEffect(() => {
//     if (isOpen && controlSchemeSheetRef.current) {
//       if (controlSchemeInstance) {
//         controlSchemeInstance.destroy();
//       }

//       // Update selected schemes from localStorage
//       // const storedSchemes = localStorage.getItem("selected_control_scheme")
//       let updatedSchemes = [...controlSchemes];

//       // if (storedSchemes) {
//       try {
//         // const selectedItems = JSON.parse(storedSchemes) as string[]
//         const selectedItems = selectedControlSchemes;
//         updatedSchemes = controlSchemes.map((scheme) => {
//           if (selectedItems.includes(scheme[2])) {
//             return [true, ...scheme.slice(1)];
//           }
//           return scheme;
//         });
//       } catch (error) {
//         console.error("Error parsing selected_control_scheme:", error);
//       }
//       // }

//       const instance = jspreadsheet(controlSchemeSheetRef.current, {
//         data: updatedSchemes,
//         columns: typedControlSchemeColumns,
//         columnSorting: true,
//         columnDrag: true,
//         columnResize: true,
//         tableOverflow: true,
//         lazyLoading: true,
//         loadingSpin: true,
//         onchange: () => setIsControlSchemeEmpty(false),
//         filters: true,
//         tableWidth: "100%",
//         tableHeight: "500px",
//         freezeColumns: 4,
//         rowResize: true,
//       });
//       setControlSchemeInstance(instance);
//     }

//     return () => {
//       if (controlSchemeInstance) {
//         controlSchemeInstance.destroy();
//         setControlSchemeInstance(null);
//       }
//     };
//   }, [isOpen, controlSchemes, typedControlSchemeColumns, controlSchemeInstance, selectedControlSchemes]);

//   // Initialize selected schemes spreadsheet
//   useEffect(() => {
//     if (
//       controlSchemeSelectedSheetRef.current &&
//       controlSchemesSelected.length > 0
//     ) {
//       if (selectedSchemeInstance) {
//         selectedSchemeInstance.destroy();
//       }

//       const instance = jspreadsheet(controlSchemeSelectedSheetRef.current, {
//         data: controlSchemesSelected,
//         columns: typedControlSchemeColumns.map((column) => ({
//           ...column,
//           readOnly: true,
//         })),
//         columnSorting: true,
//         columnDrag: true,
//         columnResize: true,
//         tableOverflow: true,
//         lazyLoading: true,
//         loadingSpin: true,
//         filters: true,
//         tableWidth: "100%",
//         tableHeight: "250px",
//         freezeColumns: 4,
//         rowResize: true,
//       });
//       setSelectedSchemeInstance(instance);
//     }

//     return () => {
//       if (selectedSchemeInstance) {
//         selectedSchemeInstance.destroy();
//         setSelectedSchemeInstance(null);
//       }
//     };
//   }, [controlSchemesSelected, selectedSchemeInstance, typedControlSchemeColumns]);

//   const handleAdd = () => {
//     const selected = controlSchemeInstance
//       ?.getData()
//       .filter((row) => row[0] === true);

//     if (!selected?.length) {
//       setIsControlSchemeEmpty(true);
//       return;
//     }
//     console.log(controlSchemesSelected);
//     console.log(selected);
//     setControlSchemesSelected((prev) =>
//       Array.from(
//         new Map(
//           [...prev, ...selected].map((item) => [
//             userInfo.division === HEATING ? item[2] : item[1],
//             item,
//           ])
//         ).values()
//       )
//     );
//     setIsControlSchemeEmpty(false);
//   };

//   const handleConfirm = () => {
//     const selectedSchemes = controlSchemesSelected.map((item) => {
//       switch (userInfo.division) {
//         case HEATING:
//           return item[2];

//         case WWS_SPG:
//           return item[1];
//         case SERVICES:
//           return item[1];
//         case ENVIRO:
//           return item[1];
//         case WWS_IPG:
//           return item[1];

//         default:
//           return item[1];
//       }
//     });
//     // localStorage.setItem("selected_control_scheme", JSON.stringify([...selectedSchemes, "NA"]))
//     onConfigurationComplete([...selectedSchemes, "NA"]);
//     onClose();
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       className="w-100 max-h-screen overflow-auto"
//     >
//       <div className="m-2 flex flex-col">
//         <h2 className="mb-4 text-2xl font-bold">Control Scheme Configurator</h2>
//         <div className="w-1/4 py-1">
//           {(userInfo.division === ENVIRO || userInfo.division === WWS_IPG) && (
//             <select
//               value={selectedFilter}
//               onChange={(e) => setSelectedFilter(e.target.value)}
//               className="rounded border p-2"
//             >
//               {options.map((item) => (
//                 <option key={item} value={item}>
//                   {item}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>
//         {isControlSchemeEmpty && (
//           <AlertNotification
//             message="Please select control scheme!"
//             status="error"
//           />
//         )}
//         <div ref={controlSchemeSheetRef} />
//         <div className="flex w-full flex-row justify-end py-2">
//           <Button type="primary" onClick={handleAdd}>
//             Add
//           </Button>
//         </div>
//         {controlSchemesSelected.length > 0 && (
//           <>
//             <div ref={controlSchemeSelectedSheetRef} />
//             <div className="flex w-full flex-row justify-end py-2">
//               <Button type="primary" onClick={handleConfirm}>
//                 Confirm
//               </Button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// };

// export default ControlSchemeConfigurator;

// import { JspreadsheetInstance } from "jspreadsheet-ce";
// import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
// import jspreadsheet from "jspreadsheet-ce";
// import { Button } from "antd";
// import AlertNotification from "@/components/AlertNotification";
// import Modal from "@/components/Modal/Modal";
// import {
//   columnsForWwsSPG,
//   controlSchemeColumnsForHeating,
//   getEnviroColumns,
//   getEnviroSchemesData,
//   getIPGColumns,
//   getIPGSchemesData,
//   WWS_SPG_DATA,
// } from "@/app/Data";
// import { ValidColumnType } from "../../types";
// import { useLoading } from "@/hooks/useLoading";
// import { getData } from "@/actions/crud-actions";
// import {
//   HEATING_CONTROL_SCHEMES_URI,
//   SPG_SERVICES_CONTROL_SCHEMES_URI,
// } from "@/configs/api-endpoints";
// import {
//   ENVIRO,
//   HEATING,
//   SERVICES,
//   WWS_IPG,
//   WWS_SPG,
// } from "@/configs/constants";
// import { useCurrentUser } from "@/hooks/useCurrentUser";

// interface ControlSchemeConfiguratorProps {
//   isOpen: boolean;
//   onClose: () => void;
//   selectedControlSchemes: any[];
//   onConfigurationComplete: (selectedSchemes: string[]) => void;
// }

// const ControlSchemeConfigurator: React.FC<ControlSchemeConfiguratorProps> = React.memo(({
//   isOpen,
//   onClose,
//   selectedControlSchemes,
//   onConfigurationComplete,
// }) => {
//   const controlSchemeSheetRef = useRef<HTMLDivElement | any>(null);
//   const controlSchemeSelectedSheetRef = useRef<HTMLDivElement | any>(null);
//   const [controlSchemeInstance, setControlSchemeInstance] = useState<JspreadsheetInstance | null>(null);
//   const [selectedSchemeInstance, setSelectedSchemeInstance] = useState<JspreadsheetInstance | null>(null);
//   const [selectedFilter, setSelectedFilter] = useState<string>("DOL");
//   const [controlSchemes, setControlSchemes] = useState<any[]>([]);
//   const [controlSchemesSelected, setControlSchemesSelected] = useState<any[]>([]);
//   const [isControlSchemeEmpty, setIsControlSchemeEmpty] = useState(false);

//   const { setLoading } = useLoading();
//   const userInfo = useCurrentUser();

//   // Memoize options array
//   const options = useMemo(() => ["VFD", "DOL", "SD"], []);

//   // Memoize getColumnsForDivision
//   const getColumnsForDivision = useCallback(() => {
//     switch (userInfo.division) {
//       case HEATING:
//         return controlSchemeColumnsForHeating;
//       case WWS_SPG:
//       case SERVICES:
//         return columnsForWwsSPG;
//       case WWS_IPG:
//         return getIPGColumns(selectedFilter);
//       case ENVIRO:
//         return getEnviroColumns(selectedFilter);
//       default:
//         return [];
//     }
//   }, [userInfo.division, selectedFilter]);

//   // Memoize columns
//   const typedControlSchemeColumns = useMemo(
//     () => getColumnsForDivision().map((column) => ({
//       ...column,
//       type: column.type as ValidColumnType,
//     })),
//     [getColumnsForDivision]
//   );

//   // Memoize API endpoint
//   const getApiEndpoint = useCallback((division: string) => {
//     switch (division) {
//       case HEATING:
//         return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       case WWS_SPG:
//       case SERVICES:
//         return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       case ENVIRO:
//       case WWS_IPG:
//         return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
//       default:
//         return "";
//     }
//   }, []);

//   // Memoize getControlSchemeFields
//   const getControlSchemeFields = useCallback((item: any, division: string) => {
//     const baseFields = [
//       false,
//       item.scheme,
//       item.sub_scheme,
//       item.scheme_title,
//       item.description,
//       item.breaker,
//       item.lpbs,
//       item.lpbs_inc_dec_ind,
//       item.ammeter,
//       item.thermistor_relay,
//       item.motor_space_heater,
//       item.plc_current_signal,
//       item.plc_speed_signal,
//       item.olr,
//       item.phase,
//       item.limit_switch,
//       item.motor_protection_relay,
//       item.field_isolator,
//       item.local_panel,
//       item.field_ess,
//       item.electronic_relay,
//       item.plc1_and_plc2,
//       item.mcc_start_stop,
//       item.input_choke,
//       item.output_choke,
//       item.separate_plc_start_stop,
//       item.di,
//       item.do,
//       item.ai,
//       item.ao,
//     ];

//     return baseFields;
//   }, []);

//   // Fetch control schemes
//   useEffect(() => {
//     console.log("1");

//     if (controlSchemes.length) return;
//     console.log("2");

//     const fetchData = async () => {
//       try {
//         const res = await getData(getApiEndpoint(userInfo?.division));
//         let sortedSchemes;

//         if (userInfo.division === SERVICES || userInfo.division === WWS_SPG) {
//           sortedSchemes = WWS_SPG_DATA;
//         } else if (userInfo.division === ENVIRO) {
//           sortedSchemes = getEnviroSchemesData(selectedFilter);
//         } else if (userInfo.division === WWS_IPG) {
//           sortedSchemes = getIPGSchemesData(selectedFilter);
//         } else {
//           sortedSchemes = res
//             .map((item: any) => getControlSchemeFields(item, userInfo.division))
//             .sort((a: any, b: any) => {
//               const [prefixA, numA] = a[2].split("-");
//               const [prefixB, numB] = b[2].split("-");
//               return prefixA === prefixB
//                 ? parseInt(numA, 10) - parseInt(numB, 10)
//                 : prefixA.localeCompare(prefixB);
//             });
//         }

//         setControlSchemes(sortedSchemes);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching control schemes:", error);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [controlSchemes.length, getApiEndpoint, getControlSchemeFields, selectedFilter, setLoading, userInfo.division]);
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await getData(getApiEndpoint(userInfo?.division));
//         let sortedSchemes;

//         if (userInfo.division === SERVICES || userInfo.division === WWS_SPG) {
//           sortedSchemes = WWS_SPG_DATA;
//         } else if (userInfo.division === ENVIRO) {
//           sortedSchemes = getEnviroSchemesData(selectedFilter);
//         } else if (userInfo.division === WWS_IPG) {
//           sortedSchemes = getIPGSchemesData(selectedFilter);
//         } else {
//           sortedSchemes = res
//             .map((item: any) => getControlSchemeFields(item, userInfo.division))
//             .sort((a: any, b: any) => {
//               const [prefixA, numA] = a[2].split("-");
//               const [prefixB, numB] = b[2].split("-");
//               return prefixA === prefixB
//                 ? parseInt(numA, 10) - parseInt(numB, 10)
//                 : prefixA.localeCompare(prefixB);
//             });
//         }

//         setControlSchemes(sortedSchemes);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching control schemes:", error);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedFilter])

//   // Initialize main control scheme spreadsheet
//   useEffect(() => {
//     if (!isOpen || !controlSchemeSheetRef.current) return;

//     const initializeSpreadsheet = () => {
//       if (controlSchemeInstance) {
//         controlSchemeInstance.destroy();
//       }

//       const updatedSchemes = controlSchemes.map(scheme => {
//         const schemeId = userInfo.division === HEATING ? scheme[2] : scheme[1];
//         return selectedControlSchemes.includes(schemeId)
//           ? [true, ...scheme.slice(1)]
//           : scheme;
//       });

//       const instance = jspreadsheet(controlSchemeSheetRef.current, {
//         data: updatedSchemes,
//         columns: typedControlSchemeColumns,
//         columnSorting: true,
//         columnDrag: true,
//         columnResize: true,
//         tableOverflow: true,
//         lazyLoading: true,
//         loadingSpin: true,
//         onchange: () => setIsControlSchemeEmpty(false),
//         filters: true,
//         tableWidth: "100%",
//         tableHeight: "500px",
//         freezeColumns: 4,
//         rowResize: true,
//       });

//       setControlSchemeInstance(instance);
//     };

//     initializeSpreadsheet();

//     return () => {
//       if (controlSchemeInstance) {
//         controlSchemeInstance.destroy();
//         setControlSchemeInstance(null);
//       }
//     };
//   }, [isOpen, controlSchemes, typedControlSchemeColumns, userInfo.division, selectedControlSchemes]);

//   // Initialize selected schemes spreadsheet
//   useEffect(() => {
//     if (!controlSchemeSelectedSheetRef.current || controlSchemesSelected.length === 0) {
//       return;
//     }

//     const initializeSelectedSpreadsheet = () => {
//       if (selectedSchemeInstance) {
//         selectedSchemeInstance.destroy();
//       }

//       const instance = jspreadsheet(controlSchemeSelectedSheetRef.current, {
//         data: controlSchemesSelected,
//         columns: typedControlSchemeColumns.map((column) => ({
//           ...column,
//           readOnly: true,
//         })),
//         columnSorting: true,
//         columnDrag: true,
//         columnResize: true,
//         tableOverflow: true,
//         lazyLoading: true,
//         loadingSpin: true,
//         filters: true,
//         tableWidth: "100%",
//         tableHeight: "250px",
//         freezeColumns: 4,
//         rowResize: true,
//       });

//       setSelectedSchemeInstance(instance);
//     };

//     initializeSelectedSpreadsheet();

//     return () => {
//       if (selectedSchemeInstance) {
//         selectedSchemeInstance.destroy();
//         setSelectedSchemeInstance(null);
//       }
//     };
//   }, [controlSchemesSelected, typedControlSchemeColumns]);

//   // Memoize handlers
//   const handleAdd = useCallback(() => {
//     const selected = controlSchemeInstance
//       ?.getData()
//       .filter((row) => row[0] === true) || [];

//     if (!selected?.length) {
//       setIsControlSchemeEmpty(true);
//       // return;
//     }
//     console.log(selected);

//     setControlSchemesSelected(prev => {
//       const newSelected = Array.from(
//         new Map(
//           [...prev,...selected].map((item) => [
//             userInfo.division === HEATING ? item[2] : item[1],
//             item,
//           ])
//         ).values()
//       );
//       return newSelected;
//     });
//     setIsControlSchemeEmpty(false);
//   }, [controlSchemeInstance, userInfo.division]);

//   const handleConfirm = useCallback(() => {
//     const selectedSchemes = controlSchemesSelected.map((item) =>
//       userInfo.division === HEATING ? item[2] : item[1]
//     );
//     onConfigurationComplete([...selectedSchemes, "NA"]);
//     onClose();
//   }, [controlSchemesSelected, onConfigurationComplete, onClose, userInfo.division]);
// useEffect(() => {
//  console.log(controlSchemesSelected);

// }, [controlSchemesSelected])

//   const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedFilter(e.target.value);
//   }, []);

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       className="w-100 max-h-screen overflow-auto"
//     >
//       <div className="m-2 flex flex-col">
//         <h2 className="mb-4 text-2xl font-bold">Control Scheme Configurator</h2>
//         <div className="w-1/4 py-1">
//           {(userInfo.division === ENVIRO || userInfo.division === WWS_IPG) && (
//             <select
//               value={selectedFilter}
//               onChange={handleFilterChange}
//               className="rounded border p-2"
//             >
//               {options.map((item) => (
//                 <option key={item} value={item}>
//                   {item}
//                 </option>
//               ))}
//             </select>
//           )}
//         </div>
//         {isControlSchemeEmpty && (
//           <AlertNotification
//             message="Please select control scheme!"
//             status="error"
//           />
//         )}
//         <div ref={controlSchemeSheetRef} />
//         <div className="flex w-full flex-row justify-end py-2">
//           <Button type="primary" onClick={handleAdd}>
//             Add
//           </Button>
//         </div>
//         {controlSchemesSelected.length > 0 && (
//           <>
//             <div ref={controlSchemeSelectedSheetRef} />
//             <div className="flex w-full flex-row justify-end py-2">
//               <Button type="primary" onClick={handleConfirm}>
//                 Confirm
//               </Button>
//             </div>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// });

// ControlSchemeConfigurator.displayName = 'ControlSchemeConfigurator';

// export default ControlSchemeConfigurator;

// working code

import { JspreadsheetInstance } from "jspreadsheet-ce";
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import jspreadsheet from "jspreadsheet-ce";
import { Button } from "antd";
import AlertNotification from "@/components/AlertNotification";
import Modal from "@/components/Modal/Modal";
import {
  columnsForWwsSPG,
  controlSchemeColumnsForHeating,
  getEnviroColumns,
  getEnviroSchemesData,
  getIPGColumns,
  getIPGSchemesData,
  WWS_SPG_DATA,
} from "@/app/Data";
import { ValidColumnType } from "../../types";
import { useLoading } from "@/hooks/useLoading";
import { getData } from "@/actions/crud-actions";
import {
  HEATING_CONTROL_SCHEMES_URI,
  SPG_SERVICES_CONTROL_SCHEMES_URI,
} from "@/configs/api-endpoints";
import {
  ENVIRO,
  HEATING,
  SERVICES,
  WWS_IPG,
  WWS_SPG,
} from "@/configs/constants";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import TableFilter from "../../common/TabelFilter";

interface ControlSchemeConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedControlSchemes: any[];
  onConfigurationComplete: (selectedSchemes: string[]) => void;
}

const ControlSchemeConfigurator: React.FC<ControlSchemeConfiguratorProps> =
  React.memo(
    ({ isOpen, onClose, selectedControlSchemes, onConfigurationComplete }) => {
      const controlSchemeSheetRef = useRef<HTMLDivElement | any>(null);
      const controlSchemeSelectedSheetRef = useRef<HTMLDivElement | any>(null);
      const [controlSchemeInstance, setControlSchemeInstance] =
        useState<JspreadsheetInstance | null>(null);
      const [selectedSchemeInstance, setSelectedSchemeInstance] =
        useState<JspreadsheetInstance | null>(null);
      const [selectedFilter, setSelectedFilter] = useState<string>("DOL");
      const [controlSchemes, setControlSchemes] = useState<any[]>([]);
      const [controlSchemesSelected, setControlSchemesSelected] = useState<
        any[]
      >([]);
      const [filteredData, setFilteredData] = useState(controlSchemes);
      const [isControlSchemeEmpty, setIsControlSchemeEmpty] = useState(false);
      const [isDataFetched, setIsDataFetched] = useState(false);

      const { setLoading } = useLoading();
      const userInfo = useCurrentUser();

      const schemeIndex = userInfo?.division === HEATING ? 2 : 1;
      const options = useMemo(() => ["VFD", "DOL", "SD"], []);

      const getColumnIndex = (key: string): number => {
        const columnMap: { [key: string]: number } = {
          scheme: userInfo?.division === HEATING ? 2 : 1,
          schemeTitle: 3,
          description: 4,
          breaker: 5,
          lpbs: 17,
          di: 6,
          do: 7,
          ai: 8,
          ao: 9,
        };
        return columnMap[key] ?? -1;
      };

      const getColumnsForDivision = useCallback(() => {
        switch (userInfo?.division) {
          case HEATING:
            return controlSchemeColumnsForHeating;
          case WWS_SPG:
          case SERVICES:
            return columnsForWwsSPG;
          case WWS_IPG:
            return getIPGColumns(selectedFilter);
          case ENVIRO:
            return getEnviroColumns(selectedFilter);
          default:
            return [];
        }
      }, [userInfo?.division, selectedFilter]);

      const typedControlSchemeColumns = useMemo(
        () =>
          getColumnsForDivision().map((column) => ({
            ...column,
            type: column.type as ValidColumnType,
          })),
        [getColumnsForDivision]
      );

      const getApiEndpoint = useCallback((division: string) => {
        switch (division) {
          case HEATING:
            return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
          case WWS_SPG:
          case SERVICES:
            return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
          case ENVIRO:
          case WWS_IPG:
            return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
          default:
            return "";
        }
      }, []);

      // Initialize selected schemes from props
      useEffect(() => {
        if (!isOpen || controlSchemesSelected.length > 0) return;

        const selected: string[] = Array.from(new Set(selectedControlSchemes));
        if (selected.length && controlSchemes.length) {
          const selectedRows = controlSchemes
            .filter((scheme) => selected.includes(scheme[schemeIndex]))
            .map((scheme) => [true, ...scheme.slice(1)]);

          setControlSchemesSelected(selectedRows);
        }
      }, [isOpen, selectedControlSchemes, controlSchemes, schemeIndex]);

      // Fetch control schemes
      useEffect(() => {
        if (!isOpen || isDataFetched) return;

        const fetchData = async () => {
          try {
            setLoading(true);
            const res = await getData(getApiEndpoint(userInfo?.division));
            let sortedSchemes;

            if (
              userInfo?.division === SERVICES ||
              userInfo?.division === WWS_SPG
            ) {
              sortedSchemes = WWS_SPG_DATA;
            } else if (userInfo?.division === ENVIRO) {
              sortedSchemes = getEnviroSchemesData(selectedFilter);
            } else if (userInfo?.division === WWS_IPG) {
              sortedSchemes = getIPGSchemesData(selectedFilter);
            } else {
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
            const selected: string[] = Array.from(
              new Set(selectedControlSchemes)
            );
            // console.log(selected);
            const temp = sortedSchemes.map((scheme: string[]) => {
              if (selected.includes(scheme[schemeIndex])) {
                return [true, ...scheme.slice(1)];
              }
              return scheme;
            });
            // console.log(temp);

            // sortedSchemes.map((el: any) => {
            //   if (selected.includes(el[schemeIndex])) {
            //     return [

            //     ]
            //     // console.log(el, 'selected');
            //   }
            // });
            // if (selected.length) {
            //   setControlSchemesSelected(
            //     temp.filter((el: any) => el[0] === true)
            //   );
            // }
            setControlSchemes(temp);
            // setControlSchemes(sortedSchemes);
            setFilteredData(sortedSchemes);
            setIsDataFetched(true);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching control schemes:", error);
            setLoading(false);
          }
        };

        fetchData();
      }, [
        isOpen,
        isDataFetched,
        getApiEndpoint,
        selectedFilter,
        setLoading,
        userInfo?.division,
      ]);

      // Reset data fetched flag when modal closes
      useEffect(() => {
        if (!isOpen) {
          setIsDataFetched(false);
        }
      }, [isOpen]);

      // Initialize main control scheme spreadsheet
      useEffect(() => {
        if (!isOpen || !controlSchemeSheetRef.current || !controlSchemes.length)
          return;

        if (controlSchemeInstance) {
          controlSchemeInstance.destroy();
        }

        const instance = jspreadsheet(controlSchemeSheetRef.current, {
          data: controlSchemes,
          columns: typedControlSchemeColumns,
          columnSorting: true,
          columnDrag: true,
          columnResize: true,
          tableOverflow: true,
          lazyLoading: true,
          loadingSpin: true,
          onchange: () => setIsControlSchemeEmpty(false),
          tableWidth: "100%",
          tableHeight: "500px",
          freezeColumns: 4,
          rowResize: true,
        });

        setControlSchemeInstance(instance);

        return () => {
          if (instance) {
            instance.destroy();
          }
        };
      }, [isOpen, controlSchemes, typedControlSchemeColumns]);

      // Initialize selected schemes spreadsheet
      useEffect(() => {
        if (
          !controlSchemeSelectedSheetRef.current ||
          !controlSchemesSelected.length
        )
          return;

        if (selectedSchemeInstance) {
          selectedSchemeInstance.destroy();
        }

        const instance = jspreadsheet(controlSchemeSelectedSheetRef.current, {
          data: controlSchemesSelected,
          columns: typedControlSchemeColumns.map((column) => ({
            ...column,
            readOnly: true,
          })),
          columnSorting: true,
          columnDrag: true,
          columnResize: true,
          tableOverflow: true,
          lazyLoading: true,
          loadingSpin: true,
          tableWidth: "100%",
          tableHeight: "250px",
          freezeColumns: 4,
          rowResize: true,
        });

        setSelectedSchemeInstance(instance);

        return () => {
          if (instance) {
            instance.destroy();
          }
        };
      }, [controlSchemesSelected]); // Removed dependencies that could trigger unwanted rerenders

      const handleAdd = useCallback(() => {
        if (!controlSchemeInstance) return;

        const currentData = controlSchemeInstance.getData();
        const checkedRows = currentData.filter((row) => row[0] === true);
        const uncheckedRows = currentData.filter((row) => row[0] === false);

        if (!checkedRows.length && !controlSchemesSelected.length) {
          setIsControlSchemeEmpty(true);
          return;
        }

        const getSchemeId = (row: any) =>
          userInfo.division === HEATING ? row[2] : row[1];
        const checkedSchemeIds = new Set(checkedRows.map(getSchemeId));
        const uncheckedSchemeIds = new Set(uncheckedRows.map(getSchemeId));

        setControlSchemesSelected((prevSelected) => {
          const updatedSelected = prevSelected.filter((row) => {
            const rowSchemeId = getSchemeId(row);
            return !uncheckedSchemeIds.has(rowSchemeId);
          });

          checkedRows.forEach((row) => {
            const rowSchemeId = getSchemeId(row);
            if (
              !updatedSelected.some(
                (existing) => getSchemeId(existing) === rowSchemeId
              )
            ) {
              updatedSelected.push(row);
            }
          });

          return updatedSelected;
        });

        setIsControlSchemeEmpty(false);
      }, [controlSchemeInstance, userInfo?.division]);

      const filterConfig: any[] = [
        {
          key: "scheme",
          label: "Scheme",
          type: "input",
          placeholder: "Search by scheme",
        },
        {
          key: "schemeTitle",
          label: "Scheme Title",
          type: "input",
          placeholder: "Search by title",
        },
        {
          key: "description",
          label: "Description",
          type: "input",
          placeholder: "Search by description",
        },
        {
          key: "breaker",
          label: "Breaker",
          type: "input",
          placeholder: "Search by Breaker",
        },
        {
          key: "di",
          label: "Di",
          type: "input",
          placeholder: "Search by Di",
        },
        {
          key: "do",
          label: "Do",
          type: "input",
          placeholder: "Search by Do",
        },
        {
          key: "ai",
          label: "Ai",
          type: "input",
          placeholder: "Search by Ai",
        },
        {
          key: "ao",
          label: "Ao",
          type: "input",
          placeholder: "Search by Ao",
        },
      ];

      const handleConfirm = useCallback(() => {
        const selectedSchemes = controlSchemesSelected.map((item) =>
          userInfo?.division === HEATING ? item[2] : item[1]
        );
        onConfigurationComplete([...selectedSchemes, "NA"]);
        onClose();
      }, [
        controlSchemesSelected,
        onConfigurationComplete,
        onClose,
        userInfo?.division,
      ]);

      const handleFilter = useCallback(
        (values: any) => {
          let filtered = [...controlSchemes];

          Object.entries(values).forEach(([key, value]) => {
            if (value) {
              const columnIndex = getColumnIndex(key);
              if (columnIndex === -1) {
                console.warn(`No column mapping found for key: ${key}`);
                return;
              }

              filtered = filtered.filter((item) => {
                const itemValue = item[columnIndex];
                if (itemValue === undefined) {
                  console.warn(
                    `No value found at index ${columnIndex} for item`,
                    item
                  );
                  return true;
                }

                if (typeof value === "string") {
                  return itemValue
                    .toString()
                    .toLowerCase()
                    .includes(value.toLowerCase());
                }
                return itemValue === value;
              });
            }
          });

          setFilteredData(filtered);
          if (controlSchemeInstance) {
            controlSchemeInstance.setData(filtered);
          }
        },
        [controlSchemes, controlSchemeInstance]
      );

      const handleFilterChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
          setSelectedFilter(e.target.value);
          setIsDataFetched(false);
        },
        []
      );

      // const { setLoading } = useLoading();
      // const userInfo = useCurrentUser();
      // interface ColumnMapping {
      //   [key: string]: number;
      // }
      // const schemeIndex = userInfo?.division === HEATING ? 2 : 1;
      // // You could also make this a constant at the component level if it doesn't need to change
      // const COLUMN_INDICES: ColumnMapping = {
      //   scheme: 1,
      //   schemeTitle: 3,
      //   description: 4,
      //   // ... other mappings
      // };
      // // Memoize options array
      // const options = useMemo(() => ["VFD", "DOL", "SD"], []);
      // const getColumnIndex = (key: string): number => {
      //   // This mapping should match your column structure
      //   const columnMap: { [key: string]: number } = {
      //     // The first column (index 0) is typically the checkbox
      //     scheme: userInfo.division === HEATING ? 2 : 1, // scheme or sub_scheme
      //     schemeTitle: 3, // scheme_title
      //     description: 5, // description
      //     breaker: 5,
      //     lpbs: 17,
      //     di: 6,
      //     do: 7,
      //     ai: 8,
      //     ao: 9,
      //     // Add more mappings based on your column structure
      //   };

      //   return columnMap[key] ?? -1; // Return -1 if key not found
      // };
      // // Memoize getColumnsForDivision
      // const getColumnsForDivision = useCallback(() => {
      //   switch (userInfo.division) {
      //     case HEATING:
      //       return controlSchemeColumnsForHeating;
      //     case WWS_SPG:
      //     case SERVICES:
      //       return columnsForWwsSPG;
      //     case WWS_IPG:
      //       return getIPGColumns(selectedFilter);
      //     case ENVIRO:
      //       return getEnviroColumns(selectedFilter);
      //     default:
      //       return [];
      //   }
      // }, [userInfo.division, selectedFilter]);

      // // Memoize columns
      // const typedControlSchemeColumns = useMemo(
      //   () =>
      //     getColumnsForDivision().map((column) => ({
      //       ...column,
      //       type: column.type as ValidColumnType,
      //     })),
      //   [getColumnsForDivision]
      // );

      // // Memoize API endpoint
      // const getApiEndpoint = useCallback((division: string) => {
      //   switch (division) {
      //     case HEATING:
      //       return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
      //     case WWS_SPG:
      //     case SERVICES:
      //       return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
      //     case ENVIRO:
      //     case WWS_IPG:
      //       return `${HEATING_CONTROL_SCHEMES_URI}?limit=1000&fields=["*"]`;
      //     default:
      //       return "";
      //   }
      // }, []);

      // // Fetch control schemes
      // useEffect(() => {
      //   if (!isOpen || isDataFetched) return;

      //   const fetchData = async () => {
      //     try {
      //       setLoading(true);
      //       const res = await getData(getApiEndpoint(userInfo?.division));
      //       let sortedSchemes;

      //       if (
      //         userInfo.division === SERVICES ||
      //         userInfo.division === WWS_SPG
      //       ) {
      //         sortedSchemes = WWS_SPG_DATA;
      //       } else if (userInfo.division === ENVIRO) {
      //         sortedSchemes = getEnviroSchemesData(selectedFilter);
      //       } else if (userInfo.division === WWS_IPG) {
      //         sortedSchemes = getIPGSchemesData(selectedFilter);
      //       } else {
      //         sortedSchemes = res
      //           .map((item: any) => [
      //             false,
      //             item.scheme,
      //             item.sub_scheme,
      //             item.scheme_title,
      //             item.description,
      //             item.breaker,
      //             item.lpbs,
      //             item.lpbs_inc_dec_ind,
      //             item.ammeter,
      //             item.thermistor_relay,
      //             item.motor_space_heater,
      //             item.plc_current_signal,
      //             item.plc_speed_signal,
      //             item.olr,
      //             item.phase,
      //             item.limit_switch,
      //             item.motor_protection_relay,
      //             item.field_isolator,
      //             item.local_panel,
      //             item.field_ess,
      //             item.electronic_relay,
      //             item.plc1_and_plc2,
      //             item.mcc_start_stop,
      //             item.input_choke,
      //             item.output_choke,
      //             item.separate_plc_start_stop,
      //             item.di,
      //             item.do,
      //             item.ai,
      //             item.ao,
      //           ])
      //           .sort((a: any, b: any) => {
      //             const [prefixA, numA] = a[2].split("-");
      //             const [prefixB, numB] = b[2].split("-");
      //             return prefixA === prefixB
      //               ? parseInt(numA, 10) - parseInt(numB, 10)
      //               : prefixA.localeCompare(prefixB);
      //           });
      //       }
      //       console.log(new Set(selectedControlSchemes));

      //       // Convert Set to Array properly
      //       const selected: string[] = Array.from(
      //         new Set(selectedControlSchemes)
      //       );
      //       console.log(selected);
      //       const temp = sortedSchemes.map((scheme: string[]) => {
      //         if (selected.includes(scheme[schemeIndex])) {
      //           return [true, ...scheme.slice(1)];
      //         }
      //         return scheme;
      //       });
      //       console.log(temp);

      //       // sortedSchemes.map((el: any) => {
      //       //   if (selected.includes(el[schemeIndex])) {
      //       //     return [

      //       //     ]
      //       //     // console.log(el, 'selected');
      //       //   }
      //       // });
      //       if (selected.length) {
      //         setControlSchemesSelected(
      //           temp.filter((el: any) => el[0] === true)
      //         );
      //       }
      //       setControlSchemes(temp);
      //       setIsDataFetched(true);
      //       setLoading(false);
      //     } catch (error) {
      //       console.error("Error fetching control schemes:", error);
      //       setLoading(false);
      //     }
      //   };

      //   fetchData();
      // }, [
      //   isOpen,
      //   isDataFetched,
      //   getApiEndpoint,
      //   selectedFilter,
      //   setLoading,
      //   userInfo?.division,
      // ]);

      // // Reset data fetched flag when modal closes
      // useEffect(() => {
      //   if (!isOpen) {
      //     setIsDataFetched(false);
      //   }
      // }, [isOpen]);

      // // Effect for filter change
      // useEffect(() => {
      //   if (!isOpen || !isDataFetched) return;

      //   if (userInfo.division === ENVIRO) {
      //     setControlSchemes(getEnviroSchemesData(selectedFilter));
      //   } else if (userInfo.division === WWS_IPG) {
      //     setControlSchemes(getIPGSchemesData(selectedFilter));
      //   }
      // }, [selectedFilter, userInfo.division, isOpen, isDataFetched]);

      // // Initialize main control scheme spreadsheet
      // useEffect(() => {
      //   if (!isOpen || !controlSchemeSheetRef.current || !controlSchemes.length)
      //     return;

      //   if (controlSchemeInstance) {
      //     controlSchemeInstance.destroy();
      //   }

      //   const instance = jspreadsheet(controlSchemeSheetRef.current, {
      //     data: controlSchemes,
      //     columns: typedControlSchemeColumns,
      //     columnSorting: true,
      //     columnDrag: true,
      //     columnResize: true,
      //     tableOverflow: true,
      //     lazyLoading: true,
      //     loadingSpin: true,
      //     onchange: () => setIsControlSchemeEmpty(false),
      //     // filters: true,
      //     tableWidth: "100%",
      //     tableHeight: "500px",
      //     freezeColumns: 4,
      //     rowResize: true,
      //   });

      //   setControlSchemeInstance(instance);

      //   return () => {
      //     if (instance) {
      //       instance.destroy();
      //     }
      //   };
      // }, [isOpen, controlSchemes, typedControlSchemeColumns]);

      // // Initialize selected schemes spreadsheet
      // useEffect(() => {
      //   if (
      //     !controlSchemeSelectedSheetRef.current ||
      //     !controlSchemesSelected.length
      //   )
      //     return;

      //   if (selectedSchemeInstance) {
      //     selectedSchemeInstance.destroy();
      //   }

      //   const instance = jspreadsheet(controlSchemeSelectedSheetRef.current, {
      //     data: controlSchemesSelected,
      //     columns: typedControlSchemeColumns.map((column, index) => ({
      //       ...column,
      //       readOnly: true,
      //     })),
      //     columnSorting: true,
      //     columnDrag: true,
      //     columnResize: true,
      //     tableOverflow: true,
      //     lazyLoading: true,
      //     loadingSpin: true,
      //     // filters: true,
      //     tableWidth: "100%",
      //     tableHeight: "250px",
      //     freezeColumns: 4,
      //     rowResize: true,
      //   });

      //   setSelectedSchemeInstance(instance);

      //   return () => {
      //     if (instance) {
      //       instance.destroy();
      //     }
      //   };
      // }, [controlSchemesSelected, typedControlSchemeColumns]);

      // const handleAdd = useCallback(() => {
      //   if (!controlSchemeInstance) return;

      //   const currentData = controlSchemeInstance.getData();
      //   const checkedRows = currentData.filter((row) => row[0] === true);
      //   const uncheckedRows = currentData.filter((row) => row[0] === false);

      //   if (!checkedRows.length && !controlSchemesSelected.length) {
      //     setIsControlSchemeEmpty(true);
      //     return;
      //   }

      //   const getSchemeId = (row: any) =>
      //     userInfo.division === HEATING ? row[2] : row[1];
      //   const checkedSchemeIds = new Set(checkedRows.map(getSchemeId));
      //   const uncheckedSchemeIds = new Set(uncheckedRows.map(getSchemeId));

      //   setControlSchemesSelected((prevSelected) => {
      //     const updatedSelected = prevSelected.filter((row) => {
      //       const rowSchemeId = getSchemeId(row);
      //       return !uncheckedSchemeIds.has(rowSchemeId);
      //     });

      //     checkedRows.forEach((row) => {
      //       const rowSchemeId = getSchemeId(row);
      //       if (
      //         !updatedSelected.some(
      //           (existing) => getSchemeId(existing) === rowSchemeId
      //         )
      //       ) {
      //         updatedSelected.push(row);
      //       }
      //     });

      //     return updatedSelected;
      //   });

      //   // controlSchemeInstance.setData(
      //   //   currentData.map((row) => [false, ...row.slice(1)])
      //   // );
      //   setIsControlSchemeEmpty(false);
      // }, [controlSchemeInstance, userInfo.division]);
      // const filterConfig: any[] = [
      //   {
      //     key: "scheme", // matches the key in columnMap
      //     label: "Scheme",
      //     type: "input",
      //     placeholder: "Search by scheme",
      //   },
      //   {
      //     key: "schemeTitle",
      //     label: "Scheme Title",
      //     type: "input",
      //     placeholder: "Search by title",
      //   },
      //   {
      //     key: "description",
      //     label: "Description",
      //     type: "input",
      //     placeholder: "Search by description",
      //   },
      //   {
      //     key: "di",
      //     label: "Di",
      //     type: "input",
      //     placeholder: "Search by Di",
      //   },
      //   {
      //     key: "do",
      //     label: "Do",
      //     type: "input",
      //     placeholder: "Search by Do",
      //   },
      //   {
      //     key: "ai",
      //     label: "Ai",
      //     type: "input",
      //     placeholder: "Search by Ai",
      //   },
      //   {
      //     key: "ao",
      //     label: "Ao",
      //     type: "input",
      //     placeholder: "Search by Ao",
      //   },
      // ];
      // const handleConfirm = useCallback(() => {
      //   const selectedSchemes = controlSchemesSelected.map((item) =>
      //     userInfo.division === HEATING ? item[2] : item[1]
      //   );
      //   onConfigurationComplete([...selectedSchemes, "NA"]);
      //   onClose();
      // }, [
      //   controlSchemesSelected,
      //   onConfigurationComplete,
      //   onClose,
      //   userInfo.division,
      // ]);
      // const handleFilter = useCallback(
      //   (values: any) => {
      //     let filtered = [...controlSchemes];

      //     Object.entries(values).forEach(([key, value]) => {
      //       if (value) {
      //         const columnIndex = getColumnIndex(key);
      //         if (columnIndex === -1) {
      //           console.warn(`No column mapping found for key: ${key}`);
      //           return;
      //         }
      //         console.log(columnIndex);

      //         filtered = filtered.filter((item) => {
      //           const itemValue = item[columnIndex];
      //           if (itemValue === undefined) {
      //             console.warn(
      //               `No value found at index ${columnIndex} for item`,
      //               item
      //             );
      //             return true; // Skip filtering this item
      //           }

      //           if (typeof value === "string") {
      //             return itemValue
      //               .toString()
      //               .toLowerCase()
      //               .includes(value.toLowerCase());
      //           }
      //           return itemValue === value;
      //         });
      //       }
      //     });

      //     setFilteredData(filtered);
      //     if (controlSchemeInstance) {
      //       controlSchemeInstance.setData(filtered);
      //     }
      //   },
      //   [controlSchemes, controlSchemeInstance, userInfo.division]
      // );

      // const handleFilterChange = useCallback(
      //   (e: React.ChangeEvent<HTMLSelectElement>) => {
      //     setSelectedFilter(e.target.value);
      //     setIsDataFetched(false); // Reset flag to trigger new data fetch
      //   },
      //   []
      // );
      // useEffect(() => {
      //   console.log(controlSchemesSelected);
      // }, [controlSchemesSelected]);

      return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          className="w-100 max-h-screen overflow-auto"
        >
          <div className="m-2 flex flex-col">
            <h2 className="mb-4 text-2xl font-bold">
              Control Scheme Configurator
            </h2>
            <div className="w-1/4 py-1">
              {(userInfo.division === ENVIRO ||
                userInfo.division === WWS_IPG) && (
                <select
                  value={selectedFilter}
                  onChange={handleFilterChange}
                  className="rounded border p-2"
                >
                  {options.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <TableFilter
              filters={filterConfig}
              onFilter={handleFilter}
              loading={false}
            />
            {isControlSchemeEmpty && (
              <AlertNotification
                message="Please select control scheme!"
                status="error"
              />
            )}
            <div ref={controlSchemeSheetRef} />
            <div className="flex w-full flex-row justify-end py-2">
              <Button type="primary" onClick={handleAdd}>
                Add
              </Button>
            </div>
            {controlSchemesSelected.length > 0 && (
              <>
                <div ref={controlSchemeSelectedSheetRef} />
                <div className="flex w-full flex-row justify-end py-2">
                  <Button type="primary" onClick={handleConfirm}>
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      );
    }
  );

ControlSchemeConfigurator.displayName = "ControlSchemeConfigurator";

export default ControlSchemeConfigurator;
