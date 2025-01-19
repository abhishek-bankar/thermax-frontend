import { Button, Popconfirm, Table, Tooltip, message } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import type { TableColumnsType } from "antd";
import AddIncomer from "./Add Incomer/AddIncomer";
import { SLD_REVISIONS_API } from "@/configs/api-endpoints";
import { getData, updateData } from "@/actions/crud-actions";
import { DeleteOutlined } from "@ant-design/icons";

interface Props {
  designBasisRevisionId: string;
  revision_id: string;
  panelData: any;
  projectPanelData: any;
  setActiveTab: any;
}

interface IncomerData {
  key: string;
  model_number: string;
  rating: string;
  type: string;
  description: string;
  quantity: string;
}

const Incomer: React.FC<Props> = ({
  designBasisRevisionId,
  projectPanelData,
  panelData,
  revision_id,
  setActiveTab,
}) => {
  const [isAddMainsIncomerOpen, setIsAddMainsIncomerOpen] =
    useState<boolean>(false);
  const [incomers, setIncomers] = useState<IncomerData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getPanelType = () => {
    return projectPanelData?.find(
      (item: any) => item.panel_name === panelData.panelName
    );
  };

  const columns: TableColumnsType<IncomerData> = [
    {
      title: "Model Number",
      dataIndex: "model_number",
      key: "model_number",
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 100,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 120,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Tooltip placement="top" title="Remove">
          <Popconfirm
            title="Are you sure to remove this incomer?"
            onConfirm={async () =>
              await handleRemoveIncomer(record.model_number)
            }
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button
              type="link"
              shape="circle"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Tooltip>
      ),
    },
  ];

  const fetchIncomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getData(`${SLD_REVISIONS_API}/${revision_id}`);

      const incomersWithKeys = response.incomer_data.map(
        (incomer: IncomerData) => ({
          ...incomer,
          key: incomer.model_number,
        })
      );

      setIncomers(incomersWithKeys);
    } catch (error) {
      message.error("Failed to fetch incomers");
    } finally {
      setLoading(false);
    }
  }, [revision_id, setLoading, setIncomers]);

  const handleRemoveIncomer = async (key: string) => {
    try {
      const payload = {
        incomer_data: incomers.filter(
          (incomer: any) => incomer.model_number !== key
        ),
      };
      await updateData(`${SLD_REVISIONS_API}/${revision_id}`, false, payload);
      message.success("Incomer removed successfully");
      fetchIncomers();
    } catch (error) {
      message.error("Failed to remove incomer");
    }
  };

  useEffect(() => {
    fetchIncomers();
  }, [fetchIncomers]);

  useEffect(() => {
    if (!isAddMainsIncomerOpen) {
      fetchIncomers();
    }
  }, [fetchIncomers, isAddMainsIncomerOpen]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Incomers</h2>
        <div className="flex gap-4">
          <Button
            type="primary"
            onClick={() => setIsAddMainsIncomerOpen(true)}
            className="hover:bg-blue-600"
            disabled={Boolean(incomers?.length)}
          >
            Add Mains Incomer
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={incomers}
        loading={loading}
        pagination={false}
        className="border rounded-lg shadow-sm"
        scroll={{ x: true }}
      />

      <div className="flex w-full flex-row justify-end gap-2">
        <Button
          type="primary"
          onClick={() => message.success("Incomer Data Saved")}
        >
          Save
        </Button>
        <Button type="primary" onClick={() => setActiveTab("4")}>
          Next
        </Button>
      </div>
      {isAddMainsIncomerOpen && (
        <AddIncomer
          panelType={getPanelType().panel_main_type}
          revision_id={getPanelType().revision_id}
          panel_id={getPanelType().name}
          onClose={() => setIsAddMainsIncomerOpen(false)}
          isOpen={isAddMainsIncomerOpen}
          panelData={panelData.data}
          sld_revision_id={revision_id}
          designBasisRevisionId={designBasisRevisionId}
          incomers={incomers}
        />
      )}
    </div>
  );
};

export default Incomer;
