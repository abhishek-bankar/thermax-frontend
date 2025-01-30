import {
  PROJECT_API,
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
  PROJECT_MAIN_PKG_API,
  MOTOR_PARAMETER_API,
  MAKE_OF_COMPONENT_API,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  CABLE_TRAY_LAYOUT,
  LAYOUT_EARTHING,
  APPROVER_EMAIL_NOTIFICATION_API,
  PROJECT_PANEL_API,
  DYNAMIC_DOCUMENT_API,
  MCC_PANEL,
  PCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  MCC_PCC_PLC_PANEL_3,
  SLD_REVISIONS_API,
  GA_REVISIONS_API,
  PANEL_SPECS_REVISIONS_API,
  CABLE_TRAY_REVISION_HISTORY_API,
  TRCC_PANEL, 
} from "@/configs/api-endpoints";
import { createData } from "../crud-actions";

export const createProject = async (data: any) => {
  try {
    const res = await createData(PROJECT_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createProjectInformation = async (data: any) => {
  try {
    const res = await createData(PROJECT_INFO_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createStaticDocumentList = async (data: any) => {
  try {
    const res = await createData(STATIC_DOCUMENT_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createLoadListRevisions = async (data: any) => {
  try {
    const res = await createData(
      ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createCableScheduleRevisions = async (data: any) => {
  try {
    const res = await createData(
      CABLE_SCHEDULE_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createMotorCanopyRevisions = async (data: any) => {
  try {
    const res = await createData(
      MOTOR_CANOPY_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createMotorSpecificationRevisions = async (data: any) => {
  try {
    const res = await createData(
      MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createLPBSSpecificationRevisions = async (data: any) => {
  try {
    const res = await createData(
      LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createLocalIsolatorRevisions = async (data: any) => {
  try {
    const res = await createData(
      LOCAL_ISOLATOR_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createCableTrayRevisions = async (data: any) => {
  try {
    const res = await createData(
      CABLE_TRAY_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createDesignBasisRevisionHistory = async (data: any) => {
  try {
    const res = await createData(
      DESIGN_BASIS_REVISION_HISTORY_API,
      false,
      data
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createDesignBasisGeneralInfo = async (data: any) => {
  try {
    const res = await createData(DESIGN_BASIS_GENERAL_INFO_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createProjectMainPackage = async (data: any) => {
  try {
    const res = await createData(PROJECT_MAIN_PKG_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createDesignBasisMotorParameters = async (data: any) => {
  try {
    const res = await createData(MOTOR_PARAMETER_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createDesignBasisMakeofComponent = async (data: any) => {
  try {
    const res = await createData(MAKE_OF_COMPONENT_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createCommonConfiguration = async (data: any) => {
  try {
    const res1 = await createData(COMMON_CONFIGURATION_1, false, data);
    const res2 = await createData(COMMON_CONFIGURATION_2, false, data);
    const res3 = await createData(COMMON_CONFIGURATION_3, false, data);
    const res = { res1, res2, res3 };
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createCableTrayLayout = async (data: any) => {
  try {
    const res = await createData(CABLE_TRAY_LAYOUT, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createLayoutEarthing = async (data: any) => {
  try {
    const res = await createData(LAYOUT_EARTHING, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const creatProjectMainPackage = async (data: any) => {
  try {
    const res = await createData(`${PROJECT_MAIN_PKG_API}`, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createProjectPanelData = async (data: any) => {
  try {
    const res = await createData(PROJECT_PANEL_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createDynamicDocumentList = async (data: any) => {
  try {
    const res = await createData(DYNAMIC_DOCUMENT_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createMCCPanel = async (data: any) => {
  try {
    const res = await createData(MCC_PANEL, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};
export const createTRCCPanel = async (data: any) => {
  try {
    const res = await createData(TRCC_PANEL, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createPCCPanel = async (data: any) => {
  try {
    const res = await createData(PCC_PANEL, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createMccCumPccPLCPanelData = async (data: any) => {
  try {
    const res1 = await createData(MCC_PCC_PLC_PANEL_1, false, data);
    const res2 = await createData(MCC_PCC_PLC_PANEL_2, false, data);
    const res3 = await createData(MCC_PCC_PLC_PANEL_3, false, data);
    const res = { res1, res2, res3 };
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createSLDRevisions = async (data: any) => {
  try {
    const res = await createData(SLD_REVISIONS_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createPanelGARevisions = async (data: any) => {
  try {
    const res = await createData(GA_REVISIONS_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const createPanelSpecificationsRevisions = async (data: any) => {
  try {
    const res = await createData(PANEL_SPECS_REVISIONS_API, false, data);
    return res;
  } catch (error: any) {
    throw error;
  }
};
