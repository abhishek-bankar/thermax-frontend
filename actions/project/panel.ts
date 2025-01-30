"use server";
import {
  MCC_PANEL_TYPE,
  MCCcumPCC_PANEL_TYPE,
  PCC_PANEL_TYPE,
  SLD_REVISION_STATUS,
  TRCC_PANEL_TYPE,
} from "@/configs/constants";
import {
  createDynamicDocumentList,
  createMccCumPccPLCPanelData,
  createMCCPanel,
  createPanelGARevisions,
  createPanelSpecificationsRevisions,
  createPCCPanel,
  createProjectPanelData,
  createSLDRevisions,
  createTRCCPanel,
} from "./create";
import {
  deleteDynamicDocumentList,
  deleteMccCumPCCPLCPanels,
  deleteMCCPanels,
  deletePCCPanels,
  deleteProjectPanelData,
} from "./delete";
import { deleteData, getData } from "../crud-actions";
import {
  DYNAMIC_DOCUMENT_API,
  GA_REVISIONS_API,
  MCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  MCC_PCC_PLC_PANEL_3, 
  PANEL_SPECS_REVISIONS_API, 
  PCC_PANEL,
  PROJECT_PANEL_API,
  SLD_REVISIONS_API,
  TRCC_PANEL,
} from "@/configs/api-endpoints";

export const createDynamicPanel = async (panelData: any) => {
  try {
    const { panel_main_type: panelType, revision_id } = panelData;
    // Create Project Panel Data with DB Revision ID
    const panelRes = await createProjectPanelData(panelData);
    const { name: panel_id, panel_name } = panelRes;
    await createDynamicDocumentList({ panel_id });
    // Create MCC Panel with Project Panel ID
    if (panelType === MCC_PANEL_TYPE) {
      await createMCCPanel({ panel_id });
    }
    // Create PCC Panel with Project Panel ID
    if (panelType === PCC_PANEL_TYPE) {
      await createPCCPanel({ panel_id });
    }
    // Create PLC 1 2 3 with Project Panel ID
    if (panelType === MCCcumPCC_PANEL_TYPE) {
      await createMCCPanel({ panel_id });
      await createMccCumPccPLCPanelData({ panel_id });
    }
    if (panelType === TRCC_PANEL_TYPE) {
      await createTRCCPanel({ panel_id });
    }

    const sld_data = {
      panel_id,
      panel_name,
      status: SLD_REVISION_STATUS.DEFAULT,
      description: "Issued for approval",
    };
    // Create SLD Revisions
    await createSLDRevisions(sld_data);
    // Create Panel GA Revisions
    await createPanelGARevisions(sld_data);
    // Create Panel Specifications Revisions
    await createPanelSpecificationsRevisions(sld_data);
  } catch (error) {
    throw error;
  }
};

export const deleteDynamicPanel = async (panel_id: string) => {
  try {
    // Delete Dynamic Document List
    await deleteData(`${DYNAMIC_DOCUMENT_API}/${panel_id}`, false);
    // Delete MCC Panel Data
    const mccPanel = await getData(
      `${MCC_PANEL}?filters=[["panel_id", "=", "${panel_id}"]]`
    );
    if (Array.isArray(mccPanel) && mccPanel.length > 0) {
      await deleteData(`${MCC_PANEL}/${mccPanel?.[0]?.name}`, false);
    }
    // Delete TRCC Panel Data 
    const trccPanel = await getData(
      `${TRCC_PANEL}?filters=[["panel_id", "=", "${panel_id}"]]`
    )
    if (Array.isArray(trccPanel) && trccPanel.length > 0) {
      await deleteData(`${TRCC_PANEL}/${trccPanel?.[0]?.name}`, false);
    }
    // Delete PCC Panel Data
    const pccPanel = await getData(
      `${PCC_PANEL}?filters=[["panel_id", "=", "${panel_id}"]]`
    );
    if (Array.isArray(pccPanel) && pccPanel.length > 0) {
      await deleteData(`${PCC_PANEL}/${pccPanel?.[0]?.name}`, false);
    }
    // Delete all MCC_PCC_PLC_PANEL Data
    const mccPccPlcPanel1 = await getData(
      `${MCC_PCC_PLC_PANEL_1}?filters=[["panel_id", "=", "${panel_id}"]]`
    );
    if (Array.isArray(mccPccPlcPanel1) && mccPccPlcPanel1.length > 0) {
      await deleteData(
        `${MCC_PCC_PLC_PANEL_1}/${mccPccPlcPanel1?.[0]?.name}`,
        false
      );
    }
    const mccPccPlcPanel2 = await getData(
      `${MCC_PCC_PLC_PANEL_2}?filters=[["panel_id", "=", "${panel_id}"]]`
    );
    if (Array.isArray(mccPccPlcPanel2) && mccPccPlcPanel2.length > 0) {
      await deleteData(
        `${MCC_PCC_PLC_PANEL_2}/${mccPccPlcPanel2?.[0]?.name}`,
        false
      );
    }
    const mccPccPlcPanel3 = await getData(
      `${MCC_PCC_PLC_PANEL_3}?filters=[["panel_id", "=", "${panel_id}"]]`
    );
    if (Array.isArray(mccPccPlcPanel3) && mccPccPlcPanel3.length > 0) {
      await deleteData(
        `${MCC_PCC_PLC_PANEL_3}/${mccPccPlcPanel3?.[0]?.name}`,
        false
      );
    }
    // Delete SLD Revisions
    const sldRevisionHistory = await getData(
      `${SLD_REVISIONS_API}?filters=[["panel_id", "=", "${panel_id}"]]&fields=["name"]`
    );
    for (const sldRevision of sldRevisionHistory || []) {
      const sldRevisionID = sldRevision.name;
      await deleteData(`${SLD_REVISIONS_API}/${sldRevisionID}`, false);
    }
    // Delete Panel GA Revisions
    const panelGARevisionHistory = await getData(
      `${GA_REVISIONS_API}?filters=[["panel_id", "=", "${panel_id}"]]&fields=["name"]`
    );
    for (const revision of panelGARevisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(`${GA_REVISIONS_API}/${revisionID}`, false);
    }
    // Delete Panel Specifications Revisions
    const revisionHistory = await getData(
      `${PANEL_SPECS_REVISIONS_API}?filters=[["panel_id", "=", "${panel_id}"]]&fields=["name"]`
    );
    for (const revision of revisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(`${PANEL_SPECS_REVISIONS_API}/${revisionID}`, false);
    }
    // Delete Project Panel Data
    await deleteData(`${PROJECT_PANEL_API}/${panel_id}`, false);
  } catch (error) {
    throw error;
  }
};
