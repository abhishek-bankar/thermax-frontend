import { getLatestDesignBasisRevision } from "@/actions/design-basis";
import { getLatestCableScheduleRevision, getLatestLoadlistRevision } from "@/actions/electrical-load-list";
import Download from "@/components/Project Management/Electrical Load List/Download";

export default async function DocumentRevision({
  params,
}: {
  params: { project_id: string };
}) {
  const designbasisData = await getLatestDesignBasisRevision(params.project_id);
  const loadListRevisionData = await getLatestLoadlistRevision(
    params.project_id
  );
   const cableScheduleRevisionData = await getLatestCableScheduleRevision(
      params.project_id
    );

  return (
    <Download
      designBasisRevisionId={designbasisData[0]?.name}
      loadListLatestRevisionId={loadListRevisionData[0]?.name}
      cableScheduleRevisionId={cableScheduleRevisionData[0]?.name}
    />
  );
}
