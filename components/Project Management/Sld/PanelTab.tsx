// // import {
// //   CloudDownloadOutlined,
// //   FolderOpenOutlined,
// //   SyncOutlined,
// // } from "@ant-design/icons";
// // import { Button, Table, TableColumnsType, Tabs, Tag, Tooltip } from "antd";
// // import React from "react";
// // import { getThermaxDateFormat } from "@/utils/helpers";
// // import SwitchgearSelection from "./Switchgear Selection/SwitchgearSelection";
// // import Incomer from "./Incomer/Incomer";
// // import BusbarSizing from "./Busbar Sizing/BusbarSizing";
// // interface Props {
// //   panelData: any;
// //   sldRevisions: any;
// //   projectPanelData: any;
// //   designBasisRevisionId: string;
// // }
// // const PanelTab: React.FC<Props> = ({
// //   panelData,
// //   sldRevisions,
// //   projectPanelData,
// //   designBasisRevisionId,
// // }) => {
// //   const onChange = () => {};

// //   const columns: TableColumnsType = [
// //     {
// //       title: () => <div className="text-center">Document Name</div>,
// //       dataIndex: "documentName",
// //       align: "center",
// //       render: (text) => (
// //         <Tooltip title="Edit Revision" placement="top">
// //           <Button
// //             type="link"
// //             iconPosition="start"
// //             onClick={() => {}}
// //             icon={
// //               <FolderOpenOutlined
// //                 style={{ color: "#fef65b", fontSize: "1.2rem" }}
// //               />
// //             }
// //             disabled={false}
// //           >
// //             {text}
// //           </Button>
// //         </Tooltip>
// //       ),
// //     },
// //     {
// //       title: () => <div className="text-center">Status</div>,
// //       dataIndex: "status",
// //       render: (text) => (
// //         <div className="text-center">
// //           <Tag color="green">{text}</Tag>
// //         </div>
// //       ),
// //     },
// //     {
// //       title: () => <div className="text-center">Document Revision</div>,
// //       dataIndex: "documentRevision",
// //       render: (text) => <div className="text-center">{text}</div>,
// //     },
// //     {
// //       title: () => <div className="text-center">Created Date</div>,
// //       dataIndex: "createdDate",
// //       render: (text) => {
// //         const date = new Date(text);
// //         const stringDate = getThermaxDateFormat(date);
// //         return stringDate;
// //       },
// //     },
// //     {
// //       title: () => <div className="text-center">Download</div>,
// //       dataIndex: "download",
// //       render() {
// //         return (
// //           <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
// //             <div>
// //               <Tooltip title={"Download"}>
// //                 <Button
// //                   type="link"
// //                   shape="circle"
// //                   icon={
// //                     <CloudDownloadOutlined
// //                       style={{
// //                         fontSize: "1.3rem",
// //                         color: "green",
// //                       }}
// //                       //   spin={downloadIconSpin}
// //                     />
// //                   }
// //                   //   onClick={() => handleDownload(record?.key)}
// //                 />
// //               </Tooltip>
// //             </div>
// //           </div>
// //         );
// //       },
// //     },
// //     {
// //       title: () => <div className="text-center">Release</div>,
// //       dataIndex: "release",
// //       render: () => {
// //         return (
// //           <div className="text-center">
// //             <Button
// //               type="primary"
// //               size="small"
// //               name="Release"
// //               disabled={false}
// //               //   onClick={() => handleRelease(record.key)}
// //             >
// //               Release
// //             </Button>
// //           </div>
// //         );
// //       },
// //     },
// //   ];

// //   const dataSource = sldRevisions?.map((item: any, index: number) => ({
// //     key: item.name,
// //     documentName: "SLD",
// //     status: item.status,
// //     documentRevision: `R${index}`,
// //     createdDate: item.creation,
// //   }));
// //   console.log(panelData, "panel data ");
// //   const getLatestRevision = () => {
// //     console.log(sldRevisions,'sld rev');

// //     return sldRevisions?.find((item: any) => !item.is_released) ?? {}
// //   }

