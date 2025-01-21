"use server";
import {
  MCC_PANEL_TYPE,
  MCCcumPCC_PANEL_TYPE,
  PCC_PANEL_TYPE,
  SLD_REVISION_STATUS,
} from "@/configs/constants";
import {
  createMccCumPccPLCPanelData,
  createMCCPanel,
  createPanelGARevisions,
  createPanelSpecificationsRevisions,
  createPCCPanel,
  createProjectPanelData,
  createSLDRevisions,
} from "./create";
import {
  deleteDynamicDocumentList,
  deleteMccCumPCCPLCPanels,
  deleteMCCPanels,
  deletePCCPanels,
  deleteProjectPanelData,
} from "./delete";
import { deleteData } from "../crud-actions";
import {
  DYNAMIC_DOCUMENT_API,
  MCC_PANEL,
  PCC_PANEL,
} from "@/configs/api-endpoints";

export const createDynamicPanel = async (panelData: any) => {
  try {
    const { panel_main_type: panelType, revision_id } = panelData;
    // Create Project Panel Data with DB Revision ID
    const panelRes = await createProjectPanelData(panelData);
    const { name: panel_id, panel_name } = panelRes;
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

export const deleteDynamicPanel = async (revisionID: string) => {
  try {
    // Delete Dynamic Document List
    await deleteDynamicDocumentList(revisionID);
    // Delete MCC Panel Data
    await deleteMCCPanels(revisionID);
    // Delete PCC Panel Data
    await deletePCCPanels(revisionID);
    // Delete all MCC_PCC_PLC_PANEL Data
    await deleteMccCumPCCPLCPanels(revisionID);
    // Delete Project Panel Data
    await deleteProjectPanelData(revisionID);
  } catch (error) {
    throw error;
  }
};

export const deleteIndividualPanel = async (panel_id: string) => {
  try {
    await deleteData(`${DYNAMIC_DOCUMENT_API}/${panel_id}`, false);
    await deleteData(`${MCC_PANEL}/${panel_id}`, false);
    await deleteData(`${PCC_PANEL}/${panel_id}`, false);
  } catch (error) {
    throw error;
  }
};
