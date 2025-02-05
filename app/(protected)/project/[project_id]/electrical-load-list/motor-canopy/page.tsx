import {
  getLatestLoadlistRevision,
  getLatestMotorCanopyRevision,
} from "@/actions/electrical-load-list";
import MotorCanopy from "@/components/Project Management/Electrical Load List/Motor Canopy/MotorCanopyComponent";

export default async function MotorCanopyPage({
  params,
}: {
  params: { project_id: string };
}) {
  const loadListRevisionData = await getLatestLoadlistRevision(
    params.project_id
  );
  const motorCanopyRevisionData = await getLatestMotorCanopyRevision(
    params.project_id
  );

  return (
    <MotorCanopy
      loadListLatestRevisionId={
        loadListRevisionData[loadListRevisionData.length - 1]?.name
      }
      motorCanopyRevisionId={
        motorCanopyRevisionData[motorCanopyRevisionData.length - 1]?.name
      }
    />
  );
}