// //   const PanelTabs = [
// //     {
// //       label: "SLD REVISION",
// //       key: "1",
// //       children: (
// //         <>
// //           <div className="text-end">
// //             <Button icon={<SyncOutlined color="#492971" />} onClick={() => {}}>
// //               {" "}
// //               Refresh
// //             </Button>
// //           </div>

// //           <div className="mt-2">
// //             <Table columns={columns} dataSource={dataSource} size="small" />
// //           </div>
// //         </>
// //       ),
// //     },
// //     {
// //       label: "SWITCHGEAR SELECTION",
// //       key: "2",
// //       children: (
// //         <SwitchgearSelection
// //           designBasisRevisionId={designBasisRevisionId}
// //           data={panelData.data}
// //           revision_id={getLatestRevision().name}
// //         />
// //       ),
// //     },
// //     {
// //       label: "INCOMER",
// //       key: "3",
// //       children: (
// //         <Incomer
// //           designBasisRevisionId={designBasisRevisionId}
// //           panelData={panelData}
// //           projectPanelData={projectPanelData}
// //           revision_id={getLatestRevision().name}
// //         />
// //       ),
// //     },
// //     {
// //       label: "BUSBAR/ENCLOSURE SIZING",
// //       key: "4",
// //       children: <BusbarSizing designBasisRevisionId={designBasisRevisionId} />,
// //     },
// //     {
// //       label: "PANEL GA",
// //       key: "5",
// //       children: <h2>PANEL GA</h2>,
// //     },
// //     {
// //       label: "PANEL SPECIFICATIONS",
// //       key: "6",
// //       children: <h2>PANEL SPECIFICATIONS</h2>,
// //     },
// //   ];

// //   return (
// //     <div className="">
// //       <Tabs
// //         onChange={onChange}
// //         type="card"
// //         style={{ fontSize: "11px !important" }}
// //         items={PanelTabs}
// //       />
// //     </div>
// //   );
// // };

// // export default PanelTab;

// import {
//   CloudDownloadOutlined,
//   FolderOpenOutlined,
//   SyncOutlined,
// } from "@ant-design/icons";
// import {
//   Button,
//   message,
//   Table,
//   TableColumnsType,
//   Tabs,
//   Tag,
//   Tooltip,
// } from "antd";
// import React, { useMemo, Suspense, lazy, useState } from "react";
// import { getThermaxDateFormat } from "@/utils/helpers";
// import { downloadFile } from "@/actions/crud-actions";

// // Lazy load tab components
// const SwitchgearSelection = lazy(
//   () => import("./Switchgear Selection/SwitchgearSelection")
// );
// const Incomer = lazy(() => import("./Incomer/Incomer"));
// const BusbarSizing = lazy(() => import("./Busbar Sizing/BusbarSizing"));

// interface Props {
//   panelData: any;
//   sldRevisions: any[];
//   projectPanelData: any;
//   designBasisRevisionId: string;
// }

// interface SLDRevision {
//   name: string;
//   status: string;
//   is_released: boolean;
//   creation: string;
//   sld_path: string;
// }

// const PanelTab: React.FC<Props> = ({
//   panelData,
//   sldRevisions = [],
//   projectPanelData,
//   designBasisRevisionId,
// }) => {
//   const [downloadIconSpin, setDownloadIconSpin] = useState(false);

//   // const handleDownload = async (revision_id: string) => {
//   //   setDownloadIconSpin(true);

//   //   try {
//   //     // const result = await downloadFile(GET_DESIGN_BASIS_EXCEL_API, true, {
//   //     //   revision_id,
//   //     // });

