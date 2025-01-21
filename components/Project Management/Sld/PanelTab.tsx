import {
  CloudDownloadOutlined,
  FolderOpenOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Table,
  TableColumnsType,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import React, { useMemo, Suspense, lazy, useState, useEffect } from "react";
import { getThermaxDateFormat, sortDatewise } from "@/utils/helpers";
import { SLD_REVISION_STATUS } from "@/configs/constants";
import { updateData } from "@/actions/crud-actions";
import { SLD_REVISIONS_API } from "@/configs/api-endpoints";
import { getAllSldRevisions } from "@/actions/electrical-load-list";
import { useParams } from "next/navigation";
import PanelGa from "./Panel GA/PanelGa";
import PanelSpecification from "./Panel Specification/PanelSpecification";

// Lazy load tab components
const SwitchgearSelection = lazy(
  () => import("./Switchgear Selection/SwitchgearSelection")
);
const Incomer = lazy(() => import("./Incomer/Incomer"));
const BusbarSizing = lazy(() => import("./Busbar Sizing/BusbarSizing"));

interface Props {
  panelData: any; 
  projectPanelData: any;
  designBasisRevisionId: string;
}

interface SLDRevision {
  sld_path: any;
  name: string;
  status: string;
  is_released: boolean;
  creation: string;
}

const PanelTab: React.FC<Props> = ({
  panelData, 
  projectPanelData,
  designBasisRevisionId,
}) => {
  console.log(panelData);
  
  const params = useParams();
  const [activeKey, setActiveKey] = useState<string>("1");
  const [setIntervaId, setSetIntervaId] = useState<any>(null);
  const [sldRevisionsData, setSldRevisionsData] = useState([]);
  const [isSLDInProcess, setIsSLDInProcess] = useState(false);
  const getSLDRevision = async () => {
    try {
      const response = await getAllSldRevisions(panelData?.panelId);
      // const data = response.filter(
      //   (item: any) => item.panel_name === panelData.panelName
      // );
      
      setSldRevisionsData(response);
    } catch (error) {}
  };
  useEffect(() => {
    getSLDRevision();
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
          getSLDRevision();
          // const revisionData:any = await getSLDRevision();
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
        title: () => <div className="text-center">Release</div>,
        dataIndex: "release",
        render: () => (
          <div className="text-center">
            <Button
              type="primary"
              size="small"
              name="Release"
              disabled={sldRevisionsData.some(
                (item: any) => item.status === "IN_PROCESS"
              )}
            >
              Release
            </Button>
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
      })),
    [sldRevisionsData]
  );
  useEffect(() => {
    const in_process = sldRevisionsData?.some(
      (item: any) => item.status === "IN_PROCESS"
    );
    if (in_process) {
      const interval = setInterval(async () => {
        getSLDRevision();
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
console.log(latestRevision,"latest rev");

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
          onClick={() => getSLDRevision()}
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
            sld_revision_id={latestRevision.name}
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
    </div>
  );
};

export default PanelTab;
