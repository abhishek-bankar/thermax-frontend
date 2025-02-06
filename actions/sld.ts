"use server";
import {
  SWITCHGEAR_API,
  SOFTSTARTER_SWITCHGEAR_API,
  SUPPLYFEEDER_SWITCHGEAR_API,
  VFD_SWITCHGEAR_API,
} from "@/configs/api-endpoints";
import { downloadFrappeCloudFile, getData } from "./crud-actions";

import { HEATING } from "@/configs/constants";
export const getSwSelectionDetails = async (payload: any) => {
  const division = payload.division;
  const swData = payload.data;
  const project_id = payload.project_id;

  const filters_htr = JSON.stringify([
    ["division_subtype", "=", "With Heater"],
  ]);
  let filters_all;
  if (division === HEATING) {
    filters_all = JSON.stringify([
      ["division", "=", division],
      ["division_subtype", "=", "Without Heater"],
    ]);
  } else {
    filters_all = JSON.stringify([["division", "=", division]]);
  }

  const database_dol_htr = await getData(
    `${SWITCHGEAR_API}?filters=${filters_htr}&fields=["*"]&limit=2500`
  );
  const switchgear_database = await getData(
    `${SWITCHGEAR_API}?filters=${filters_all}&fields=["*"]&limit=2500`
  );
  const database_vfd = await getData(
    `${VFD_SWITCHGEAR_API}?fields=["*"]&limit=2500`
  );
  const database_soft_starter = await getData(
    `${SOFTSTARTER_SWITCHGEAR_API}?fields=["*"]&limit=2500`
  );
  const database_supply_feeder = await getData(
    `${SUPPLYFEEDER_SWITCHGEAR_API}?fields=["*"]&limit=3000`
  );

  const getSwitchgearSelection = (
    swData: any,
    database_dol_htr: any,
    switchgear_database: any,
    database_vfd: any,
    database_soft_starter: any,
    database_supply_feeder: any,
    division: string
  ) => {
    const result = swData
      ?.map((el: any) => {
        const { tag_number, kw, starter_type, make, sw_type, starting_time } =
          el;

        if (starter_type === "DOL-HTR") {
          const matchingOptions = database_dol_htr.filter(
            (item: any) =>
              item.make === make &&
              item.sg_select === sw_type &&
              item.starter_type === "HEATERS"
          );

          if (matchingOptions.length === 0) {
            return {
              tag_number,
              vfd: "",
              breaker_fuse: "",
              fuse_holder: "",
              contractor_main: "",
              contractor_star: "",
              contractor_delta: "",
              overlay_relay: "",
              terminal_part_no: "",
            };
          }

          const sortedByKW = matchingOptions.sort(
            (a: any, b: any) => a.kw - b.kw
          );
          const switchgear = sortedByKW.find((item: any) => item.kw >= kw);

          if (!switchgear) {
            return {
              tag_number,
              vfd: "",
              breaker_fuse: "",
              fuse_holder: "",
              contractor_main: "",
              contractor_star: "",
              contractor_delta: "",
              overlay_relay: "",
              terminal_part_no: "",
            };
          }

          return {
            tag_number,
            vfd: "",
            breaker_fuse: switchgear.breaker,
            fuse_holder: "",
            contractor_main: switchgear.main_contractor_data || "",
            contractor_star: "",
            contractor_delta: "",
            overlay_relay: "",
            terminal_part_no: "",
          };
        }

        let matchingOptions: any[] = [];

        if (
          starter_type === "VFD" ||
          starter_type === "VFD BYPASS-S/D" ||
          starter_type === "VFD Bypass DOL"
        ) {
          matchingOptions = database_vfd.filter(
            (item: any) => item.vfd_make === make && item.sg_select === sw_type
          );
        } else if (
          starter_type === "DOL STARTER" ||
          starter_type === "STAR-DELTA"
        ) {
          matchingOptions =
            division === "HEATING"
              ? switchgear_database.filter(
                  (item: any) =>
                    item.make === make &&
                    item.sg_select === sw_type &&
                    item.starter_type === starter_type &&
                    item.unit_7 === starting_time.split(" ")[0] + " sec" // converted Sec to sec (sec) is in database
                )
              : switchgear_database.filter(
                  (item: any) =>
                    item.make === make &&
                    item.sg_select === sw_type &&
                    item.starter_type === starter_type
                );
        } else if (starter_type === "SOFT STARTER") {
          matchingOptions = []; // soft starter data is pending from client
        } else if (starter_type === "SUPPLY FEEDER") {
          matchingOptions = database_supply_feeder.filter(
            (item: any) =>
              item.make === make &&
              item.sg_select === sw_type &&
              item.starter_type === starter_type
          );
        } else {
          matchingOptions = switchgear_database.filter(
            (item: any) =>
              item.make === make &&
              item.sg_select === sw_type &&
              item.starter_type === starter_type
          );
        }

        if (matchingOptions.length === 0) {
          return {
            tag_number,
            vfd: "",
            breaker_fuse: "",
            fuse_holder: "",
            contractor_main: "",
            contractor_star: "",
            contractor_delta: "",
            overlay_relay: "",
            terminal_part_no: "",
          };
        }

        const sortedByKW = matchingOptions.sort(
          (a: any, b: any) => a.kw - b.kw
        );
        if (kw === 90) {
          console.log(sortedByKW);
        }
        const switchgear = sortedByKW.find((item: any) => item.kw >= kw);

        if (!switchgear) {
          return {
            tag_number,
            vfd: "",
            breaker_fuse: "",
            fuse_holder: "",
            contractor_main: "",
            contractor_star: "",
            contractor_delta: "",
            overlay_relay: "",
            terminal_part_no: "",
          };
        }

        // Handling pair of starters like "VFD BYPASS-S/D", "VFD Bypass DOL"
        let pair_starter_options: any[] = [];

        if (
          starter_type === "VFD BYPASS-S/D" ||
          starter_type === "VFD Bypass DOL"
        ) {
          const obj = swData?.find((item: any) => !item.make.includes("VFD")); // Finding switchgear make from payload
          const targetStarterType =
            starter_type === "VFD BYPASS-S/D" ? "STAR-DELTA" : "DOL STARTER";

          pair_starter_options =
            division === "HEATING"
              ? switchgear_database.filter(
                  (item: any) =>
                    item.make === obj.make &&
                    item.sg_select === sw_type &&
                    item.starter_type === targetStarterType &&
                    item.unit_7 === starting_time.split(" ")[0] + " sec"
                )
              : switchgear_database.filter(
                  (item: any) =>
                    item.make === obj.make &&
                    item.sg_select === sw_type &&
                    item.starter_type === targetStarterType
                );
        }

        const sortedByKWforPairStarter = pair_starter_options?.sort(
          (a: any, b: any) => a.kw - b.kw
        );
        const switchgearForPairStarter = sortedByKWforPairStarter?.find(
          (item: any) => item.kw >= kw
        );

        return {
          tag_number,
          vfd: switchgear.vfd_model || "",
          breaker_fuse:
            switchgearForPairStarter?.breaker ?? switchgear?.breaker ?? "",
          fuse_holder:
            switchgearForPairStarter?.fuse_holder ??
            switchgear.fuse_holder ??
            "",
          contractor_main:
            switchgearForPairStarter?.main_contractor_data ??
            switchgear.main_contractor_data ??
            "",
          contractor_star:
            switchgearForPairStarter?.star_contractor ??
            switchgear.star_contractor ??
            "",
          contractor_delta: switchgearForPairStarter?.main_contractor_data
            ? switchgearForPairStarter?.main_contractor_data
            : starter_type === "STAR-DELTA"
            ? switchgear.main_contractor_data
            : "",
          overlay_relay:
            switchgearForPairStarter?.overload_relay ??
            switchgear.overload_relay ??
            "",
          terminal_part_no: switchgear.terminal_part_no || "",
          unit_2: switchgearForPairStarter?.unit_2 ?? switchgear?.unit_2,
          unit_3: switchgearForPairStarter?.unit_3 ?? switchgear?.unit_3,
          unit_4: switchgearForPairStarter?.unit_4 ?? switchgear?.unit_4,
          unit_5: switchgearForPairStarter?.unit_5 ?? switchgear?.unit_5,
        };
      })
      .filter(Boolean);

    return result;
  };

  const result = getSwitchgearSelection(
    swData,
    database_dol_htr,
    switchgear_database,
    database_vfd,
    database_soft_starter,
    database_supply_feeder,
    division
  );
  return result;
};

