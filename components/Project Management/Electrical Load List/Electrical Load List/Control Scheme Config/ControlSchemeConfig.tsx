import { JspreadsheetInstance } from "jspreadsheet-ce";
import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import jspreadsheet from "jspreadsheet-ce";
import { Button } from "antd";
import AlertNotification from "@/components/AlertNotification";
import Modal from "@/components/Modal/Modal";
import {
  columnsForWwsSPG,
  controlSchemeColumnsForHeating,
  getEnviroColumns,
  getIPGColumns,
  getIPGSchemesData,
} from "@/app/Data";
import { ValidColumnType } from "../../types";
import { useLoading } from "@/hooks/useLoading";
import { getData } from "@/actions/crud-actions";
import {
  ENVIRO_CONTROL_SCHEMES_URI,
  HEATING_CONTROL_SCHEMES_URI,
  IPG_CONTROL_SCHEMES_URI,
  SPG_SERVICES_CONTROL_SCHEMES_URI,
} from "@/configs/api-endpoints";
import {
  ENVIRO,
  HEATING,
  WWS_SERVICES,
  WWS_IPG,
  WWS_SPG,
} from "@/configs/constants";
import TableFilter from "../../common/TabelFilter";
import "./ControlSchemeConfig.css";
interface ControlSchemeConfiguratorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedControlSchemes: any[];
  onConfigurationComplete: (selectedSchemes: string[]) => void;
  division: string;
}
const MemoizedTableFilter = memo(TableFilter);
export const getSortedControlSchemes = (data: any, division: string) => {
  if (division === ENVIRO) {
    const schemes = data?.map((scheme: any) => [
      false,
      scheme.scheme,
      scheme.type,
      scheme.starter,
      scheme.di,
      scheme.do,
      scheme.ai,
      scheme.ao,
      scheme.mccb,
      scheme.mpcb,
      scheme.ammeter,
      scheme.current_transducer,
      scheme.olr,
      scheme.rating,
      scheme.lpbs,
      scheme.space_heater,
      scheme.eocr_eolr,
      scheme.sfu,
      scheme.hrc,
      scheme.direct_connected_ammeter_3_nos,
    ]);
    const sortedData = schemes?.sort((a: any, b: any) => {
      // Extract numbers after 'D' from the second element of each subarray
      const numA = parseInt(a[1].split("-")[0].substring(1));
      const numB = parseInt(b[1].split("-")[0].substring(1));

      // Sort in ascending order (a - b)
      return numA - numB;
    });
    console.log(sortedData);
    return schemes;
  }
  if (division === WWS_IPG) {
    const schemes = data?.map((scheme: any) => [
      false,
      scheme.scheme,
      scheme.type,
      scheme.starter,
      scheme.di,
      scheme.do,
      scheme.ai,
      scheme.ao,
      scheme.mccb,
      scheme.mpcb,
      scheme.ammeter,
      scheme.current_transducer,
      scheme.olr,
      scheme.rating,
      scheme.lpbs,
      scheme.space_heater,
      scheme.eocr_eolr,
      scheme.sfu,
      scheme.hrc,
      scheme.direct_connected_ammeter_3_nos,
    ]);
    // const sortedData = schemes?.sort((a: any, b: any) => {
    //   // Extract numbers after 'D' from the second element of each subarray
    //   const numA = parseInt(a[1].split("-")[0].substring(1));
    //   const numB = parseInt(b[1].split("-")[0].substring(1));

    //   // Sort in ascending order (a - b)
    //   return numA - numB;
    // });
    // console.log(sortedData);
    return schemes;
  }
  if (division === WWS_SPG || division === WWS_SERVICES) {
    const schemes = data?.map((scheme: any) => [
      false,
      scheme.scheme,
      scheme.starter_type,
      scheme.sub_type_filter,
      scheme.description,
      scheme.type,
      scheme.selector_switch,
      scheme.lbps,
      scheme.indication,
      scheme.di,
      scheme.do,
      scheme.ao,
      scheme.ai,
      scheme.plc_feedback,
      scheme.plc_dcs_cmd,
    ]);

    return schemes;
  }
};

