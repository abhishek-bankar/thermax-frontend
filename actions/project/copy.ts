import {
  PROJECT_INFO_API,
  STATIC_DOCUMENT_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  MOTOR_CANOPY_REVISION_HISTORY_API,
  MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
  LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
  LOCAL_ISOLATOR_REVISION_HISTORY_API,
  DESIGN_BASIS_REVISION_HISTORY_API,
  DESIGN_BASIS_GENERAL_INFO_API,
  MOTOR_PARAMETER_API,
  MAKE_OF_COMPONENT_API,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  CABLE_TRAY_LAYOUT,
  LAYOUT_EARTHING,
  PROJECT_MAIN_PKG_API,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  MCC_PCC_PLC_PANEL_3,
  MCC_PANEL,
  PCC_PANEL,
  PROJECT_PANEL_API,
  SLD_REVISIONS_API,
  CABLE_TRAY_REVISION_HISTORY_API,
} from "@/configs/api-endpoints";
import {
  DB_REVISION_STATUS,
  MCC_PANEL_TYPE,
  MCCcumPCC_PANEL_TYPE,
  PCC_PANEL_TYPE,
} from "@/configs/constants";
import { createData, getData } from "../crud-actions";
import {
  createProjectInformation,
  createStaticDocumentList,
  createLoadListRevisions,
  createCableScheduleRevisions,
  createMotorCanopyRevisions,
  createMotorSpecificationRevisions,
  createLPBSSpecificationRevisions,
  createLocalIsolatorRevisions,
  createDesignBasisRevisionHistory,
  createDesignBasisGeneralInfo,
  createDesignBasisMotorParameters,
  createDesignBasisMakeofComponent,
  createCommonConfiguration,
  createCableTrayLayout,
  createLayoutEarthing,
  creatProjectMainPackage,
  createMCCPanel,
  createPCCPanel,
  createMccCumPccPLCPanelData,
  createDynamicDocumentList,
  createProjectPanelData,
  createSLDRevisions,
  createPanelGARevisions,
  createPanelSpecificationsRevisions,
  createCableTrayRevisions,
} from "./create";

export const copyProjectInformation = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldData = await getData(`${PROJECT_INFO_API}/${oldProjectId}`);
    const newData = await createProjectInformation({
      ...oldData,
      project_id: newProjectId,
    });
    return newData;
  } catch (error: any) {
    throw error;
  }
};

export const copyStaticDocumentList = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldData = await getData(`${STATIC_DOCUMENT_API}/${oldProjectId}`);
    const newData = await createStaticDocumentList({
      ...oldData,
      project_id: newProjectId,
    });
    return newData;
  } catch (error: any) {
    throw error;
  }
};

