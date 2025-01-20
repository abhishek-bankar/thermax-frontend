"use server";

import {
  PROJECT_INFO_API,
  STATIC_DOCUMENT_API,
  DESIGN_BASIS_REVISION_HISTORY_API,
  DESIGN_BASIS_GENERAL_INFO_API,
  PROJECT_MAIN_PKG_API,
  MOTOR_PARAMETER_API,
  MAKE_OF_COMPONENT_API,
  MCC_PANEL,
  PCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  CABLE_TRAY_LAYOUT,
  LAYOUT_EARTHING,
  PROJECT_PANEL_API,
  DYNAMIC_DOCUMENT_API,
  PROJECT_API,
  APPROVER_EMAIL_NOTIFICATION_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  MOTOR_CANOPY_REVISION_HISTORY_API,
  LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
  LOCAL_ISOLATOR_REVISION_HISTORY_API,
  MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  MCC_PCC_PLC_PANEL_3,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";
import { createData, deleteData, getData } from "./crud-actions";

import {
  createProjectInformation,
  createStaticDocumentList,
  createLoadListRevisions,
  createCableScheduleRevisions,
  createMotorCanopyRevisions,
  createMotorSpecificationRevisions,
  createLPBSSpecificationRevisions,
  createLocalIsolatorRevisions,
  createProject,
  createDesignBasisRevisionHistory,
  createDesignBasisGeneralInfo,
  createCommonConfiguration,
  createDesignBasisMotorParameters,
  createDesignBasisMakeofComponent,
  createCableTrayLayout,
  createLayoutEarthing,
} from "./project/create";
import {
  copyProjectInformation,
  copyStaticDocumentList,
  copyLoadListRevisions,
  copyCableScheduleRevisions,
  copyMotorCanopyRevisions,
  copyMotorSpecificationRevisions,
  copyLPBSSpecificationRevisions,
  copyLocalIsolatorRevisions,
  copyDesignBasisRevisionHistory,
  copyDesignBasisGeneralInfo,
  copyDesignBasisMotorParameters,
  copyDesignBasisMakeofComponent,
  copyCableTrayLayout,
  copyLayoutEarthing,
  copyCommonConfiguration,
  copyProjectMainPackage,
  copyProjectDynamicPanels,
} from "./project/copy";
import {
  deleteCableScheduleRevisions,
  deleteDesignBasisGeneralInfo,
  deleteDesignBasisMakeofComponent,
  deleteDesignBasisMotorParameters,
  deleteLoadListRevisions,
  deleteLocalIsolatorRevisions,
  deleteLPBSSpecificationRevisions,
  deleteMotorCanopyRevisions,
  deleteMotorSpecificationRevisions,
  deleteProjectInformation,
  deleteProjectMainPackage,
  deleteStaticDocumentList,
} from "./project/delete";

export const createThermaxProject = async (projectData: any, userInfo: any) => {
  try {
    // Create Project
    const projectResData = await createProject(projectData);
    const { name: project_id, approver: approver_email } = projectResData;
    // Create Project Information
    await createProjectInformation({ project_id });
    // Create Static Document List
    await createStaticDocumentList({ project_id });
    // Create Load List Revisions
    await createLoadListRevisions({ project_id });
    // Create Cable Schedule Revisions
    await createCableScheduleRevisions({ project_id });
    // Create Motor Canopy Revisions
    await createMotorCanopyRevisions({ project_id });
    // Create Motor Specification Revisions
    await createMotorSpecificationRevisions({ project_id });
    // Create LPBS Specification Revisions
    await createLPBSSpecificationRevisions({ project_id });
    // Create Local Isolator Revisions
    await createLocalIsolatorRevisions({ project_id });

    // Create Design Basis Revision History
    const dbRevisionHistoryData = await createDesignBasisRevisionHistory({
      project_id,
      approver_email,
    });
    const { name: db_revision_id } = dbRevisionHistoryData;

    await createDesignBasisGeneralInfo({ revision_id: db_revision_id });
    await createDesignBasisMotorParameters({ revision_id: db_revision_id });
    await createDesignBasisMakeofComponent({ revision_id: db_revision_id });
    await createCommonConfiguration({ revision_id: db_revision_id });
    await createCableTrayLayout({ revision_id: db_revision_id });
    await createLayoutEarthing({ revision_id: db_revision_id });

    await createData(APPROVER_EMAIL_NOTIFICATION_API, false, {
      approvar_email: projectData?.approver,
      creator_email: userInfo?.email,
      project_oc_number: projectData.project_oc_number,
      project_name: projectData.project_name,
      sent_by: `${userInfo?.first_name} ${userInfo?.last_name}`,
      subject: "Approver - EnIMAX",
    });
    return project_id;
  } catch (error: any) {
    throw error;
  }
};

export const copyThermaxProject = async (
  oldProjectId: string,
  projectData: any,
  userInfo: any
) => {
  try {
    // Create copy of project
    const projectResData = await createProject({
      ...projectData,
      is_complete: 0,
    });
    const { name: newProjectId, approver: approver_email } = projectResData;

    // Create copy of project information
    await copyProjectInformation(oldProjectId, newProjectId);
    // Create copy of static document list
    await copyStaticDocumentList(oldProjectId, newProjectId);
    // Create copy of load list revisions
    await copyLoadListRevisions(oldProjectId, newProjectId);
    // Create copy of cable schedule revisions
    await copyCableScheduleRevisions(oldProjectId, newProjectId);
    // Create copy of motor canopy revisions
    await copyMotorCanopyRevisions(oldProjectId, newProjectId);
    // Create copy of motor specification revisions
    await copyMotorSpecificationRevisions(oldProjectId, newProjectId);
    // Create copy of LPBS specification revisions
    await copyLPBSSpecificationRevisions(oldProjectId, newProjectId);
    // Create copy of local isolator revisions
    await copyLocalIsolatorRevisions(oldProjectId, newProjectId);

    // Create copy of design basis revision history
    const { name: newDBRevisionID, oldDBRevisionID } =
      await copyDesignBasisRevisionHistory(
        oldProjectId,
        newProjectId,
        approver_email
      );
    // Create copy of design basis general information
    await copyDesignBasisGeneralInfo(oldDBRevisionID, newDBRevisionID);
    // Create copy of main package for the project
    await copyProjectMainPackage(oldDBRevisionID, newDBRevisionID);
    // Create copy of design basis motor parameters
    await copyDesignBasisMotorParameters(oldDBRevisionID, newDBRevisionID);
    // Create copy of design basis make of component
    await copyDesignBasisMakeofComponent(oldDBRevisionID, newDBRevisionID);
    // Create copy of common configuration
    await copyCommonConfiguration(oldDBRevisionID, newDBRevisionID);
    // Create copy of cable tray layout
    await copyCableTrayLayout(oldDBRevisionID, newDBRevisionID);
    // Create copy of layout earthing
    await copyLayoutEarthing(oldDBRevisionID, newDBRevisionID);
    // Create copy of dynamic project panels
    await copyProjectDynamicPanels(oldDBRevisionID, newDBRevisionID);

    await createData(APPROVER_EMAIL_NOTIFICATION_API, false, {
      approvar_email: projectData?.approver,
      creator_email: userInfo?.email,
      project_oc_number: projectData.project_oc_number,
      project_name: projectData.project_name,
      sent_by: `${userInfo?.first_name} ${userInfo?.last_name}`,
      subject: "Approver - EnIMAX",
    });
  } catch (error: any) {
    throw error;
  }
};

export const deleteThermaxProject = async (project_id: string) => {
  try {
    // Delete Project Information
    await deleteProjectInformation(project_id);
    // Delete Static Document List
    await deleteStaticDocumentList(project_id);

    // Delete Load List Revisions
    await deleteLoadListRevisions(project_id);
    // Delete Cable Schedule Revisions
    await deleteCableScheduleRevisions(project_id);
    // Delete Motor Canopy Revisions
    await deleteMotorCanopyRevisions(project_id);
    // Delete Motor Specification Revisions
    await deleteMotorSpecificationRevisions(project_id);
    // Delete LPBS Specification Revisions
    await deleteLPBSSpecificationRevisions(project_id);
    // Delete Local Isolator Revisions
    await deleteLocalIsolatorRevisions(project_id);

    // Delete Design Basis Revision History
    const designBasisRevisionHistory = await getData(
      `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["*"]`
    );
    for (const revision of designBasisRevisionHistory || []) {
      const revisionID = revision.name;
      // Delete Design Basis General Information
      await deleteDesignBasisGeneralInfo(revisionID);
      // Delete Project Main Package
      await deleteProjectMainPackage(revisionID);
      // Delete Motor Parameters
      await deleteDesignBasisMotorParameters(revisionID);
      // Delete Make of Components
      await deleteDesignBasisMakeofComponent(revisionID);

      // Delete all MCC Panel Data
      const mccPanelData = await getData(
        `${MCC_PANEL}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );
      for (const mccPanel of mccPanelData || []) {
        const mccPanelID = mccPanel.name;

        await deleteData(`${MCC_PANEL}/${mccPanelID}`, false);
      }

      // Delete all PCC Panel Data
      const pccPanelData = await getData(
        `${PCC_PANEL}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );
      for (const pccPanel of pccPanelData || []) {
        const pccPanelID = pccPanel.name;

        await deleteData(`${PCC_PANEL}/${pccPanelID}`, false);
      }

      // Delete all MCC Cum PCC MCC Panel Data
      const mccCumPccMccPanelData = await getData(
        `${MCC_PANEL}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );
      for (const mccCumPccMccPanel of mccCumPccMccPanelData || []) {
        const mccCumPccMccPanelID = mccCumPccMccPanel.name;
        await deleteData(`${MCC_PANEL}/${mccCumPccMccPanelID}`, false);
      }

      // Delete all MCC_PCC_PLC_PANEL_1 Data
      const mccPccPlcPanel1Data = await getData(
        `${MCC_PCC_PLC_PANEL_1}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );

      for (const mccPccPlcPanel1 of mccPccPlcPanel1Data || []) {
        const mccPccPlcPanel1ID = mccPccPlcPanel1.name;

        await deleteData(`${MCC_PCC_PLC_PANEL_1}/${mccPccPlcPanel1ID}`, false);
      }

      // Delete all MCC_PCC_PLC_PANEL_2 Data
      const mccPccPlcPanel2Data = await getData(
        `${MCC_PCC_PLC_PANEL_2}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );

      for (const mccPccPlcPanel2 of mccPccPlcPanel2Data) {
        const mccPccPlcPanel2ID = mccPccPlcPanel2.name;
        await deleteData(`${MCC_PCC_PLC_PANEL_2}/${mccPccPlcPanel2ID}`, false);
      }

      // Delete all MCC_PCC_PLC_PANEL_3 Data
      const mccPccPlcPanel3Data = await getData(
        `${MCC_PCC_PLC_PANEL_3}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );

      for (const mccPccPlcPanel3 of mccPccPlcPanel3Data || []) {
        const mccPccPlcPanel3ID = mccPccPlcPanel3.name;

        await deleteData(`${MCC_PCC_PLC_PANEL_3}/${mccPccPlcPanel3ID}`, false);
      }

      // Delete Cable Tray Layout Data
      const cableTrayLayoutData = await getData(
        `${CABLE_TRAY_LAYOUT}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );
      for (const cableTrayLayout of cableTrayLayoutData || []) {
        const cableTrayLayoutID = cableTrayLayout.name;
        await deleteData(`${CABLE_TRAY_LAYOUT}/${cableTrayLayoutID}`, false);
      }

      // Delete Earthing Layout Data
      const earthingLayoutData = await getData(
        `${LAYOUT_EARTHING}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );
      for (const earthingLayout of earthingLayoutData || []) {
        const earthingLayoutID = earthingLayout.name;
        await deleteData(`${LAYOUT_EARTHING}/${earthingLayoutID}`, false);
      }

      // Delete Project Panel Data
      const projectPanelData = await getData(
        `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revisionID}"]]&fields=["*"]`
      );
      for (const projectPanel of projectPanelData || []) {
        const projectPanelID = projectPanel.name;
        const sldRevisionHistory = await getData(
          `${SLD_REVISIONS_API}?filters=[["panel_id", "=", "${projectPanelID}"]]&fields=["*"]`
        );
        for (const sldRevision of sldRevisionHistory || []) {
          const sldRevisionID = sldRevision.name;
          await deleteData(`${SLD_REVISIONS_API}/${sldRevisionID}`, false);
        }

        // Delete Dynamic Document List
        await deleteData(`${DYNAMIC_DOCUMENT_API}/${projectPanelID}`, false);

        // Delete project panel data
        await deleteData(`${PROJECT_PANEL_API}/${projectPanelID}`, false);
      }

      await deleteData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}/${revisionID}`,
        false
      );
    }

    const sldRevisionHistory = await getData(
      `${SLD_REVISIONS_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["*"]`
    );
    for (const revision of sldRevisionHistory || []) {
      const revisionID = revision.name;

      await deleteData(`${SLD_REVISIONS_API}/${revisionID}`, false);
    }

    await deleteData(`${PROJECT_API}/${project_id}`, false);
  } catch (error) {
    throw error;
  }
};
