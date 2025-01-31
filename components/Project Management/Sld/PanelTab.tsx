import {
  CloudDownloadOutlined,
  CopyTwoTone,
  FolderOpenOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Popconfirm,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import React, {
  useMemo,
  Suspense,
  lazy,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  convertToFrappeDatetime,
  getThermaxDateFormat,
  sortDatewise,
} from "@/utils/helpers";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { updateData } from "@/actions/crud-actions";
import { PROJECT_API, SLD_REVISIONS_API } from "@/configs/api-endpoints";
import { getAllSldRevisions } from "@/actions/electrical-load-list";
import PanelGa from "./Panel GA/PanelGa";
import PanelSpecification from "./Panel Specification/PanelSpecification";
import { useGetData } from "@/hooks/useCRUD";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useParams } from "next/navigation";
import { useLoading } from "@/hooks/useLoading";
import CopyRevision from "@/components/Modal/CopyRevision";

// Lazy load tab components
const SwitchgearSelection = lazy(
  () => import("./Switchgear Selection/SwitchgearSelection")
);
const Incomer = lazy(() => import("./Incomer/Incomer"));
const BusbarSizing = lazy(() => import("./Busbar Sizing/BusbarSizing"));

interface Props {
  panelData: any;
  projectPanelData: any;
  setLastModified: (val: string) => void;
  designBasisRevisionId: string;
}

interface SLDRevision {
  sld_path: any;
  name: string;
  status: string;
  is_released: boolean;
  is_saved: boolean;
  is_copied: boolean;
  creation: string;
}