//   //     const byteArray = new Uint8Array(result?.data?.data); // Convert the array into a Uint8Array
//   //     const excelBlob = new Blob([byteArray.buffer], {
//   //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   //     });
//   //     const url = window.URL.createObjectURL(excelBlob);
//   //     const link = document.createElement("a");
//   //     link.href = url;
//   //     const document_revision_length =
//   //       revisionHistory.length > 0 ? revisionHistory.length : 0;
//   //     link.setAttribute(
//   //       "download",
//   //       `Design_Basis_${projectData?.project_oc_number}_R${
//   //         document_revision_length - 1
//   //       }.xlsx`
//   //     ); // Filename
//   //     document.body.appendChild(link);
//   //     link.click();
//   //     document.body.removeChild(link);
//   //   } catch (error) {
//   //     message.error("Error processing Excel file");
//   //     console.error("Error processing Excel file:", error);
//   //   }

//   //   setDownloadIconSpin(false);
//   // };
//   const handleDownload = async (path: any) => {
//     // setDownloading(true);
//     // setStatus('');

//     try {
//       console.log(path);

//       const response = await fetch(path);

//       if (!response.ok) {
//         throw new Error("Download failed");
//       }

//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = "TBD_SLD_R0.zip";

//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);

//       // setStatus('success');
//     } catch (error) {
//       console.error("Download error:", error);
//       // setStatus('error');
//     } finally {
//       // setDownloading(false);
//     }
//   };
//   const columns: TableColumnsType = useMemo(
//     () => [
//       {
//         title: () => <div className="text-center">Document Name</div>,
//         dataIndex: "documentName",
//         align: "center",
//         render: (text) => (
//           <Tooltip title="Edit Revision" placement="top">
//             <Button
//               type="link"
//               iconPosition="start"
//               onClick={() => {}}
//               icon={
//                 <FolderOpenOutlined
//                   style={{ color: "#fef65b", fontSize: "1.2rem" }}
//                 />
//               }
//             >
//               {text}
//             </Button>
//           </Tooltip>
//         ),
//       },
//       {
//         title: () => <div className="text-center">Status</div>,
//         dataIndex: "status",
//         render: (text) => (
//           <div className="text-center">
//             <Tag color="green">{text}</Tag>
//           </div>
//         ),
//       },
//       {
//         title: () => <div className="text-center">Document Revision</div>,
//         dataIndex: "documentRevision",
//         render: (text) => <div className="text-center">{text}</div>,
//       },
//       {
//         title: () => <div className="text-center">Created Date</div>,
//         dataIndex: "createdDate",
//         render: (text) => getThermaxDateFormat(new Date(text)),
//       },
//       {
//         title: () => <div className="text-center">Download</div>,
//         dataIndex: "download",
//         render: (text, record) => (
//           <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
//             <Tooltip title="Download">
//               <Button
//                 type="link"
//                 shape="circle"
//                 onClick={() => handleDownload(record.path)}
//                 icon={
//                   <CloudDownloadOutlined
//                     style={{
//                       fontSize: "1.3rem",
//                       color: "green",
//                     }}
//                   />
//                 }
//               />
//             </Tooltip>
//           </div>
//         ),
//       },
//       {
//         title: () => <div className="text-center">Release</div>,
//         dataIndex: "release",
//         render: () => (
//           <div className="text-center">
//             <Button type="primary" size="small" name="Release">
//               Release
//             </Button>
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   console.log(panelData);
//   const dataSource = useMemo(
//     () =>
//       sldRevisions?.map((item: SLDRevision, index: number) => ({
//         key: item.name,
//         documentName: "SLD",
//         status: item.status,
//         documentRevision: `R${index}`,
//         createdDate: item.creation,
//         path: item.sld_path,
//       })),
//     [sldRevisions]
//   );

//   const latestRevision = useMemo(
//     () => sldRevisions?.find((item: SLDRevision) => !item.is_released) ?? {},
//     [sldRevisions]
//   );

//   const LoadingFallback = () => (
//     <div className="flex justify-center items-center h-32">
//       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//     </div>
//   );

//   const SLDRevisionTab = () => (
//     <>
//       <div className="text-end">
//         <Button icon={<SyncOutlined color="#492971" />}>Refresh</Button>
//       </div>
//       <div className="mt-2">
//         <Table columns={columns} dataSource={dataSource} size="small" />
//       </div>
//     </>
//   );