const ControlSchemeConfigurator: React.FC<ControlSchemeConfiguratorProps> =
  React.memo(
    ({
      isOpen,
      onClose,
      selectedControlSchemes,
      onConfigurationComplete,
      division,
    }) => {
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
      const [isControlSchemeEmpty, setIsControlSchemeEmpty] = useState(false);
      const [isDataFetched, setIsDataFetched] = useState(false);

      const { setLoading } = useLoading();

      const schemeIndex = division === HEATING ? 2 : 1;

      const getColumnsForDivision = useCallback(() => {
        switch (division) {
          case HEATING:
            return controlSchemeColumnsForHeating;
          case WWS_SPG:
          case WWS_SERVICES:
            return columnsForWwsSPG;
          case WWS_IPG:
            return getIPGColumns(selectedFilter);
          case ENVIRO:
            return getEnviroColumns();
          default:
            return [];
        }
      }, [division, selectedFilter]);

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
            return `${HEATING_CONTROL_SCHEMES_URI}?limit=3000&fields=["*"]`;
          case WWS_SPG:
          case WWS_SERVICES:
            return `${SPG_SERVICES_CONTROL_SCHEMES_URI}?limit=3000&fields=["*"]`;
          case ENVIRO:
            return `${ENVIRO_CONTROL_SCHEMES_URI}?limit=3000&fields=["*"]`;
          case WWS_IPG:
            return `${IPG_CONTROL_SCHEMES_URI}?limit=3000&fields=["*"]`;
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
        console.log("set selected schemes");
      }, [isOpen, selectedControlSchemes, controlSchemes, schemeIndex]);

      // Fetch control schemes
      useEffect(() => {
        if (!isOpen || isDataFetched) return;

        const fetchData = async () => {
          try {
            setLoading(true);
            const res = await getData(getApiEndpoint(division));
            let sortedSchemes;
            console.log(res, "control schemes data");
            if (division === WWS_SERVICES || division === WWS_SPG) {
              sortedSchemes = getSortedControlSchemes(res, division);
            } else if (division === ENVIRO) {
              sortedSchemes = getSortedControlSchemes(res, division);
            } else if (division === WWS_IPG) {
              sortedSchemes = getIPGSchemesData();
            } else if (division === HEATING) {
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
            const temp = sortedSchemes.map((scheme: string[]) => {
              if (selected.includes(scheme[schemeIndex])) {
                return [true, ...scheme.slice(1)];
              }
              return scheme;
            });
            console.log("set all schemes");

            setControlSchemes(temp);
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
        division,
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
      const controlSchemeOptions: any = useMemo(
        () => ({
          data: controlSchemesSelected,
          license: "39130-64ebc-bd98e-26bc4",
          columns: typedControlSchemeColumns.map((column) => ({
            ...column,
            // readOnly: true,
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
          onchange: (
            instance: any,
            cell: any,
            x: string,
            y: any,
            value: boolean
          ) => {
            console.log(typeof y);

            if (x === "0") {
              // Check if change is in the checkbox column
              const rowIndex = y;
              if (value === false) {
                // console.log(cell, x, y, value);

                // const data = selectedSchemeInstance?.getData();
                // console.log(controlSchemesSelected);
                // console.log(selectedControlSchemes);
                // console.log(data);
                // selectedSchemeInstance?.setData([])

                // Remove the unchecked row from controlSchemesSelected
                // setControlSchemesSelected(prev =>
                //   prev.filter((el:any) => el[0] === true)
                // );
              }
            }
          },
        }),
        [controlSchemesSelected, typedControlSchemeColumns]
      );

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

        const instance = jspreadsheet(
          controlSchemeSelectedSheetRef.current,
          controlSchemeOptions
        );

        setSelectedSchemeInstance(instance);

        return () => {
          if (instance) {
            instance.destroy();
          }
        };
      }, [controlSchemesSelected, typedControlSchemeColumns]); // Removed dependencies that could trigger unwanted rerenders

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
          division === HEATING ? row[2] : row[1];
        const checkedSchemeIds = new Set(checkedRows.map(getSchemeId));
        const uncheckedSchemeIds = new Set(uncheckedRows.map(getSchemeId));
        console.log("set after add schemes");

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
      }, [controlSchemeInstance, division]);
      const getColumnIndex = (key: string): number => {
        const columnMap: { [key: string]: number } = {
          scheme: division === HEATING ? 2 : 1,
          schemeTitle: 3,
          description: 4,
          breaker: 5,
          // lpbs: 17,
          di: 6,
          do: 7,
          ai: 8,
          ao: 9,
          field_isolator: 17,
          mcc_start_stop: 22,
          input_choke: 23,
          output_choke: 24,
          selector_switch: 6,
          indication: 8,
          rating: 15,
          type: division === WWS_SPG || division === WWS_SERVICES ? 5 : 100,
          starter_type: division === ENVIRO ? 2 : division === WWS_IPG ? 4 : 2,
        };
        return columnMap[key] ?? -1;
      };

      const filterConfig: any = () => {
        const config = [
          {
            key: "scheme",
            label: division === HEATING ? "Sub Scheme No" : "Scheme No",
            type: "input",
            placeholder:
              division === HEATING
                ? "Search by Sub Scheme No"
                : "Search by Scheme No",
          },
          // {
          //   key: "schemeTitle",
          //   label: "Scheme Title",
          //   type: "input",
          //   placeholder: "Search by Scheme Title",
          // },
        ];
        if (division === HEATING) {
          config.push(
            {
              key: "description",
              label: "Description",
              type: "input",
              placeholder: "Search by Description",
            },
            {
              key: "breaker",
              label: "Breaker",
              type: "input",
              placeholder: "Search by Breaker",
            },
            {
              key: "field_isolator",
              label: "Field Isolator",
              type: "input",
              placeholder: "Search Yes,No",
            },
            {
              key: "input_choke",
              label: "Input Choke",
              type: "input",
              placeholder: "Search Yes,No",
            },
            {
              key: "output_choke",
              label: "Output Choke",
              type: "input",
              placeholder: "Search Yes,No",
            },
            {
              key: "mcc_start_stop",
              label: "MCC Start/Stop",
              type: "input",
              placeholder: "Search Yes,No",
            }
          );
        }
        if (division === ENVIRO) {
          config.push({
            key: "starter_type",
            label: "Starter Type",
            type: "input",
            placeholder: "Search by Starter Type",
          });
        }
        if (division === WWS_SPG || division === WWS_SERVICES) {
          config.push(
            {
              key: "starter_type",
              label: "Starter Type",
              type: "input",
              placeholder: "Search by Starter Type",
            },
            {
              key: "description",
              label: "Scheme Description",
              type: "input",
              placeholder: "Search by Scheme Description",
            },
            {
              key: "type",
              label: "Type",
              type: "input",
              placeholder: "Search by Type",
            }
          );
        }
        if (division === WWS_IPG) {
          config.push({
            key: "starter_type",
            label: "Starter Type",
            type: "input",
            placeholder: "Search by Starter Type",
          });

          config.push({
            key: "rating",
            label: "Rating",
            type: "input",
            placeholder: "Search by Rating",
          });
        }
        return config;
      };

      const handleConfirm = useCallback(() => {
        console.log(controlSchemesSelected);

        const selectedSchemes = controlSchemesSelected
          .filter((item: any) => item[0] === true)
          .map((item) => (division === HEATING ? item[2] : item[1]));
        if (division === HEATING) {
          const selectedSchemesWithLpbs = controlSchemesSelected.map((item) => {
            return { control_scheme: item[2], lpbs_type: item[6] };
          });
          localStorage.setItem(
            "control_schemes_lpbs",
            JSON.stringify(selectedSchemesWithLpbs)
          );
        }
        onConfigurationComplete([...selectedSchemes, "NA"]);
        onClose();
      }, [controlSchemesSelected, onConfigurationComplete, onClose, division]);

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
            <div className="w-1/4 py-1"></div>
            <MemoizedTableFilter
              filters={filterConfig()}
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
