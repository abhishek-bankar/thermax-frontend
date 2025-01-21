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
import { createData, getData } from "./crud-actions";

export const copyDesignBasisRevision = async (
  project_id: string,
  revision_id: string,
  clone_notes: string
) => {
  try {
    const createRevisionData = await createData(
      DESIGN_BASIS_REVISION_HISTORY_API,
      false,
      {
        project_id: project_id,
        status: DB_REVISION_STATUS.Copied,
        clone_notes,
      }
    );
    const new_revision_id = createRevisionData.name;
    const generalInfoData = await getData(
      `${DESIGN_BASIS_GENERAL_INFO_API}/?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );
    await createData(`${DESIGN_BASIS_GENERAL_INFO_API}`, false, {
      ...generalInfoData[0],
      revision_id: new_revision_id,
    });
    const projectMainPkgData = await getData(
      `${PROJECT_MAIN_PKG_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );

    for (const projectMainPkg of projectMainPkgData || []) {
      const mainPkgId = projectMainPkg.name;
      const mainPkgData = await getData(`${PROJECT_MAIN_PKG_API}/${mainPkgId}`);
      await createData(`${PROJECT_MAIN_PKG_API}`, false, {
        ...mainPkgData,
        revision_id: new_revision_id,
      });
    }

    const motorParameterData = await getData(
      `${MOTOR_PARAMETER_API}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
    );

    await createData(`${MOTOR_PARAMETER_API}`, false, {
      ...motorParameterData[0],
      revision_id: new_revision_id,
    });

    const makeOfComponentData = await getData(
      `${MAKE_OF_COMPONENT_API}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
    );

    await createData(MAKE_OF_COMPONENT_API, false, {
      ...makeOfComponentData[0],
      revision_id: new_revision_id,
    });

    await copyCommonConfigData(revision_id, new_revision_id);

    const projectPanelData = await getData(
      `${PROJECT_PANEL_API}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );

    for (const projectPanel of projectPanelData || []) {
      const old_panel_id = projectPanel.name;
      const createPanelData = await createData(PROJECT_PANEL_API, false, {
        ...projectPanel,
        revision_id: new_revision_id,
      });
      const new_panel_id = createPanelData.name;
      await createData(DYNAMIC_DOCUMENT_API, false, {
        panel_id: new_panel_id,
      });

      const mccPanelData = await getData(
        `${MCC_PANEL}?filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${old_panel_id}"]]&fields=["*"]`
      );

      for (const mccPanel of mccPanelData || []) {
        await createData(MCC_PANEL, false, {
          ...mccPanel,
          revision_id: new_revision_id,
          panel_id: new_panel_id,
        });
      }

      const pccPanelData = await getData(
        `${PCC_PANEL}?filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${old_panel_id}"]]&fields=["*"]`
      );

      for (const pccPanel of pccPanelData || []) {
        await createData(PCC_PANEL, false, {
          ...pccPanel,
          revision_id: new_revision_id,
          panel_id: new_panel_id,
        });
      }

      const mccCumPccMccPanelData = await getData(
        `${MCC_PANEL}?filters=[["revision_id", "=", "${revision_id}"], ["panel_id", "=", "${old_panel_id}"]]&fields=["*"]`
      );

      for (const mccCumPccMccPanel of mccCumPccMccPanelData || []) {
        await createData(MCC_PANEL, false, {
          ...mccCumPccMccPanel,
          revision_id: new_revision_id,
          panel_id: new_panel_id,
        });
      }

      await copyMccCumPccPLCPanelData(revision_id, new_revision_id);
    }

    const cableTrayLayoutData = await getData(
      `${CABLE_TRAY_LAYOUT}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );

    await createData(CABLE_TRAY_LAYOUT, false, {
      ...cableTrayLayoutData[0],
      revision_id: new_revision_id,
    });

    const earthingLayoutData = await getData(
      `${LAYOUT_EARTHING}?filters=[["revision_id", "=", "${revision_id}"]]&fields=["*"]`
    );

    await createData(LAYOUT_EARTHING, false, {
      ...earthingLayoutData[0],
      revision_id: new_revision_id,
    });
  } catch (error) {
    throw error;
  }
};