//   const tabItems = [
//     {
//       label: "SLD REVISION",
//       key: "1",
//       children: <SLDRevisionTab />,
//     },
//     {
//       label: "SWITCHGEAR SELECTION",
//       key: "2",
//       children: (
//         <Suspense fallback={<LoadingFallback />}>
//           <SwitchgearSelection
//             designBasisRevisionId={designBasisRevisionId}
//             data={panelData.data}
//             otherData={panelData.otherData}
//             revision_id={latestRevision.name}
//           />
//         </Suspense>
//       ),
//     },
//     {
//       label: "INCOMER",
//       key: "3",
//       children: (
//         <Suspense fallback={<LoadingFallback />}>
//           <Incomer
//             designBasisRevisionId={designBasisRevisionId}
//             panelData={panelData}
//             projectPanelData={projectPanelData}
//             revision_id={latestRevision.name}
//           />
//         </Suspense>
//       ),
//     },
//     {
//       label: "BUSBAR/ENCLOSURE SIZING",
//       key: "4",
//       children: (
//         <Suspense fallback={<LoadingFallback />}>
//           <BusbarSizing designBasisRevisionId={designBasisRevisionId} />
//         </Suspense>
//       ),
//     },
//     {
//       label: "PANEL GA",
//       key: "5",
//       children: <h2>PANEL GA</h2>,
//     },
//     {
//       label: "PANEL SPECIFICATIONS",
//       key: "6",
//       children: <h2>PANEL SPECIFICATIONS</h2>,
//     },
//   ];

//   return (
//     <div>
//       <Tabs
//         type="card"
//         style={{ fontSize: "11px !important" }}
//         items={tabItems}
//         destroyInactiveTabPane
//       />
//     </div>
//   );
// };

// export default PanelTab;













// import {
//   CloudDownloadOutlined,
//   FolderOpenOutlined,
//   SyncOutlined,
// } from "@ant-design/icons";
// import { Button, Table, TableColumnsType, Tabs, Tag, Tooltip } from "antd";
// import React from "react";
// import { getThermaxDateFormat } from "@/utils/helpers";
// import SwitchgearSelection from "./Switchgear Selection/SwitchgearSelection";
// import Incomer from "./Incomer/Incomer";
// import BusbarSizing from "./Busbar Sizing/BusbarSizing";
// interface Props {
//   panelData: any;
//   sldRevisions: any;
//   projectPanelData: any;
//   designBasisRevisionId: string;
// }
// const PanelTab: React.FC<Props> = ({
//   panelData,
//   sldRevisions,
//   projectPanelData,
//   designBasisRevisionId,
// }) => {
//   const onChange = () => {};

//   const columns: TableColumnsType = [
//     {
//       title: () => <div className="text-center">Document Name</div>,
//       dataIndex: "documentName",
//       align: "center",
//       render: (text) => (
//         <Tooltip title="Edit Revision" placement="top">
//           <Button
//             type="link"
//             iconPosition="start"
//             onClick={() => {}}
//             icon={
//               <FolderOpenOutlined
//                 style={{ color: "#fef65b", fontSize: "1.2rem" }}
//               />
//             }
//             disabled={false}
//           >
//             {text}
//           </Button>
//         </Tooltip>
//       ),
//     },
//     {
//       title: () => <div className="text-center">Status</div>,
//       dataIndex: "status",
//       render: (text) => (
//         <div className="text-center">
//           <Tag color="green">{text}</Tag>
//         </div>
//       ),
//     },
//     {
//       title: () => <div className="text-center">Document Revision</div>,
//       dataIndex: "documentRevision",
//       render: (text) => <div className="text-center">{text}</div>,
//     },
//     {
//       title: () => <div className="text-center">Created Date</div>,
//       dataIndex: "createdDate",
//       render: (text) => {
//         const date = new Date(text);
//         const stringDate = getThermaxDateFormat(date);
//         return stringDate;
//       },
//     },
//     {
//       title: () => <div className="text-center">Download</div>,
//       dataIndex: "download",
//       render() {
//         return (
//           <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
//             <div>
//               <Tooltip title={"Download"}>
//                 <Button
//                   type="link"
//                   shape="circle"
//                   icon={
//                     <CloudDownloadOutlined
//                       style={{
//                         fontSize: "1.3rem",
//                         color: "green",
//                       }}
//                       //   spin={downloadIconSpin}
//                     />
//                   }
//                   //   onClick={() => handleDownload(record?.key)}
//                 />
//               </Tooltip>
//             </div>
//           </div>
//         );
//       },
//     },
//     {
//       title: () => <div className="text-center">Release</div>,
//       dataIndex: "release",
//       render: () => {
//         return (
//           <div className="text-center">
//             <Button
//               type="primary"
//               size="small"
//               name="Release"
//               disabled={false}
//               //   onClick={() => handleRelease(record.key)}
//             >
//               Release
//             </Button>
//           </div>
//         );
//       },
//     },
//   ];

