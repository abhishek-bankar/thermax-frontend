import { getLatestCableScheduleRevision, getLatestLoadlistRevision } from "actions/electrical-load-list"
import CableScheduleComponent from "components/Project Management/Electrical Load List/Cable Schedule/CableScheduleComponent"

export default async function CableSchedule({ params }: { params: { project_id: string } }) {
  const loadListRevisionData = await getLatestLoadlistRevision(params.project_id)
  const cableScheduleRevisionData = await getLatestCableScheduleRevision(params.project_id)

  return <CableScheduleComponent loadListLatestRevisionId={loadListRevisionData[0]?.name} cableScheduleRevisionId={cableScheduleRevisionData[0]?.name}/>
}
