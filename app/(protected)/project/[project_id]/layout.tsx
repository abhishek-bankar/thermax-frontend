"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { useLoading } from "@/hooks/useLoading";
import clsx from "clsx";
import { useNewGetData } from "@/hooks/useCRUD";
import {
  DESIGN_BASIS_REVISION_HISTORY_API,
  PROJECT_INFO_API,
} from "@/configs/api-endpoints";
import { DB_REVISION_STATUS } from "@/configs/constants";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const project_id = params.project_id;
  const { setLoading: setModalLoading } = useLoading();
  const pathname = usePathname();
  const [isProjectInfoSaved, setIsProjectInfoSaved] = useState(0);
  const [isDesignBasisReleased, setIsDesignBasisReleased] = useState(0);

  const project_information_path = `/project/${project_id}/project-information`;
  const design_basis_path = `/project/${project_id}/design-basis`;
  const electrical_load_list_path = `/project/${project_id}/electrical-load-list`;
  const sld_path = `/project/${project_id}/sld`;
  const cable_tray_path = `/project/${project_id}/cable-tray`;
  const earthing_path = `/project/${project_id}/earthing`;
  const lighting_path = `/project/${project_id}/lighting`;

  const handleTabChange = (path: string) => {
    setModalLoading(true);
    router.push(path);
  };
  const { data: projectData } = useNewGetData(
    `${PROJECT_INFO_API}/${params?.project_id}`
  );
  const { data: designBasisRevisionData } = useNewGetData(
    `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"], ["status", "=", "${DB_REVISION_STATUS.Released}"]]`
  );

  useEffect(() => {
    if (projectData) {
      setIsProjectInfoSaved(projectData?.is_saved);
    }
    if (designBasisRevisionData && designBasisRevisionData.length > 0) {
      setIsDesignBasisReleased(1);
    }
  }, [projectData, designBasisRevisionData]);

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        <div className="sticky top-0 z-10 w-full bg-white">
          <nav className="flex gap-2 p-2 shadow-md">
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(project_information_path)
                  ? "bg-green-700"
                  : "bg-blue-700"
              )}
              onClick={() => handleTabChange(project_information_path)}
            >
              Project Information
            </div>
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(design_basis_path)
                  ? "bg-green-700"
                  : "bg-blue-700",
                isProjectInfoSaved === 0 &&
                  "opacity-50 cursor-not-allowed bg-gray-500"
              )}
              onClick={() => {
                if (isProjectInfoSaved === 1) {
                  handleTabChange(design_basis_path);
                }
              }}
            >
              Design Basis
            </div>
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(electrical_load_list_path)
                  ? "bg-green-700"
                  : "bg-blue-700",
                isProjectInfoSaved === 0 &&
                  "opacity-50 cursor-not-allowed bg-gray-500"
              )}
              onClick={() => {
                if (isProjectInfoSaved === 1) {
                  handleTabChange(electrical_load_list_path);
                }
              }}
            >
              Electrical Load List
            </div>
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(sld_path) ? "bg-green-700" : "bg-blue-700",
                (isProjectInfoSaved === 0 || isDesignBasisReleased === 0) &&
                  "opacity-50 bg-gray-500 cursor-not-allowed"
              )}
              onClick={() => {
                if (isProjectInfoSaved === 1 && isDesignBasisReleased) {
                  handleTabChange(sld_path);
                }
              }}
            >
              SLD
            </div>
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(cable_tray_path)
                  ? "bg-green-700"
                  : "bg-blue-700",
                (isProjectInfoSaved === 0 || !isDesignBasisReleased) &&
                  "opacity-50 cursor-not-allowed bg-gray-500"
              )}
              onClick={() => {
                if (isProjectInfoSaved === 1 && isDesignBasisReleased) {
                  handleTabChange(cable_tray_path);
                }
              }}
            >
              Cable Tray
            </div>
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(earthing_path)
                  ? "bg-green-700"
                  : "bg-blue-700",
                (isProjectInfoSaved === 0 || !isDesignBasisReleased) &&
                  "opacity-50 cursor-not-allowed bg-gray-500"
              )}
              onClick={() => {
                if (isProjectInfoSaved === 1 && isDesignBasisReleased) {
                  handleTabChange(earthing_path);
                }
              }}
            >
              Earthing
            </div>
            <div
              className={clsx(
                "white grid flex-auto cursor-pointer place-content-center rounded border p-1 text-sm font-bold uppercase tracking-wide text-white",
                pathname.includes(lighting_path)
                  ? "bg-green-700"
                  : "bg-blue-700",
                (isProjectInfoSaved === 0 || !isDesignBasisReleased) &&
                  "opacity-50 cursor-not-allowed bg-gray-500"
              )}
              onClick={() => {
                if (isProjectInfoSaved === 1 && isDesignBasisReleased) {
                  handleTabChange(lighting_path);
                }
              }}
            >
              Lighting
            </div>
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto pb-4">{children}</main>
      </div>
    </>
  );
}
