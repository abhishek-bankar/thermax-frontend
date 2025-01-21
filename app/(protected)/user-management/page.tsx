import { Metadata } from "next";
import { getUserInfo } from "@/actions/user-actions";
// import SuperuserList from "@/components/User Management/SuperuserList";
// import { UserList } from "@/components/User Management/UserList";
import { BTG } from "@/configs/constants";
import { lazy, Suspense } from "react";
const SuperuserList = lazy(
  () => import("@/components/User Management/SuperuserList")
);
const UserList = lazy(() => import("@/components/User Management/UserList"));
export const metadata: Metadata = {
  title: "EniMax - User Management",
  icons: {
    icon: "/eni_max_logo_svg_final.svg",
  },
};
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);
export default async function UserManagement() {
  const userInfo = await getUserInfo();
  return (
    <div>
      {userInfo?.division === BTG ? (
        <Suspense fallback={<LoadingFallback />}>
          <SuperuserList />
        </Suspense>
      ) : ( 
        <Suspense fallback={<LoadingFallback />}>
          <UserList userInfo={userInfo} />
        </Suspense>
      )}
    </div>
  );
}