export const copyLoadListRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createLoadListRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyCableScheduleRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${CABLE_SCHEDULE_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createCableScheduleRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyMotorCanopyRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${MOTOR_CANOPY_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${MOTOR_CANOPY_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createMotorCanopyRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyMotorSpecificationRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createMotorSpecificationRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyLPBSSpecificationRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createLPBSSpecificationRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyLocalIsolatorRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${LOCAL_ISOLATOR_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${LOCAL_ISOLATOR_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createLocalIsolatorRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};
export const copyCableTrayRevisions = async (
  oldProjectId: string,
  newProjectId: string
) => {
  try {
    const oldDataRes = await getData(
      `${CABLE_TRAY_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["name"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldRevisionId = oldData.name;
    const newData = await getData(
      `${CABLE_TRAY_REVISION_HISTORY_API}/${oldRevisionId}`
    );
    await createCableTrayRevisions({
      ...newData,
      project_id: newProjectId,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyDesignBasisRevisionHistory = async (
  oldProjectId: any,
  newProjectId: any,
  approverEmail: any
) => {
  try {
    const oldDataRes = await getData(
      `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["*"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldDBRevisionID = oldData.name;
    const newData = await createDesignBasisRevisionHistory({
      ...oldData,
      status: DB_REVISION_STATUS.Unsubmitted,
      project_id: newProjectId,
      approverEmail,
      oldDBRevisionID,
    });
    return newData;
  } catch (error: any) {
    throw error;
  }
};

export const copyDesignBasisGeneralInfo = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const oldDataRes = await getData(
      `${DESIGN_BASIS_GENERAL_INFO_API}/?filters=[["revision_id", "=", "${oldDBRevisionID}"]]&fields=["*"]`
    );
    const oldData = oldDataRes[0];
    await createDesignBasisGeneralInfo({
      ...oldData,
      revision_id: newDBRevisionID,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyDesignBasisMotorParameters = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const oldDataRes = await getData(
      `${MOTOR_PARAMETER_API}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const oldData = oldDataRes[0];
    await createDesignBasisMotorParameters({
      ...oldData,
      revision_id: newDBRevisionID,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyDesignBasisMakeofComponent = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const oldDataRes = await getData(
      `${MAKE_OF_COMPONENT_API}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const oldData = oldDataRes[0];
    await createDesignBasisMakeofComponent({
      ...oldData,
      revision_id: newDBRevisionID,
    });
  } catch (error: any) {
    throw error;
  }
};

export const copyCommonConfiguration = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const commonConfigData1Res = await getData(
      `${COMMON_CONFIGURATION_1}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const commonConfigData1 = commonConfigData1Res[0];

    const commonConfigData2Res = await getData(
      `${COMMON_CONFIGURATION_2}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const commonConfigData2 = commonConfigData2Res[0];

    const commonConfigData3Res = await getData(
      `${COMMON_CONFIGURATION_3}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const commonConfigData3 = commonConfigData3Res[0];

    const commonConfigData = {
      ...commonConfigData1,
      ...commonConfigData2,
      ...commonConfigData3,
    };

    await createCommonConfiguration({
      ...commonConfigData,
      revision_id: newDBRevisionID,
    });
  } catch (error) {
    throw error;
  }
};

export const copyCableTrayLayout = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const oldDataRes = await getData(
      `${CABLE_TRAY_LAYOUT}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const oldData = oldDataRes[0];
    await createCableTrayLayout({
      ...oldData,
      revision_id: newDBRevisionID,
    });
  } catch (error) {
    throw error;
  }
};

export const copyLayoutEarthing = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const oldDataRes = await getData(
      `${LAYOUT_EARTHING}?fields=["*"]&filters=[["revision_id", "=", "${oldDBRevisionID}"]]`
    );
    const oldData = oldDataRes[0];
    await createLayoutEarthing({
      ...oldData,
      revision_id: newDBRevisionID,
    });
  } catch (error) {
    throw error;
  }
};

export const copyProjectMainPackage = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const oldDataRes = await getData(
      `${PROJECT_MAIN_PKG_API}?filters=[["revision_id", "=", "${oldDBRevisionID}"]]&fields=["*"]`
    );

    for (const projectMainPkg of oldDataRes || []) {
      const mainPkgId = projectMainPkg.name;
      const mainPkgData = await getData(`${PROJECT_MAIN_PKG_API}/${mainPkgId}`);
      await creatProjectMainPackage({
        ...mainPkgData,
        revision_id: newDBRevisionID,
      });
    }
  } catch (error: any) {
    throw error;
  }
};

export const copyDynamicDocumentList = async (
  oldPanelId: string,
  newPanelId: string
) => {
  try {
    const oldDataRes = await getData(
      `${MCC_PANEL}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
    );
    const oldData = oldDataRes[0];
    await createDynamicDocumentList({ ...oldData, panel_id: newPanelId });
  } catch (error: any) {
    throw error;
  }
};

export const copyMCCPanel = async (oldPanelId: string, newPanelId: string) => {
  try {
    const oldMCCPanelRes = await getData(
      `${MCC_PANEL}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
    );
    const oldMCCPanelData = oldMCCPanelRes[0];
    await createMCCPanel({ ...oldMCCPanelData, panel_id: newPanelId });
  } catch (error: any) {
    throw error;
  }
};

export const copyPCCPanel = async (oldPanelId: string, newPanelId: string) => {
  try {
    const oldPCCPanelRes = await getData(
      `${PCC_PANEL}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
    );
    const oldPCCPanelData = oldPCCPanelRes[0];
    await createPCCPanel({ ...oldPCCPanelData, panel_id: newPanelId });
  } catch (error: any) {
    throw error;
  }
};

export const copyMccCumPccPLCPanelData = async (
  oldPanelId: string,
  newPanelId: string
) => {
  // Copy PLC Panel Data under MCC cum PCC PLC Panel Data
  const mccPccPlcPanel1Res = await getData(
    `${MCC_PCC_PLC_PANEL_1}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
  );
  const mccPccPlcPanel1Data = mccPccPlcPanel1Res[0];

  const mccPccPlcPanel2Res = await getData(
    `${MCC_PCC_PLC_PANEL_2}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
  );
  const mccPccPlcPanel2Data = mccPccPlcPanel2Res[0];

  const mccPccPlcPanel3Res = await getData(
    `${MCC_PCC_PLC_PANEL_3}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
  );
  const mccPccPlcPanel3Data = mccPccPlcPanel3Res[0];

  const mccPccPlcPanelData = {
    ...mccPccPlcPanel1Data,
    ...mccPccPlcPanel2Data,
    ...mccPccPlcPanel3Data,
    panel_id: newPanelId,
  };

  await createMccCumPccPLCPanelData(mccPccPlcPanelData);
};

export const copySLDRevisions = async (
  oldPanelId: string,
  newPanelId: string
) => {
  try {
    const oldSLDRevisionsRes = await getData(
      `${SLD_REVISIONS_API}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
    );
    const oldSLDRevisionsData = oldSLDRevisionsRes[0];
    await createSLDRevisions({ ...oldSLDRevisionsData, panel_id: newPanelId });
  } catch (error) {
    throw error;
  }
};

export const copyPanelGARevisions = async (
  oldPanelId: string,
  newPanelId: string
) => {
  try {
    const revisionsRes = await getData(
      `${SLD_REVISIONS_API}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
    );
    const revisionsData = revisionsRes[0];
    await createPanelGARevisions({
      ...revisionsData,
      panel_id: newPanelId,
    });
  } catch (error) {
    throw error;
  }
};

export const copyPanelSpecificationsRevisions = async (
  oldPanelId: string,
  newPanelId: string
) => {
  try {
    const revisionsRes = await getData(
      `${SLD_REVISIONS_API}?filters=[["panel_id", "=", "${oldPanelId}"]]&fields=["*"]`
    );
    const revisionsData = revisionsRes[0];
    await createPanelSpecificationsRevisions({
      ...revisionsData,
      panel_id: newPanelId,
    });
  } catch (error) {
    throw error;
  }
};

export const copyProjectDynamicPanels = async (
  oldDBRevisionID: string,
  newDBRevisionID: string
) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${oldDBRevisionID}"]]&fields=["*"]`
    );

    for (const projectPanel of projectPanelData || []) {
      const { name: oldPanelId, panel_main_type } = projectPanel;
      const createPanelData = await createProjectPanelData({
        ...projectPanel,
        revision_id: newDBRevisionID,
      });
      const { name: newPanelId } = createPanelData;

      // Create Dynamic Document List
      await copyDynamicDocumentList(oldPanelId, newPanelId);

      // Copy MCC Panel
      if (panel_main_type === MCC_PANEL_TYPE) {
        await copyMCCPanel(oldPanelId, newPanelId);
      }

      // Copy PCC Panel
      if (panel_main_type === PCC_PANEL_TYPE) {
        await copyPCCPanel(oldPanelId, newPanelId);
      }

      // Copy MCC cum PCC PLC Panel Data
      if (panel_main_type === MCCcumPCC_PANEL_TYPE) {
        // Copy MCC Panel Data under MCC cum PCC PLC Panel Data
        await copyMCCPanel(oldPanelId, newPanelId);
        // Copy PLC Panel Data under MCC cum PCC PLC Panel Data
        await copyMccCumPccPLCPanelData(oldPanelId, newPanelId);
      }

      // Copy SLD Revisions
      await copySLDRevisions(oldPanelId, newPanelId);
      // Copy Panel GA Revisions
      await copyPanelGARevisions(oldPanelId, newPanelId);
      // Copy Panel Specifications Revisions
      await copyPanelSpecificationsRevisions(oldPanelId, newPanelId);
    }
  } catch (error: any) {
    throw error;
  }
};
