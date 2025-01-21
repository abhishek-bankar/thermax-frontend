import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  CABLE_TRAY_LAYOUT,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  DESIGN_BASIS_GENERAL_INFO_API,
  DESIGN_BASIS_REVISION_HISTORY_API,
  DYNAMIC_DOCUMENT_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  GA_REVISIONS_API,
  LAYOUT_EARTHING,
  LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
  LOCAL_ISOLATOR_REVISION_HISTORY_API,
  MAKE_OF_COMPONENT_API,
  MCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  MCC_PCC_PLC_PANEL_3,
  MOTOR_CANOPY_REVISION_HISTORY_API,
  MOTOR_PARAMETER_API,
  MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
  PANEL_SPEC_REVISIONS_API,
  PCC_PANEL,
  PROJECT_API,
  PROJECT_INFO_API,
  PROJECT_MAIN_PKG_API,
  PROJECT_PANEL_API,
  SLD_REVISIONS_API,
  STATIC_DOCUMENT_API,
} from "@/configs/api-endpoints";
import { deleteData, getData } from "../crud-actions";

export const deleteProjectInformation = async (project_id: string) => {
  try {
    const res = await deleteData(`${PROJECT_INFO_API}/${project_id}`, false);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const deleteStaticDocumentList = async (project_id: string) => {
  try {
    const res = await deleteData(`${STATIC_DOCUMENT_API}/${project_id}`, false);
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const deleteLoadListRevisions = async (project_id: string) => {
  try {
    const electricalLoadListRevisionHistory = await getData(
      `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["name"]`
    );
    for (const revision of electricalLoadListRevisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteCableScheduleRevisions = async (project_id: string) => {
  try {
    const cableScheduleRevisionHistory = await getData(
      `${CABLE_SCHEDULE_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["name"]`
    );
    for (const revision of cableScheduleRevisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteMotorCanopyRevisions = async (project_id: string) => {
  try {
    const motorCanopyRevisionHistory = await getData(
      `${MOTOR_CANOPY_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["name"]`
    );
    for (const revision of motorCanopyRevisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(
        `${MOTOR_CANOPY_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteMotorSpecificationRevisions = async (project_id: string) => {
  try {
    const motorSpecificationsRevisionHistory = await getData(
      `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["name"]`
    );
    for (const revision of motorSpecificationsRevisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(
        `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteLPBSSpecificationRevisions = async (project_id: string) => {
  try {
    const lbpsSpecificationsRevisionHistory = await getData(
      `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["name"]`
    );
    for (const revision of lbpsSpecificationsRevisionHistory || []) {
      const revisionID = revision.name;

      await deleteData(
        `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteLocalIsolatorRevisions = async (project_id: string) => {
  try {
    const localIsolatorRevisionHistory = await getData(
      `${LOCAL_ISOLATOR_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["name"]`
    );
    for (const revision of localIsolatorRevisionHistory || []) {
      const revisionID = revision.name;
      await deleteData(
        `${LOCAL_ISOLATOR_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDesignBasisGeneralInfo = async (revision_id: string) => {
  try {
    const designBasisGeneralInfo = await getData(
      `${DESIGN_BASIS_GENERAL_INFO_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );

    for (const dbGeneralInfo of designBasisGeneralInfo || []) {
      const dbGeneralInfoID = dbGeneralInfo.name;
      await deleteData(
        `${DESIGN_BASIS_GENERAL_INFO_API}/${dbGeneralInfoID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteProjectMainPackage = async (revision_id: string) => {
  try {
    const projectMainPackage = await getData(
      `${PROJECT_MAIN_PKG_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const projectMainPkg of projectMainPackage || []) {
      const projectMainPkgID = projectMainPkg.name;
      await deleteData(`${PROJECT_MAIN_PKG_API}/${projectMainPkgID}`, false);
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteDesignBasisMotorParameters = async (revision_id: string) => {
  try {
    const motorParameters = await getData(
      `${MOTOR_PARAMETER_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const motorParameter of motorParameters || []) {
      const motorParameterID = motorParameter.name;
      await deleteData(`${MOTOR_PARAMETER_API}/${motorParameterID}`, false);
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteDesignBasisMakeofComponent = async (revision_id: string) => {
  try {
    const makeOfComponents = await getData(
      `${MAKE_OF_COMPONENT_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const makeOfComponent of makeOfComponents || []) {
      const makeOfComponentID = makeOfComponent.name;
      await deleteData(`${MAKE_OF_COMPONENT_API}/${makeOfComponentID}`, false);
    }
  } catch (error) {
    throw error;
  }
};

export const deleteCommonConfiguration = async (revision_id: string) => {
  try {
    const commonConfigurations1 = await getData(
      `${COMMON_CONFIGURATION_1}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    const commonConfigurations2 = await getData(
      `${COMMON_CONFIGURATION_2}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    const commonConfigurations3 = await getData(
      `${COMMON_CONFIGURATION_3}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const commonConfiguration of commonConfigurations1 || []) {
      const commonConfigurationID = commonConfiguration.name;
      await deleteData(
        `${COMMON_CONFIGURATION_1}/${commonConfigurationID}`,
        false
      );
    }
    for (const commonConfiguration of commonConfigurations2 || []) {
      const commonConfigurationID = commonConfiguration.name;
      await deleteData(
        `${COMMON_CONFIGURATION_2}/${commonConfigurationID}`,
        false
      );
    }
    for (const commonConfiguration of commonConfigurations3 || []) {
      const commonConfigurationID = commonConfiguration.name;
      await deleteData(
        `${COMMON_CONFIGURATION_3}/${commonConfigurationID}`,
        false
      );
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteMCCPanels = async (revision_id: string) => {
  try {
    // Delete all MCC Panel Data
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      const mccPanel = await getData(
        `${MCC_PANEL}?filters=[["panel_id", "=", "${panel_id}"]]`
      );
      if (Array.isArray(mccPanel) && mccPanel.length > 0) {
        await deleteData(`${MCC_PANEL}/${mccPanel?.[0]?.name}`, false);
      }
    }
  } catch (error: any) {
    throw error;
  }
};

export const deletePCCPanels = async (revision_id: string) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      const pccPanel = await getData(
        `${PCC_PANEL}?filters=[["panel_id", "=", "${panel_id}"]]`
      );
      if (Array.isArray(pccPanel) && pccPanel.length > 0) {
        await deleteData(`${PCC_PANEL}/${pccPanel?.[0]?.name}`, false);
      }
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteMccCumPCCPLCPanels = async (revision_id: string) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );

    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
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
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteCableTrayLayout = async (revision_id: string) => {
  try {
    const cableTrayLayoutData = await getData(
      `${CABLE_TRAY_LAYOUT}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const cableTrayLayout of cableTrayLayoutData || []) {
      const cableTrayLayoutID = cableTrayLayout.name;
      await deleteData(`${CABLE_TRAY_LAYOUT}/${cableTrayLayoutID}`, false);
    }
  } catch (error) {
    throw error;
  }
};

export const deleteLayoutEarthing = async (revision_id: string) => {
  try {
    const earthingLayoutData = await getData(
      `${LAYOUT_EARTHING}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const earthingLayout of earthingLayoutData || []) {
      const earthingLayoutID = earthingLayout.name;
      await deleteData(`${LAYOUT_EARTHING}/${earthingLayoutID}`, false);
    }
  } catch (error) {
    throw error;
  }
};

export const deleteSLDRevisions = async (revision_id: string) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      const sldRevisionHistory = await getData(
        `${SLD_REVISIONS_API}?filters=[["panel_id", "=", "${panel_id}"]]&fields=["name"]`
      );
      for (const sldRevision of sldRevisionHistory || []) {
        const sldRevisionID = sldRevision.name;
        await deleteData(`${SLD_REVISIONS_API}/${sldRevisionID}`, false);
      }
    }
  } catch (error) {
    throw error;
  }
};

export const deletePanelSpecificationsRevisions = async (
  revision_id: string
) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      const revisionHistory = await getData(
        `${PANEL_SPEC_REVISIONS_API}?filters=[["panel_id", "=", "${panel_id}"]]&fields=["name"]`
      );
      for (const revision of revisionHistory || []) {
        const revisionID = revision.name;
        await deleteData(`${PANEL_SPEC_REVISIONS_API}/${revisionID}`, false);
      }
    }
  } catch (error) {
    throw error;
  }
};

export const deletePanelGARevisions = async (revision_id: string) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      const revisionHistory = await getData(
        `${GA_REVISIONS_API}?filters=[["panel_id", "=", "${panel_id}"]]&fields=["name"]`
      );
      for (const revision of revisionHistory || []) {
        const revisionID = revision.name;
        await deleteData(`${GA_REVISIONS_API}/${revisionID}`, false);
      }
    }
  } catch (error) {
    throw error;
  }
};

export const deleteDynamicDocumentList = async (revision_id: string) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      await deleteData(`${DYNAMIC_DOCUMENT_API}/${panel_id}`, false);
    }
  } catch (error) {
    throw error;
  }
};

export const deleteProjectPanelData = async (revision_id: string) => {
  try {
    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["name"]`
    );
    for (const projectPanel of projectPanelData || []) {
      const panel_id = projectPanel.name;
      await deleteData(`${PROJECT_PANEL_API}/${panel_id}`, false);
    }
  } catch (error) {
    throw error;
  }
};

export const deleteProject = async (project_id: string) => {
  try {
    await deleteData(`${PROJECT_API}/${project_id}`, false);
  } catch (error) {
    throw error;
  }
};

export const deleteDesignBasisRevisionHistory = async (revision_id: string) => {
  try {
    await deleteData(
      `${DESIGN_BASIS_REVISION_HISTORY_API}/${revision_id}`,
      false
    );
  } catch (error) {
    throw error;
  }
};