//   const dataSource = sldRevisions?.map((item: any, index: number) => ({
//     key: item.name,
//     documentName: "SLD",
//     status: item.status,
//     documentRevision: `R${index}`,
//     createdDate: item.creation,
//   }));
//   console.log(panelData, "panel data ");
//   const getLatestRevision = () => {
//     console.log(sldRevisions,'sld rev');
    
//     return sldRevisions?.find((item: any) => !item.is_released) ?? {}
//   }

//   const PanelTabs = [
//     {
//       label: "SLD REVISION",
//       key: "1",
//       children: (
//         <>
//           <div className="text-end">
//             <Button icon={<SyncOutlined color="#492971" />} onClick={() => {}}>
//               {" "}
//               Refresh
//             </Button>
//           </div>

//           <div className="mt-2">
//             <Table columns={columns} dataSource={dataSource} size="small" />
//           </div>
//         </>
//       ),
//     },
//     {
//       label: "SWITCHGEAR SELECTION",
//       key: "2",
//       children: (
//         <SwitchgearSelection
//           designBasisRevisionId={designBasisRevisionId}
//           data={panelData.data}
//           revision_id={getLatestRevision().name}
//         />
//       ),
//     },
//     {
//       label: "INCOMER",
//       key: "3",
//       children: (
//         <Incomer
//           designBasisRevisionId={designBasisRevisionId}
//           panelData={panelData}
//           projectPanelData={projectPanelData}
//           revision_id={getLatestRevision().name}
//         />
//       ),
//     },
//     {
//       label: "BUSBAR/ENCLOSURE SIZING",
//       key: "4",
//       children: <BusbarSizing designBasisRevisionId={designBasisRevisionId} />,
//     },
//     {
//       label: "PANEL GA",
//       key: "5",
//       children: <h2>PANEL GA</h2>,
//     },
//     {
//       label: "PANEL SPECIFICATIONS",
//       key: "6",
//       children: <h2>PANEL SPECIFICATIONS</h2>,
//     },
//   ];

//   return (
//     <div className="">
//       <Tabs
//         onChange={onChange}
//         type="card"
//         style={{ fontSize: "11px !important" }}
//         items={PanelTabs}
//       />
//     </div>
//   );
// };

// export default PanelTab;



import {
  CloudDownloadOutlined,
  FolderOpenOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, Table, TableColumnsType, Tabs, Tag, Tooltip } from "antd";
import React, { useMemo, Suspense, lazy } from "react";
import { getThermaxDateFormat } from "@/utils/helpers";

// Lazy load tab components
const SwitchgearSelection = lazy(() => import("./Switchgear Selection/SwitchgearSelection"));
const Incomer = lazy(() => import("./Incomer/Incomer"));
const BusbarSizing = lazy(() => import("./Busbar Sizing/BusbarSizing"));

interface Props {
  panelData: any;
  sldRevisions: any[];
  projectPanelData: any;
  designBasisRevisionId: string;
}

interface SLDRevision {
  name: string;
  status: string;
  is_released: boolean;
  creation: string;
}

