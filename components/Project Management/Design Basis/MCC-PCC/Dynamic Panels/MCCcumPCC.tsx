"use client";
import { Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useLoading } from "@/hooks/useLoading";
import MCCcumPCCPLCPanel from "./MCCcumPCCPLC";
import MCCPanel from "./MCCPanel";

const MCCcumPCC = ({
  panel_id,
  setActiveKey,
}: {
  panel_id: string;
  setActiveKey: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [plcactiveKey, setPLCActiveKey] = useState<string>("1"); // Default active tab
  const { setLoading: setModalLoading } = useLoading();
  useEffect(() => {
    setModalLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TabMCC = [
    {
      label: "MCC",
      key: "1",
      children: <MCCPanel panel_id={panel_id} setActiveKey={setPLCActiveKey} />,
    },
    {
      label: "PLC",
      key: "2",
      children: (
        <MCCcumPCCPLCPanel panel_id={panel_id} setActiveKey={setActiveKey} />
      ),
    },
  ];

  const onChange = (key: string) => {
    setPLCActiveKey(key); // Update active tab
  };

  return (
    <div>
      <Tabs
        activeKey={plcactiveKey} // Set the active tab
        onChange={onChange}
        type="card"
        items={TabMCC.map((tab) => ({
          label: tab.label,
          key: tab.key,
          children: tab.children,
        }))}
      />
    </div>
  );
};

export default MCCcumPCC;
