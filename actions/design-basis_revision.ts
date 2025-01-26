"use server";

import {
  DESIGN_BASIS_REVISION_HISTORY_API,
  DESIGN_BASIS_GENERAL_INFO_API,
  PROJECT_MAIN_PKG_API,
  MOTOR_PARAMETER_API,
  MAKE_OF_COMPONENT_API,
  PROJECT_PANEL_API,
  DYNAMIC_DOCUMENT_API,
  MCC_PANEL,
  PCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  CABLE_TRAY_LAYOUT,
  LAYOUT_EARTHING,
  MCC_PCC_PLC_PANEL_3,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
} from "@/configs/api-endpoints";
import { DB_REVISION_STATUS } from "@/configs/constants";
import { createData, getData, updateData } from "./crud-actions";
import {
  copyCommonConfiguration,
  copyProjectDynamicPanels,
} from "./project/copy";

export const copyDesignBasisRevision = async (
  project_id: string,
  projectApproverEmail: string,
  oldRevisionId: string,
  clone_notes: string
) => {
  try {
    const createRevisionData = await createData(
      DESIGN_BASIS_REVISION_HISTORY_API,
      false,
      {
        project_id: project_id,
        approver_email: projectApproverEmail,
        status: DB_REVISION_STATUS.Unsubmitted,
        clone_notes,
      }
    );
    const { name: newRevisionId } = createRevisionData;
    const generalInfoData = await getData(
      `${DESIGN_BASIS_GENERAL_INFO_API}/?filters=[["revision_id", "=", "${oldRevisionId}"]]&fields=["*"]`
    );
    await createData(`${DESIGN_BASIS_GENERAL_INFO_API}`, false, {
      ...generalInfoData[0],
      revision_id: newRevisionId,
    });
    const projectMainPkgData = await getData(
      `${PROJECT_MAIN_PKG_API}?filters=[["revision_id", "=", "${oldRevisionId}"]]&fields=["name"]`
    );

    for (const projectMainPkg of projectMainPkgData || []) {
      const mainPkgId = projectMainPkg.name;
      const mainPkgData = await getData(`${PROJECT_MAIN_PKG_API}/${mainPkgId}`);
      await createData(`${PROJECT_MAIN_PKG_API}`, false, {
        ...mainPkgData,
        revision_id: newRevisionId,
      });
    }

    const motorParameterData = await getData(
      `${MOTOR_PARAMETER_API}?fields=["*"]&filters=[["revision_id", "=", "${oldRevisionId}"]]`
    );

    await createData(`${MOTOR_PARAMETER_API}`, false, {
      ...motorParameterData[0],
      revision_id: newRevisionId,
    });

    const makeOfComponentData = await getData(
      `${MAKE_OF_COMPONENT_API}?fields=["*"]&filters=[["revision_id", "=", "${oldRevisionId}"]]`
    );

    await createData(MAKE_OF_COMPONENT_API, false, {
      ...makeOfComponentData[0],
      revision_id: newRevisionId,
    });

    await copyCommonConfiguration(oldRevisionId, newRevisionId);
    await copyProjectDynamicPanels(oldRevisionId, newRevisionId);

    const cableTrayLayoutData = await getData(
      `${CABLE_TRAY_LAYOUT}?filters=[["revision_id", "=", "${oldRevisionId}"]]&fields=["*"]`
    );

    await createData(CABLE_TRAY_LAYOUT, false, {
      ...cableTrayLayoutData[0],
      revision_id: newRevisionId,
    });

    const earthingLayoutData = await getData(
      `${LAYOUT_EARTHING}?filters=[["revision_id", "=", "${oldRevisionId}"]]&fields=["*"]`
    );

    await createData(LAYOUT_EARTHING, false, {
      ...earthingLayoutData[0],
      revision_id: newRevisionId,
    });

    await updateData(
      `${DESIGN_BASIS_REVISION_HISTORY_API}/${oldRevisionId}`,
      false,
      {
        status: DB_REVISION_STATUS.Copied,
      }
    );
  } catch (error) {
    throw error;
  }
};
