import { getData } from "@/actions/crud-actions";
import { getLatestDesignBasisRevision } from "@/actions/design-basis";
import {
  getAllSldRevisions,
  getLatestCableScheduleRevision,
  getLatestLoadlistRevision,
} from "@/actions/electrical-load-list"; 
import SLDTabs from "@/components/Project Management/Sld/SldTabs";
import { PROJECT_PANEL_API } from "@/configs/api-endpoints";

export default async function Page({
  params,
}: {
  params: { project_id: string };
}) {
  const designbasisData = await getLatestDesignBasisRevision(params.project_id);
  const designBasisRevisionId: string = designbasisData[0]?.name;
  const loadListRevisionData = await getLatestLoadlistRevision(
    params.project_id
  );
  const cableScheduleRevisionData = await getLatestCableScheduleRevision(
    params.project_id
  );
  const loadListLatestRevisionId: string = loadListRevisionData[loadListRevisionData.length - 1]?.name
  const projectPanelData = await getData(
    `${PROJECT_PANEL_API}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]&order_by=creation asc`
  );
  const sldRevisionData = await getAllSldRevisions(
    projectPanelData[0].name
  ); 

  return ( 
    <SLDTabs
      sldRevisions={sldRevisionData}
      designBasisRevisionId={designBasisRevisionId}
      loadListLatestRevisionId={loadListLatestRevisionId}
      cableScheduleRevisionId={cableScheduleRevisionData[0]?.name}
      projectPanelData={projectPanelData}
    />
  );
}