import { Workbook, Worksheet, Cell, ValueType } from "exceljs";
import axios from "axios";

class ExcelTemplateProcessor {
  private workbook: Workbook | null;
  private worksheet: Worksheet | null;
  private calcChain: Map<string, Cell>;

  constructor() {
    this.workbook = null;
    this.worksheet = null;
    this.calcChain = new Map();
  }

  /**
   * Downloads Excel file from a URL and loads it
   * @param {string} url - URL of the Excel file
   */
  async downloadAndLoadTemplate(url: string): Promise<boolean> {
    try {
      const response = await axios({
        url,
        responseType: "arraybuffer",
      });

      this.workbook = new Workbook();
      await this.workbook.xlsx.load(response.data);
      this.worksheet = this.workbook.worksheets[0];

      // Initialize calculation chain
      this.buildCalcChain();

      return true;
    } catch (error) {
      console.error("Error downloading or loading template:", error);
      throw error;
    }
  }

  /**
   * Build a calculation chain of all formula cells
   */
  private buildCalcChain(): void {
    if (!this.worksheet) return;

    this.calcChain.clear();
    this.worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.formula) {
          this.calcChain.set(cell.address, cell);
        }
      });
    });
  }

  /**
   * Recalculate all formulas in the worksheet
   */
  private recalculateFormulas(): void {
    if (!this.worksheet) return;

    // Force recalculation of all formula cells
    this.calcChain.forEach((cell: any) => {
      if (cell.formula) {
        // Store the original formula
        const formula = cell.formula;
        // Clear and reset the formula to trigger recalculation
        cell.formula = formula;
      }
    });
  }

  /**
   * Sets multiple values in cells and recalculates
   * @param {Record<string, number>} values - Object with cell addresses and values
   */
  setMultipleCellValues(values: Record<string, number>): void {
    if (!this.worksheet) {
      throw new Error("No worksheet loaded");
    }

    Object.entries(values).forEach(([address, value]) => {
      const cell = this.worksheet!.getCell(address);
      cell.value = value;
    });

    // Trigger recalculation after setting all values
    this.recalculateFormulas();
  }

  /**
   * Sets a value in a specific cell
   * @param {string} cellAddress - Cell address (e.g., 'A1')
   * @param {number} value - Value to set
   */
  setCellValue(cellAddress: string, value: number): void {
    if (!this.worksheet) {
      throw new Error("No worksheet loaded");
    }

    const cell = this.worksheet.getCell(cellAddress);
    cell.value = value;

    // Trigger recalculation after setting value
    // this.recalculateFormulas();
  }

  /**
   * Gets the calculated value from a cell
   * @param {string} cellAddress - Cell address (e.g., 'A1')
   * @returns {number | null} Calculated cell value
   */
  getCellValue(cellAddress: string): number | null {
    if (!this.worksheet) {
      throw new Error("No worksheet loaded");
    }

    const cell = this.worksheet.getCell(cellAddress);
    const g38 = this.worksheet.getCell("G38");
    const g39 = this.worksheet.getCell("G39");
    const g40 = this.worksheet.getCell("G40");
    if (cellAddress === "G40") {
      // return D40 + "NOS" + D38 +
    }
    if (cell.formula) {
      // For formula cells, we want to ensure we get the latest calculated value
      return (cell.result as number) || null;
    }

    return (cell.value as number) || null;
  }

  /**
   * Save the modified workbook
   * @param {string} filename - Output filename
   */
  async saveWorkbook(filename: string): Promise<void> {
    if (!this.workbook) {
      throw new Error("No workbook loaded");
    }

    // Final recalculation before saving
    this.recalculateFormulas();
    await this.workbook.xlsx.writeFile(filename);
  }

  /**
   * Get all formulas in the worksheet
   * @returns {Record<string, string>} Map of cell addresses to their formulas
   */
  getFormulas(): Record<string, string> {
    if (!this.worksheet) {
      throw new Error("No worksheet loaded");
    }

    const formulas: Record<string, string> = {};

    this.worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell((cell) => {
        if (cell.formula) {
          formulas[cell.address] = cell.formula;
        }
      });
    });

    return formulas;
  }
}

// Example usage with formula recalculation:
export const getBusbarSizingCalculations = async (): Promise<void> => {
  const processor = new ExcelTemplateProcessor();

  try {
    // Download and load the template
    const url = `https://enaibot.frappe.cloud/files/Busbar%20Calculations.xlsm`;
    await processor.downloadAndLoadTemplate(url);

    // Option 1: Set values individually
    processor.setCellValue("D38", 10);
    processor.setCellValue("D39", 20);
    processor.setCellValue("D40", 30);

    // Option 2: Set multiple values at once (more efficient)
    // processor.setMultipleCellValues({
    //   D38: 10,
    //   D39: 20,
    //   D40: 30,
    // });

    // Get calculated value from formula cells
    const result = processor.getCellValue("G40");
    // console.log("Calculated Result:", result);

    // You can get multiple results
    const results = {
      g40: processor.getCellValue("G40"),
      g41: processor.getCellValue("G41"),
      // add other cells as needed
    };
    // console.log("All Results:", results);

    await processor.saveWorkbook("calculated_output.xlsx");
  } catch (error) {
    console.error("Error processing template:", error);
  }
};
