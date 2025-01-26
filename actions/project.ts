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
  deleteCableTrayLayout,
  deleteCommonConfiguration,
  deleteDesignBasisGeneralInfo,
  deleteDesignBasisMakeofComponent,
  deleteDesignBasisMotorParameters,
  deleteDesignBasisRevisionHistory,
  deleteDynamicDocumentList,
  deleteLayoutEarthing,
  deleteLoadListRevisions,
  deleteLocalIsolatorRevisions,
  deleteLPBSSpecificationRevisions,
  deleteMccCumPCCPLCPanels,
  deleteMCCPanels,
  deleteMotorCanopyRevisions,
  deleteMotorSpecificationRevisions,
  deletePanelGARevisions,
  deletePanelSpecificationsRevisions,
  deletePCCPanels,
  deleteProject,
  deleteProjectInformation,
  deleteProjectMainPackage,
  deleteProjectPanelData,
  deleteSLDRevisions,
  deleteStaticDocumentList,
} from "./project/delete";
import { copyDesignBasisRevision } from "./design-basis_revision";

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

    const oldDataRes = await getData(
      `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${oldProjectId}"]]&fields=["*"]&order_by=creation desc`
    );
    const oldData = oldDataRes[0];
    const oldDBRevisionID = oldData.name;

    // Create latest copy of design basis revision
    await copyDesignBasisRevision(
      newProjectId,
      approver_email,
      oldDBRevisionID,
      ""
    );

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
      // Delete Common Configuration
      await deleteCommonConfiguration(revisionID);
      // Delete Dynamic Document List
      await deleteDynamicDocumentList(revisionID);
      // Delete MCC Panel Data
      await deleteMCCPanels(revisionID);
      // Delete PCC Panel Data
      await deletePCCPanels(revisionID);
      // Delete all MCC_PCC_PLC_PANEL Data
      await deleteMccCumPCCPLCPanels(revisionID);
      // Delete Cable Tray Layout Data
      await deleteCableTrayLayout(revisionID);
      // Delete Earthing Layout Data
      await deleteLayoutEarthing(revisionID);
      // Delete SLD Revision
      await deleteSLDRevisions(revisionID);
      // Delete Panel Specifications Revisions
      await deletePanelSpecificationsRevisions(revisionID);
      // Delete Panel GA Revisions
      await deletePanelGARevisions(revisionID);
      // Delete Project Panel Data
      await deleteProjectPanelData(revisionID);
      // Delete Design Basis Revision History
      await deleteDesignBasisRevisionHistory(revisionID);
    }
    await deleteProject(project_id);
  } catch (error) {
    throw error;
  }
};