const PanelTab: React.FC<Props> = ({
  panelData,
  projectPanelData,
  setLastModified,
  designBasisRevisionId,
}) => {
  const [activeKey, setActiveKey] = useState<string>("1");
  const [setIntervaId, setSetIntervaId] = useState<any>(null);
  const [sldRevisionsData, setSldRevisionsData] = useState<any>([]);
  const [isSLDInProcess, setIsSLDInProcess] = useState(false);
  const { setLoading } = useLoading();
  const params = useParams();
  const project_id = params.project_id as string;
  const userInfo: {
    division: string;
  } = useCurrentUser();
  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);
  const [versionToCopy, setVersionToCopy] = useState(null);

  const userDivision = userInfo?.division;
  console.log(projectData, "project data");

  const projectDivision = projectData?.division;
  const getSLDRevisions = async () => {
    setLoading(true);
    try {
      const response = await getAllSldRevisions(panelData?.panelId);

      if (response.length) {
        const lastModified = convertToFrappeDatetime(
          new Date(response[0]?.modified)
        );
        setLastModified(lastModified);
      }

      setSldRevisionsData(response);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getSLDRevisions();
  }, []);

  const handleDownload = async (record: any) => {
    if (record.status === SLD_REVISION_STATUS.DEFAULT) {
      try {
        const respose = await updateData(
          `${SLD_REVISIONS_API}/${record.key}`,
          false,
          { status: SLD_REVISION_STATUS.DOWNLOAD_READY }
        );
        console.log(respose);
        message.success("SLD is Being Prepared Please Wait For A While");
        const interval = setInterval(async () => {
          getSLDRevisions();
          // const revisionData:any = await getSLDRevisions();
          // const updatedRecord = revisionData.find((r:any) => r.key === record.key); // Find the specific record by key
          // if (updatedRecord && updatedRecord.status === SLD_REVISION_STATUS.SUCCESS) {
          //   clearInterval(interval); // Stop the interval when the status is SUCCESS
          //   const link = document.createElement("a");
          //   link.href = updatedRecord.sld_path;
          //   document.body.appendChild(link);
          //   link.click();
          //   document.body.removeChild(link);
          // }
        }, 30000); // 30 seconds interval
        setIsSLDInProcess(true);
        setSetIntervaId(interval);
      } catch (error) {
      } finally {
      }
    } else if (record.status === SLD_REVISION_STATUS.SUCCESS) {
      const link = document.createElement("a");
      link.href = record.sld_path;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleClone = async (record: any) => {
    setVersionToCopy(record);
  };
  const handleRelease = useCallback(async (record: any) => {
    console.log(record);
    setLoading(true);
    try {
      if (record.is_released === 0) {
        const respose = await updateData(
          `${SLD_REVISIONS_API}/${record?.key}`,
          false,
          {
            is_released: 1,
          }
        );
      }
      message.success("Revision is Released and Locked");
      getSLDRevisions();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);
  const columns: TableColumnsType = useMemo(
    () => [
      {
        title: () => <div className="text-center">Document Name</div>,
        dataIndex: "documentName",
        align: "center",
        render: (text) => (
          <Tooltip title="Edit Revision" placement="top">
            <Button
              type="link"
              iconPosition="start"
              onClick={() => setActiveKey("2")}
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
        render: (text) => (
          <div className="text-center">
            {getThermaxDateFormat(new Date(text))}
          </div>
        ),
      },
      {
        title: () => <div className="text-center">Download</div>,
        dataIndex: "download",
        render: (text, record) => (
          <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
            <Tooltip
              title={
                record.status === SLD_REVISION_STATUS.DEFAULT
                  ? "Submit To Download"
                  : "Download"
              }
            >
              <Button
                type="link"
                shape="circle"
                disabled={sldRevisionsData.some(
                  (item: any) => item.status === "IN_PROCESS"
                )}
                icon={
                  <CloudDownloadOutlined
                    style={{
                      fontSize: "1.3rem",
                      color: "green",
                    }}
                    onClick={() => handleDownload(record)}
                  />
                }
              />
            </Tooltip>
          </div>
        ),
      },
      {
        title: () => <div className="text-center">Create New Revision</div>,
        dataIndex: "clone",
        render: (_, record) => {
          console.log(record);
          if (record.is_copied === 1) {
            return null;
          }
          console.log(record.is_released);
          console.log(userDivision !== projectDivision);
          console.log(!record.is_released || userDivision !== projectDivision);

          return (
            <div className="text-center">
              <Tooltip title={"Create New Revision"}>
                <Button
                  type="link"
                  shape="circle"
                  icon={
                    <CopyTwoTone
                      style={{
                        fontSize: "1rem",
                      }}
                    />
                  }
                  onClick={() => handleClone(record)}
                  disabled={
                    !record.is_released || userDivision !== projectDivision
                  }
                />
              </Tooltip>
            </div>
          );
        },
      },
      {
        title: () => <div className="text-center">Release</div>,
        dataIndex: "release",
        render: (_, record) => (
          // <div className="text-center">
          //   <Button
          //     type="primary"
          //     size="small"
          //     name="Release"
          //     disabled={
          //       sldRevisionsData.some(
          //         (item: any) => item.status === "IN_PROCESS"
          //       ) ||
          //       record.is_released === 1 ||
          //       userDivision !== projectDivision
          //     }
          //     onClick={() => handleRelease(record)}
          //   >
          //     Release
          //   </Button>
          // </div>

          <div className="text-center">
            <Popconfirm
              title="Are you sure to release this revision?"
              onConfirm={async () => handleRelease(record)}
              okText="Yes"
              cancelText="No"
              placement="topRight"
              disabled={
                sldRevisionsData.some(
                  (item: any) => item.status === "IN_PROCESS"
                ) ||
                record.is_released === 1 ||
                userDivision !== projectDivision
              }
            >
              <Button
                type="primary"
                size="small"
                name="Release"
                disabled={
                  record.is_released === 1 || userDivision !== projectDivision
                }
              >
                Release
              </Button>
            </Popconfirm>
          </div>
        ),
      },
    ],
    []
  );

  const dataSource = useMemo(
    () =>
      sldRevisionsData?.map((item: SLDRevision, index: number) => ({
        key: item.name,
        documentName: "SLD",
        status: item.status,
        documentRevision: `R${index}`,
        createdDate: item.creation,
        sld_path: item.sld_path,
        is_released: item.is_released,
        is_copied: item.is_copied,
        is_saved: item.is_saved,
      })),
    [sldRevisionsData]
  );
  useEffect(() => {
    const in_process = sldRevisionsData?.some(
      (item: any) => item.status === "IN_PROCESS"
    );
    if (in_process) {
      const interval = setInterval(async () => {
        getSLDRevisions();
      }, 30000);
      setSetIntervaId(interval);
    } else {
      if (setIntervaId) {
        clearInterval(setIntervaId);
        setSetIntervaId(null);
      }
      // setSetIntervaId()
    }
  }, [sldRevisionsData]);

  const latestRevision = useMemo(
    () => sortDatewise(sldRevisionsData)[0] ?? {},
    [sldRevisionsData]
  );
  console.log(latestRevision, "latest rev");

  const LoadingFallback = () => (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  const SLDRevisionTab = () => (
    <>
      <div className="text-end">
        <Button
          icon={<SyncOutlined color="#492971" />}
          onClick={() => getSLDRevisions()}
        >
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
            otherData={panelData.otherData}
            revision_id={latestRevision.name}
            setActiveTab={setActiveKey}
            setLastModified={setLastModified}
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
            setActiveTab={setActiveKey}
            setLastModified={setLastModified}
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
            revision_id={latestRevision.name}
            designBasisRevisionId={designBasisRevisionId}
            setActiveTab={setActiveKey}
            setLastModified={setLastModified}
          />
        </Suspense>
      ),
    },
    {
      label: "PANEL GA",
      key: "5",
      children: (
        <Suspense fallback={<LoadingFallback />}>
          <PanelGa
            panelData={panelData}
            projectPanelData={projectPanelData}
            sld_revision_id={latestRevision.name}
            setLastModified={setLastModified}
          />
        </Suspense>
      ),
    },
    {
      label: "PANEL SPECIFICATIONS",
      key: "6",
      children: (
        <Suspense fallback={<LoadingFallback />}>
          <PanelSpecification
            panelData={panelData}
            projectPanelData={projectPanelData}
            designBasisRevisionId={designBasisRevisionId}
            sld_revision_id={latestRevision.name}
            setLastModified={setLastModified}
          />
        </Suspense>
      ),
    },
  ];
  const onChange = (key: string) => {
    setActiveKey(key);
    localStorage.setItem("active-panels-tab", String(key));
  };

  return (
    <div>
      <Tabs
        type="card"
        activeKey={activeKey}
        onChange={onChange}
        style={{ fontSize: "11px !important" }}
        items={tabItems}
        destroyInactiveTabPane
      />
       <CopyRevision
        version={versionToCopy}
        setVersionToCopy={setVersionToCopy}
        tab={"sld_revision"}
        updateTable={async () => await getSLDRevisions()}
      />
    </div>
  );
};

export default PanelTab;