const PanelTab: React.FC<Props> = ({
  panelData,
  sldRevisions = [],
  projectPanelData,
  designBasisRevisionId,
}) => {
  const columns: TableColumnsType = useMemo(() => [
    {
      title: () => <div className="text-center">Document Name</div>,
      dataIndex: "documentName",
      align: "center",
      render: (text) => (
        <Tooltip title="Edit Revision" placement="top">
          <Button
            type="link"
            iconPosition="start"
            onClick={() => {}}
            icon={
              <FolderOpenOutlined
                style={{ color: "#fef65b", fontSize: "1.2rem" }}
              />
            }
          >
            {text}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: () => <div className="text-center">Status</div>,
      dataIndex: "status",
      render: (text) => (
        <div className="text-center">
          <Tag color="green">{text}</Tag>
        </div>
      ),
    },
    {
      title: () => <div className="text-center">Document Revision</div>,
      dataIndex: "documentRevision",
      render: (text) => <div className="text-center">{text}</div>,
    },
    {
      title: () => <div className="text-center">Created Date</div>,
      dataIndex: "createdDate",
      render: (text) => getThermaxDateFormat(new Date(text)),
    },
    {
      title: () => <div className="text-center">Download</div>,
      dataIndex: "download",
      render: () => (
        <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
          <Tooltip title="Download">
            <Button
              type="link"
              shape="circle"
              icon={
                <CloudDownloadOutlined
                  style={{
                    fontSize: "1.3rem",
                    color: "green",
                  }}
                />
              }
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: () => <div className="text-center">Release</div>,
      dataIndex: "release",
      render: () => (
        <div className="text-center">
          <Button
            type="primary"
            size="small"
            name="Release"
          >
            Release
          </Button>
        </div>
      ),
    },
  ], []);

  const dataSource = useMemo(() => 
    sldRevisions?.map((item: SLDRevision, index: number) => ({
      key: item.name,
      documentName: "SLD",
      status: item.status,
      documentRevision: `R${index}`,
      createdDate: item.creation,
    })),
    [sldRevisions]
  );

  const latestRevision = useMemo(() => 
    sldRevisions?.find((item: SLDRevision) => !item.is_released) ?? {},
    [sldRevisions]
  );

  const LoadingFallback = () => (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  const SLDRevisionTab = () => (
    <>
      <div className="text-end">
        <Button icon={<SyncOutlined color="#492971" />}>
          Refresh
        </Button>
      </div>
      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
    </>
  );

  const tabItems = [
    {
      label: "SLD REVISION",
      key: "1",
      children: <SLDRevisionTab />,
    },
    {
      label: "SWITCHGEAR SELECTION",
      key: "2",
      children: (
        <Suspense fallback={<LoadingFallback />}>
          <SwitchgearSelection
            designBasisRevisionId={designBasisRevisionId}
            data={panelData.data}
            revision_id={latestRevision.name}
          />
        </Suspense>
      ),
    },
    {
      label: "INCOMER",
      key: "3",
      children: (
        <Suspense fallback={<LoadingFallback />}>
          <Incomer
            designBasisRevisionId={designBasisRevisionId}
            panelData={panelData}
            projectPanelData={projectPanelData}
            revision_id={latestRevision.name}
          />
        </Suspense>
      ),
    },
    {
      label: "BUSBAR/ENCLOSURE SIZING",
      key: "4",
      children: (
        <Suspense fallback={<LoadingFallback />}>
          <BusbarSizing 
            designBasisRevisionId={designBasisRevisionId}
          />
        </Suspense>
      ),
    },
    {
      label: "PANEL GA",
      key: "5",
      children: <h2>PANEL GA</h2>,
    },
    {
      label: "PANEL SPECIFICATIONS",
      key: "6",
      children: <h2>PANEL SPECIFICATIONS</h2>,
    },
  ];

  return (
    <div>
      <Tabs
        type="card"
        style={{ fontSize: "11px !important" }}
        items={tabItems}
        destroyInactiveTabPane
      />
    </div>
  );
};

export default PanelTab;