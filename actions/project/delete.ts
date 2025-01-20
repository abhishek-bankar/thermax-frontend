import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  DESIGN_BASIS_GENERAL_INFO_API,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
  LOCAL_ISOLATOR_REVISION_HISTORY_API,
  MAKE_OF_COMPONENT_API,
  MOTOR_CANOPY_REVISION_HISTORY_API,
  MOTOR_PARAMETER_API,
  MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
  PROJECT_INFO_API,
  PROJECT_MAIN_PKG_API,
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
      `${DESIGN_BASIS_GENERAL_INFO_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
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
      `${PROJECT_MAIN_PKG_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
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
      `${MOTOR_PARAMETER_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
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
      `${MAKE_OF_COMPONENT_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
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
      `${COMMON_CONFIGURATION_1}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    const commonConfigurations2 = await getData(
      `${COMMON_CONFIGURATION_2}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    const commonConfigurations3 = await getData(
      `${COMMON_CONFIGURATION_3}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
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
