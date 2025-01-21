import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Table, Tooltip } from "antd";
import { useState } from "react";
import { mutate } from "swr";
import { deleteData, getData } from "@/actions/crud-actions";
import {
  DYNAMIC_DOCUMENT_API,
  MCC_PANEL,
  MCC_PCC_PLC_PANEL_1,
  MCC_PCC_PLC_PANEL_2,
  MCC_PCC_PLC_PANEL_3,
  PCC_PANEL,
  PROJECT_PANEL_API,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";
import {
  MCC_PANEL_TYPE,
  MCCcumPCC_PANEL_TYPE,
  PCC_PANEL_TYPE,
} from "@/configs/constants";
import { useGetData } from "@/hooks/useCRUD";
import { changeNameToKey, sortDatewise } from "@/utils/helpers";
import PanelFormModal from "./PanelFormModal";
import { ColumnsType } from "antd/es/table";
import { deleteDynamicPanel } from "@/actions/project/panel";

interface DataType {
  key: string;
  panel_name?: string;
  panel_sub_type?: string;
  panel_main_type?: string;
}

export default function PanelDataList({
  revision_id,
  projectMetadata,
  userDivision,
  projectDivision,
}: {
  revision_id: string;
  projectMetadata: any;
  userDivision: string;
  projectDivision: string;
}) {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [projectRow, setProjectRow] = useState<any>(null);
  const getProjectPanelDataUrl = `${PROJECT_PANEL_API}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`;
  let { data: projectPanelData } = useGetData(getProjectPanelDataUrl);

  projectPanelData = sortDatewise(projectPanelData);

  const columns: ColumnsType<DataType> = [
    {
      title: "Panel Name",
      dataIndex: "panel_name",
      key: "panel_name",
      align: "center",
    },
    {
      title: "Panel Type",
      dataIndex: "panel_sub_type",
      key: "panel_sub_type",
      align: "center",
    },
    {
      title: "Panel Main Type",
      dataIndex: "panel_main_type",
      key: "panel_main_type",
      hidden: true,
      align: "center",
    },
    {
      title: "Area of Classification",
      dataIndex: "area_of_classification",
      key: "area_of_classification",
      align: "center",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (text: string, record: any) => (
        <div className="flex justify-center gap-2">
          <Tooltip placement="top" title="Edit">
            <Button
              type="link"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEditPanel(record)}
              disabled={userDivision !== projectDivision}
            />
          </Tooltip>

          <Tooltip placement="top" title="Delete">
            <Popconfirm
              title="Are you sure to delete this panel?"
              onConfirm={async () => await handleDeletePanel(record.name)}
              okText="Yes"
              cancelText="No"
              placement="topRight"
              disabled={userDivision !== projectDivision}
            >
              <Button
                type="link"
                shape="circle"
                icon={<DeleteOutlined />}
                danger
                disabled={userDivision !== projectDivision}
              />
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];
  const handleAddPanel = () => {
    setOpen(true);
    setEditMode(false);
    setProjectRow(null);
  };

  const handleEditPanel = async (record: any) => {
    setOpen(true);
    setEditMode(true);
    setProjectRow(record);
  };

  // Helper function for handling errors
  const handleError = (error: any) => {
    try {
      const errorObj = JSON.parse(error?.message) as any;
      message.error(errorObj?.message);
    } catch (parseError) {
      console.error(parseError);
      // If parsing fails, use the raw error message
      message.error(error?.message || "An unknown error occurred");
    }
  };

  const handleDeletePanel = async (revisionId: string) => {
    try {
      await deleteDynamicPanel(revisionId);
    } catch (error) {
      handleError(error);
    } finally {
      // Revalidate the cache
      mutate(getProjectPanelDataUrl);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-800">Panel Summary</h4>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">
            Number of Panels: {projectPanelData?.length}
          </h4>
          <Button
            type="primary"
            iconPosition="start"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => handleAddPanel()}
            disabled={userDivision !== projectDivision}
          >
            Add Panel
          </Button>
        </div>
      </div>
      <PanelFormModal
        open={open}
        setOpen={setOpen}
        editMode={editMode}
        values={projectRow}
        getProjectPanelUrl={getProjectPanelDataUrl}
        revisionId={revision_id}
        projectMetadata={projectMetadata}
      />
      <Table
        columns={columns}
        dataSource={changeNameToKey(projectPanelData)}
        bordered
        size="small"
      />
    </div>
  );
}
