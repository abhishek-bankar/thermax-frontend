import { getUserInfo } from "@/actions/user-actions";
import CableTray from "@/components/Project Management/Cable Tray/CableTray";

export default async function Page({
  params,
}: {
  params: { project_id: string };
}) {
 

  return <CableTray />;
}
