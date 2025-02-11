"use client";
import { Card } from "antd";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { PROJECTS_PAGE } from "@/configs/constants";
import { useLoading } from "@/hooks/useLoading";
import { PROJECT_API } from "@/configs/api-endpoints";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetData } from "@/hooks/useCRUD";
import EnimaxLogo from "@/public/files/eni_max_logo.png";
import { useRouter } from "next/navigation";

interface YearCount {
  year: number;
  count: number;
}
interface Project {
  name: string;
  creation: string;
  is_complete: number;
}

interface BlurredBackgroundCardProps {
  logo: string | StaticImageData; // Accepts both URL string and imported image
  label: string;
  count: string;
  bgcolor: string;
}

const BlurredBackgroundCard: React.FC<BlurredBackgroundCardProps> = ({
  logo,
  label,
  count,
  bgcolor,
}) => {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-lg">
      {/* Background image with blur effect */}
      <div className="absolute inset-0">
        <Image
          src={logo}
          alt="Background"
          className="object-cover w-full scale-110 blur-md"
          fill
          priority
        />
        {/* Overlay to darken the background slightly */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content container */}
      <div className="relative flex flex-col items-center justify-center p-6">
        {/* Logo */}
        {/* <div className="mb-4">
          <Image
            src={logo}
            alt="Logo"
            width={65}
            height={65}
            priority
            className="rounded-lg"
          />
        </div> */}

        {/* Label */}
        <div className="py-2 text-white font-semibold">
          {label.toUpperCase()}
        </div>

        {/* Count */}
        <div
          className={`w-full px-6 py-3 rounded-md text-white font-bold ${bgcolor}`}
        >
          {count}
        </div>
      </div>
    </div>
  );
};

const ProjectStats = ({ projectData }: { projectData: any }) => {
  // Function to determine financial year from date
  const router = useRouter();

  const handleClick = (category: any, year: any) => {
    router.push(`/project?category=${category}&year=${year}`);
  };
  const getFinancialYear = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const year = date.getFullYear();

    if (month <= 2) {
      return `${year - 1}-${year}`;
    }
    return `${year}-${year + 1}`;
  };

  // Function to get FY in display format (e.g., "FY 24-25")
  const getDisplayFY = (year: string): string => {
    const [start, end] = year.split("-");
    return `FY ${start.slice(-2)}-${end.slice(-2)}`;
  };

  // Function to calculate project statistics
  const calculateStats = (projects: Project[]) => {
    const yearlyStats: Record<
      string,
      {
        completed: number;
        live: number;
        total: number;
      }
    > = {};

    projects.forEach((project) => {
      const fy = getFinancialYear(project.creation);

      if (!yearlyStats[fy]) {
        yearlyStats[fy] = {
          completed: 0,
          live: 0,
          total: 0,
        };
      }

      yearlyStats[fy].total += 1;
      if (project.is_complete === 1) {
        yearlyStats[fy].completed += 1;
      } else {
        yearlyStats[fy].live += 1;
      }
    });

    return yearlyStats;
  };

  const stats = calculateStats(projectData);
  const years = Object.keys(stats).sort().reverse();

  const data = [
    {
      label: "Financial Year",
      values: years.map((year) => {
        return { count: getDisplayFY(year), year: year };
      }),
    },
    {
      label: "Total Projects",
      // values: years.map((year) => stats[year].total),
      values: years.map((year) => {
        return { count: stats[year].total, year: year };
      }),
    },
    {
      label: "Live Projects",
      values: years.map((year) => {
        return { count: stats[year].live, year: year };
      }),

      // values: years.map((year) => stats[year].live),
    },
    {
      label: "Completed Projects",
      values: years.map((year) => {
        return { count: stats[year].completed, year: year };
      }),

      // values: years.map((year) => stats[year].completed),
    },
  ];

  return (
    <div className="w-1/2 mx-auto px-4">
      <div className="overflow-x-auto flex justify-center rounded backdrop-blur-lg bg-white/10">
        <table className="border-separate border-spacing-x-4 px-4">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex + "e"} className="py-1">
                {/* <td
                  className={`px-6 py-4 whitespace-nowrap rounded ${
                    rowIndex === 0
                      ? "bg-sky-500 text-white font-medium"
                      : "bg-gray-100 text-gray-900"
                  }`}
                  onClick={() => {
                    console.log("label clicked");
                  }}
                >
                  {row.label}
                </td> */}
                {row.values.map((value, index) =>
                  row.label === "Financial Year" ? (
                    <td
                      key={index}
                      className={`cursor-pointer p-4 whitespace-nowrap text-center bg-blue-500 ${
                        index === 0 || index === row.values.length - 1
                          ? "rounded"
                          : "rounded"
                      } shadow-md `}
                      // ${
                      //   rowIndex === 0
                      //     ? "bg-slate-400 text-white font-medium"
                      //     : "bg-white/20 backdrop-blur-lg"
                      // }
                    >
                      {value.count}
                    </td>
                  ) : row.label === "Total Projects" ? (
                    <td
                      key={index}
                      className={`cursor-pointer whitespace-nowrap text-center pt-3 ${
                        index === 0 || index === row.values.length - 1
                          ? "rounded"
                          : "rounded"
                      }`}
                      onClick={() => {
                        console.log("data clicked");
                        // if (row.label === "Total Projects") {
                        //   router.push(`/project/?year=${value.year}`);
                        // } else if (row.label === "Live Projects") {
                        //   handleClick(0, value.year); // o beacuse it is not completed its live
                        // }
                        console.log("data clicked  rowIndex", rowIndex);
                        console.log("data clicked", value);
                        console.log("data clicked", row);
                        console.log("data clicked", row.values);
                      }}
                    >
                      <BlurredBackgroundCard
                        logo={EnimaxLogo}
                        label={row.label.toUpperCase()}
                        count={value.count.toString()}
                        bgcolor={"bg-red-500"}
                      />
                      {/* <div className="shadow-md border border-black rounded">
                        <div className="py-2">{row.label.toUpperCase()}</div>
                        <div className="py-8 px-0 bg-red-500">
                          {value.count}
                        </div>
                      </div> */}
                      {/* <Card bordered hoverable className="shadow-md">
                        <div className="flex gap-4">
                          <div>
                            <Image
                              src={EnimaxLogo}
                              alt="Description of the image"
                              width={65}
                              height={65}
                              priority
                            />
                          </div>
                          <div className="flex flex-col items-center justify-center text-gray-700">
                            <div className="font-bold">
                              {row.label.toUpperCase()}
                            </div>
                            <div className="font-semibold">{value.count}</div>
                          </div>
                        </div>
                      </Card> */}
                    </td>
                  ) : row.label === "Live Projects" ? (
                    <td
                      key={index}
                      className={`cursor-pointer whitespace-nowrap text-center py-3 ${
                        index === 0 || index === row.values.length - 1
                          ? "rounded"
                          : "rounded"
                      } `}
                      onClick={() => {
                        console.log("data clicked");
                        // if (row.label === "Total Projects") {
                        //   router.push(`/project/?year=${value.year}`);
                        // } else if (row.label === "Live Projects") {
                        // }
                        handleClick(0, value.year); // o beacuse it is not completed its live
                        console.log("data clicked  rowIndex", rowIndex);
                        console.log("data clicked", value);
                        console.log("data clicked", row);
                        console.log("data clicked", row.values);
                      }}
                    >
                      <BlurredBackgroundCard
                        logo={EnimaxLogo}
                        label={row.label.toUpperCase()}
                        count={value.count.toString()}
                        bgcolor={"bg-yellow-500"}
                      />
                      {/* <Card bordered hoverable className="shadow-md">
                        <div className="flex flex-col">
                          <div>
                            <Image
                              src={EnimaxLogo}
                              alt="Description of the image"
                              width={65}
                              height={65}
                              priority
                            />
                          </div>

                          <div className="py-2">{row.label.toUpperCase()}</div>
                          <div className="py-8 px-0 bg-yellow-500">
                            {value.count}
                          </div>
                        </div>
                      </Card> */}
                      {/* <div className="ant-card ant-card-bordered ant-card-hoverable shadow-md border border-black rounded">
                        <div className="py-2">{row.label.toUpperCase()}</div>
                        <div className="py-8 px-0 bg-yellow-500">
                          {value.count}
                        </div>
                      </div> */}
                    </td>
                  ) : (
                    <td
                      key={index}
                      className={`cursor-pointer whitespace-nowrap text-center ${
                        index === 0 || index === row.values.length - 1
                          ? "rounded"
                          : "rounded"
                      }  `}
                      onClick={() => {
                        console.log("data clicked");
                        // if (row.label === "Total Projects") {
                        //   router.push(`/project/?year=${value.year}`);
                        // } else if (row.label === "Live Projects") {
                        // }
                        handleClick(1, value.year); // o beacuse it is not completed its live
                        console.log("data clicked  rowIndex", rowIndex);
                        console.log("data clicked", value);
                        console.log("data clicked", row);
                        console.log("data clicked", row.values);
                      }}
                    >
                      {/* <Card bordered hoverable className="shadow-md">
                        <div className="flex gap-4">
                          <div>
                            <Image
                              src={EnimaxLogo}
                              alt="Description of the image"
                              width={65}
                              height={65}
                              priority
                            />
                          </div>
                          <div className="flex flex-col items-center justify-center text-gray-700">
                            <div className="font-bold">
                              {row.label.toUpperCase()}
                            </div>
                            <div className="font-semibold">{value.count}</div>
                          </div>
                        </div>
                      </Card> */}
                      {/* <div className="shadow-md border border-black rounded">
                        <div className="py-2">{row.label.toUpperCase()}</div>
                        <div className="py-8 px-0 bg-green-500">
                          {value.count}
                        </div>
                      </div> */}
                      <BlurredBackgroundCard
                        logo={EnimaxLogo}
                        label={row.label.toUpperCase()}
                        count={value.count.toString()}
                        bgcolor={"bg-green-500"}
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProjectDashboard = () => {
  const { setLoading: setModalLoading } = useLoading();
  const userInfo = useCurrentUser();
  const router = useRouter();

  const getProjectUrl = `${PROJECT_API}?fields=["*"]&limit=1000`;
  const { data: projectList, isLoading } = useGetData(getProjectUrl);

  const proj =
    projectList?.filter((item: any) => item?.division === userInfo?.division) ??
    [];
  // const proj = [
  //   {
  //     name: "0jgjo2ota3",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2023-06-03 09:19:34.091262",
  //     modified: "2025-02-03 09:19:34.091262",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "Testing_3_2_25",
  //     project_oc_number: "Heating_test",
  //     client_name: "Adani",
  //     consultant_name: "Thermax",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "24sr3o868a",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2023-08-30 17:00:22.196203",
  //     modified: "2025-01-30 17:00:22.196203",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 10,
  //     project_name: "SMG-150/10.54",
  //     project_oc_number: "ZG06",
  //     client_name: "PRIMEGATE New ",
  //     consultant_name: "Thermax",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 1,
  //   },
  //   {
  //     name: "6o0cc36kv1",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2024-03-22 11:05:17.480814",
  //     modified: "2025-01-28 09:06:01.232434",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "TMX",
  //     project_oc_number: "Z999",
  //     client_name: "ABCD",
  //     consultant_name: "ABCDE",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 1,
  //   },
  //   {
  //     name: "81h6bnr4tg",
  //     owner: "raju.bagade@thermaxglobal.com",
  //     creation: "2025-01-22 10:26:09.230971",
  //     modified: "2025-01-22 10:26:09.230971",
  //     modified_by: "raju.bagade@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 15,
  //     project_name: "Heating_Test10",
  //     project_oc_number: "test 22_RBB",
  //     client_name: "Thermax Heating",
  //     consultant_name: "ABCDE",
  //     approver: "shyam.pawar@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "8uu7vf2qj8",
  //     owner: "sayali.maske@thermaxglobal.com",
  //     creation: "2025-01-22 10:35:31.452204",
  //     modified: "2025-01-22 10:35:31.452204",
  //     modified_by: "sayali.maske@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 1,
  //     project_name: "Vizag Ingredients Pvt Ltd ",
  //     project_oc_number: "ZF37",
  //     client_name: "Thermax Heating",
  //     consultant_name: "Heating Project",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "9t62c77l8b",
  //     owner: "himanshu.chaudhari@thermaxglobal.com",
  //     creation: "2025-01-22 10:34:03.941305",
  //     modified: "2025-01-22 10:34:03.941305",
  //     modified_by: "himanshu.chaudhari@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 1,
  //     project_name: "Lupin",
  //     project_oc_number: "ZE72",
  //     client_name: "Lupin Ltd",
  //     consultant_name: "NA",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "a07j7ru84g",
  //     owner: "prashanth.moorthy@thermaxglobal.com",
  //     creation: "2025-01-24 18:08:19.757028",
  //     modified: "2025-01-24 18:08:19.757028",
  //     modified_by: "prashanth.moorthy@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 2,
  //     project_name: "JSW",
  //     project_oc_number: "5678",
  //     client_name: "JSW",
  //     consultant_name: "121212",
  //     approver: "shyam.pawar@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "cde4at8rlb",
  //     owner: "laxman.hake@thermaxglobal.com",
  //     creation: "2025-01-22 10:34:23.559501",
  //     modified: "2025-01-22 10:41:04.156401",
  //     modified_by: "laxman.hake@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 5,
  //     project_name: "Pratishta",
  //     project_oc_number: "ZF97",
  //     client_name: "Pratishta",
  //     consultant_name: "-",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "cfqpnhgqm4",
  //     owner: "raju.bagade@thermaxglobal.com",
  //     creation: "2025-01-23 17:29:03.866702",
  //     modified: "2025-01-23 17:29:03.866702",
  //     modified_by: "raju.bagade@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 14,
  //     project_name: "Live demo Project",
  //     project_oc_number: "demo 01",
  //     client_name: "Shoolin",
  //     consultant_name: "ABCDE",
  //     approver: "shyam.pawar@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "d9fv6kfonp",
  //     owner: "sadhana.venna@thermaxglobal.com",
  //     creation: "2025-01-22 15:57:55.688721",
  //     modified: "2025-01-22 15:57:55.688721",
  //     modified_by: "sadhana.venna@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "Test Project",
  //     project_oc_number: "ZF48",
  //     client_name: "sadhana",
  //     consultant_name: "ABCD",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "dkgljddlna",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-02-03 17:17:18.852524",
  //     modified: "2025-02-03 17:17:18.852524",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 37,
  //     project_name: "SLD TEST-4",
  //     project_oc_number: "SLDTEST004",
  //     client_name: "PRIMEGATE DISTILLERIES LIMITED",
  //     consultant_name: "PRAJ INDUSTRIES LIMITED",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "h5v10ctrsg",
  //     owner: "parikshit.s@thermaxglobal.com",
  //     creation: "2025-01-28 12:50:07.902916",
  //     modified: "2025-01-28 12:50:07.902916",
  //     modified_by: "parikshit.s@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 15,
  //     project_name: "Pudumjee Paper",
  //     project_oc_number: "ZF91",
  //     client_name: "Pudumjee Paper",
  //     consultant_name: "NA",
  //     approver: "prashant.kute@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "h84rlf2rp5",
  //     owner: "raju.bagade@thermaxglobal.com",
  //     creation: "2025-01-10 11:02:56.541794",
  //     modified: "2025-01-10 11:15:16.523568",
  //     modified_by: "raju.bagade@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "HCCB",
  //     project_oc_number: "12346",
  //     client_name: "COCA COLA",
  //     consultant_name: "TCE",
  //     approver: "shyam.pawar@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 1,
  //   },
  //   {
  //     name: "i89tr906k9",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-02-04 14:54:05.501660",
  //     modified: "2025-02-04 14:54:05.501660",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 5,
  //     project_name: "GA Testing",
  //     project_oc_number: "GA Testing",
  //     client_name: "Shoolin",
  //     consultant_name: "Thermax",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "l0bifvo8jg",
  //     owner: "raju.bagade@thermaxglobal.com",
  //     creation: "2025-01-22 15:29:16.832722",
  //     modified: "2025-01-22 15:29:16.832722",
  //     modified_by: "raju.bagade@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 1,
  //     project_name: "Heating_Test22",
  //     project_oc_number: "1234567",
  //     client_name: "ABCD",
  //     consultant_name: "ABCDE",
  //     approver: "shyam.pawar@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "oag7did9i7",
  //     owner: "sadhana.venna@thermaxglobal.com",
  //     creation: "2025-01-22 10:37:53.760916",
  //     modified: "2025-01-22 10:37:53.760916",
  //     modified_by: "sadhana.venna@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 1,
  //     project_name: "Shoolin",
  //     project_oc_number: "ZF84",
  //     client_name: "Shoolin",
  //     consultant_name: "ABCD",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "pctoqemhsk",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-01-29 12:20:57.788397",
  //     modified: "2025-01-29 12:20:57.788397",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 12,
  //     project_name: "Test 01",
  //     project_oc_number: "Test 01",
  //     client_name: "ABCD",
  //     consultant_name: "121212",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "q72d2ekl8b",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-01-24 20:32:51.276919",
  //     modified: "2025-01-24 20:32:51.276919",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 10,
  //     project_name: "Test DB Output",
  //     project_oc_number: "Test DB Output",
  //     client_name: "sadhana",
  //     consultant_name: "121212",
  //     approver: "adhiraj.pathania@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "rm1udhhmbb",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-01-24 18:25:27.748810",
  //     modified: "2025-01-24 18:25:27.748810",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 18,
  //     project_name: "JSW",
  //     project_oc_number: "12345fg",
  //     client_name: "ABCD",
  //     consultant_name: "121212",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "t8o4mfchvf",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-01-28 09:06:50.373977",
  //     modified: "2025-01-28 09:06:50.373977",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 13,
  //     project_name: "SMG-150/10.54/CNG/PNG/LPG/DIESEL",
  //     project_oc_number: "ZG05",
  //     client_name: "PRIMEGATE DISTILLERIES LIMITED",
  //     consultant_name: "PRAJ INDUSTRIES LIMITED",
  //     approver: "laxman.hake@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "tbts05a208",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2024-12-06 11:44:43.274673",
  //     modified: "2024-12-06 11:57:34.841771",
  //     modified_by: "raju.bagade@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "Test1_06_12_2024",
  //     project_oc_number: "106122024",
  //     client_name: "Heating Client",
  //     consultant_name: "Heating Consultant",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 1,
  //   },
  //   {
  //     name: "ts8di23qn8",
  //     owner: "prashant.kute@thermaxglobal.com",
  //     creation: "2025-01-22 10:40:43.831194",
  //     modified: "2025-01-22 13:09:16.886366",
  //     modified_by: "prashant.kute@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 3,
  //     project_name: "CPRG",
  //     project_oc_number: "test",
  //     client_name: "PRK",
  //     consultant_name: "NA",
  //     approver: "sadhana.venna@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "u16q9djckj",
  //     owner: "shyam.pawar@thermaxglobal.com",
  //     creation: "2025-02-03 12:20:34.607860",
  //     modified: "2025-02-03 12:20:34.607860",
  //     modified_by: "shyam.pawar@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 5,
  //     project_name: "SLD TEST-3",
  //     project_oc_number: "SDF569678",
  //     client_name: "PRIMEGATE DISTILLERIES LIMITED",
  //     consultant_name: "PRAJ INDUSTRIES LIMITED",
  //     approver: "prashanth.moorthy@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "u8porjsv1u",
  //     owner: "raju.bagade@thermaxglobal.com",
  //     creation: "2025-01-22 15:38:02.091824",
  //     modified: "2025-01-22 15:38:02.091824",
  //     modified_by: "raju.bagade@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "Heating_Test1123",
  //     project_oc_number: "123456",
  //     client_name: "ABCD",
  //     consultant_name: "Heating Project",
  //     approver: "shyam.pawar@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  //   {
  //     name: "v7s78nimcj",
  //     owner: "parikshit.s@thermaxglobal.com",
  //     creation: "2025-01-22 10:33:55.509542",
  //     modified: "2025-01-22 10:40:11.277919",
  //     modified_by: "parikshit.s@thermaxglobal.com",
  //     docstatus: 0,
  //     idx: 0,
  //     project_name: "growthpath",
  //     project_oc_number: "ZF30",
  //     client_name: "REGREEN EXCEL",
  //     consultant_name: "REGREEN EXCEL",
  //     approver: "raju.bagade@thermaxglobal.com",
  //     division: "Heating",
  //     is_complete: 0,
  //   },
  // ];
  const completed_projects = projectList?.filter(
    (item: any) =>
      item?.division === userInfo?.division && item?.is_complete === 1
  );
  function countProjectsByYearAsArray(projectList: Project[]): YearCount[] {
    const yearCount: { [key: number]: number } = {};

    projectList?.forEach((project) => {
      if (project.creation) {
        const year = new Date(project.creation).getFullYear();
        if (!yearCount[year]) {
          yearCount[year] = 0;
        }
        yearCount[year]++;
      } else {
        console.warn("Project has no valid creation date:", project);
      }
    });

    return Object.entries(yearCount).map(([year, count]) => ({
      year: Number(year),
      count,
    }));
  }

  const projectCountsByYearArray = countProjectsByYearAsArray(proj);

  useEffect(() => {
    setModalLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold tracking-wide">Project Dashboard</h2>
        <div className="p-4">
          <div className="flex justify-center px-4 py-2 ">
            <Link href={PROJECTS_PAGE} onClick={() => setModalLoading(true)}>
              <Card bordered hoverable className="shadow-md">
                <div className="flex gap-4">
                  <div>
                    <Image
                      src={EnimaxLogo}
                      alt="Description of the image"
                      width={65}
                      height={65}
                      priority
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center text-gray-700">
                    <div className="font-bold">PROJECT SUMMARY</div>
                    <div className="font-semibold">{proj?.length}</div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
          <div className="flex justify-center gap-x-96 mt-2">
            <Card bordered hoverable className="shadow-md">
              <div className="flex gap-4">
                <div>
                  <Image
                    src={EnimaxLogo}
                    alt="Description of the image"
                    width={65}
                    height={65}
                    priority
                  />
                </div>
                <div className="flex flex-col items-center justify-center text-gray-700">
                  <div className="font-bold">LIVE PROJECTS</div>
                  <div className="font-semibold">
                    {proj?.length - completed_projects?.length}
                  </div>
                </div>
              </div>
            </Card>
            <Card bordered hoverable className="shadow-md">
              <div className="flex gap-4">
                <div>
                  <Image
                    src={EnimaxLogo}
                    alt="Description of the image"
                    width={65}
                    height={65}
                    priority
                  />
                </div>
                <div className="flex flex-col items-center justify-center text-gray-700">
                  <div className="font-bold">COMPLETED PROJECTS</div>
                  <div className="font-semibold">
                    {completed_projects?.length}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="flex justify-start gap-4 mt-14">
            <ProjectStats projectData={proj} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDashboard;

{
  /* {projectCountsByYearArray?.map((item: any, index: any) => (
              <Link
                key={index}
                href={PROJECTS_PAGE}
                onClick={() => setModalLoading(true)}
              >
                <Card className="shadow-md" bordered hoverable>
                  <div className="flex gap-4">
                    <div>
                      <Image
                        src={EnimaxLogo}
                        alt="Description of the image"
                        width={65}
                        height={65}
                        priority
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center text-gray-700">
                      <div className="font-bold">FY {item.year}</div>
                      <div className="font-semibold">{item.count}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))} */
}
