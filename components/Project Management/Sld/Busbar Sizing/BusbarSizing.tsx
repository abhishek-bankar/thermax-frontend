import React, { useCallback, useEffect, useState } from "react";
import { Form, InputNumber, Card, Button, Select, message, Spin } from "antd";
import { getData, updateData } from "@/actions/crud-actions";
import { useParams } from "next/navigation";
import {
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  PROJECT_INFO_API,
  SLD_REVISIONS_API,
} from "@/configs/api-endpoints";
import { getBusbarSizingCalculations } from "@/actions/sld";
import { useLoading } from "@/hooks/useLoading";
import { convertToFrappeDatetime } from "@/utils/helpers";

const useDataFetching = (
  designBasisRevisionId: string,
  revision_id: string
) => {
  const [isLoading, setIsLoading] = useState(true);
  // const [sg_data, setSg_data] = useState<any>([]);
  const [commonConfig, setCommonConfig] = useState<any>([]);
  const [busbarSizingData, setBusbarSizingData] = useState<any>([]);
  const [projectInfo, setProjectInfo] = useState<any>([]);
  // const [totalCountOfItems, setTotalCountOfItems] = useState<number>(0);
  const params = useParams();
  const project_id = params.project_id;
  const getProjectInfoUrl = `${PROJECT_INFO_API}/${project_id}`;

  // const [projectPanelData, setProjectPanelData] = useState<any>([]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectInfo = await getData(getProjectInfoUrl);
      // Fetch all required data in parallel
      const commonConfigData1 = await getData(
        `${COMMON_CONFIGURATION_1}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const commonConfigData2 = await getData(
        `${COMMON_CONFIGURATION_2}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );

      const commonConfigData3 = await getData(
        `${COMMON_CONFIGURATION_3}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const sld_data = await getData(`${SLD_REVISIONS_API}/${revision_id}`);

      const commonConfig = {
        ...commonConfigData1?.[0],
        ...commonConfigData2?.[0],
        ...commonConfigData3?.[0],
      };

      console.log(sld_data, "commonConfig");
      setBusbarSizingData(sld_data?.busbar_sizing_data[0]);
      setProjectInfo(projectInfo);
      setCommonConfig(commonConfig);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [designBasisRevisionId, getProjectInfoUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    totalCountOfItems: 0,
    busbarSizingData,
    projectInfo,
    projectPanelData: [],
    sg_data: [],
    commonConfig,
    isLoading,
  };
};

interface Props {
  revision_id: string;
  designBasisRevisionId: string;
  setActiveTab: any;
  setLastModified: any;
}
const BusbarSizing: React.FC<Props> = ({
  designBasisRevisionId,
  setActiveTab,
  revision_id,
  setLastModified,
}) => {
  const [form] = Form.useForm();
  const { projectInfo, busbarSizingData, commonConfig, isLoading } =
    useDataFetching(designBasisRevisionId, revision_id);
  const { setLoading } = useLoading();

  const onSubmit = async (values: any) => {
    console.log("Received values:", values);

    const {
      fault_current,
      maximum_temperature_during_fault,
      operating_temperature,
      fault_duration,
      ambient_temperature,
      maximum_busbar_temperature_rise,
      material,
      material_constant,
      enclosure_height,
      enclosure_depth,
      enclosure_horizontal_busbar_chamber_height,
      enclosure_horizontal_cable_chamber_height,
      enclosure_vertical_busbar_chamber_width,
      enclosure_vertical_cable_chamber_width,
    } = values;
    const payload = {
      busbar_sizing_data: [
        {
          fault_current,
          fault_duration,

          operating_temperature,
          maximum_temperature_during_fault,
          ambient_temperature,
          maximum_busbar_temperature_rise,

          material,
          material_constant,
          enclosure_height,
          enclosure_depth,
          enclosure_horizontal_busbar_chamber_height,
          enclosure_horizontal_cable_chamber_height,
          enclosure_vertical_busbar_chamber_width,
          enclosure_vertical_cable_chamber_width,
          busbar_size: "",
        },
      ],
    };
    try {
      setLoading(true);

      const response = await updateData(
        `${SLD_REVISIONS_API}/${revision_id}`,
        false,
        payload
      );
      setLoading(false);
      if (response) {
        const lastModified = convertToFrappeDatetime(
          new Date(response?.modified)
        );
        setLastModified(lastModified);
      }
      // setLastModified
      message.success("Busbar/Enclouser Sizing Saved");
    } catch (error) {
      message.error("Unable to save Busbar/Enclouser Sizing");

      setLoading(false);
    } finally {
      setLoading(false);
    }
    console.log(payload, "payload");
  };
  useEffect(() => {
    if (busbarSizingData) {
      form.setFieldsValue({
        fault_current: busbarSizingData.fault_current,
        fault_duration: busbarSizingData.fault_duration,

        operating_temperature: busbarSizingData.operating_temperature,
        maximum_temperature_during_fault:
          busbarSizingData.maximum_temperature_during_fault,
        ambient_temperature: busbarSizingData.ambient_temperature,
        maximum_busbar_temperature_rise:
          busbarSizingData.maximum_busbar_temperature_rise,

        material: busbarSizingData.material,
        material_constant: busbarSizingData.material_constant,
        enclosure_height: busbarSizingData.enclosure_height,
        enclosure_depth: busbarSizingData.enclosure_depth,
        enclosure_horizontal_busbar_chamber_height:
          busbarSizingData.enclosure_horizontal_busbar_chamber_height,
        enclosure_horizontal_cable_chamber_height:
          busbarSizingData.enclosure_horizontal_cable_chamber_height,
        enclosure_vertical_busbar_chamber_width:
          busbarSizingData.enclosure_vertical_busbar_chamber_width,
        enclosure_vertical_cable_chamber_width:
          busbarSizingData.enclosure_vertical_cable_chamber_width,
        busbar_size: busbarSizingData.busbar_size,
      });
      return;
    }
    if (projectInfo && commonConfig) {
      const material_constant = commonConfig
        ? commonConfig?.power_bus_current_density?.split(" ")[0]
        : 0;
      form.setFieldsValue({
        fault_current: projectInfo.fault_level,
        fault_duration: projectInfo.sec,
        operating_temperature: projectInfo.electrical_design_temperature,
        maximum_temperature_during_fault:
          projectInfo.maximum_temperature_during_fault,
        ambient_temperature: projectInfo.ambient_temperature_max,

        material: commonConfig.power_bus_material,
        material_constant: material_constant, // current density power bus

        // // Enclosure Details
        // enclosure_height: projectInfo.height,
        // enclosure_depth: projectInfo.depth,
        // enclosure_horizontal_busbar_chamber_height: projectInfo.horizontalBusbarHeight,
        // enclosure_horizontal_cable_chamber_height: projectInfo.horizontalCableHeight,
        // enclosure_vertical_busbar_chamber_width: projectInfo.enclosure_vertical_busbar_chamber_width,
        // enclosure_vertical_cable_chamber_width: projectInfo.enclosure_vertical_cable_chamber_width,
      });
    }
  }, [projectInfo, commonConfig, form, busbarSizingData]);
  const handleCalculateBusbarSizing = async () => {
    // console.log(form);
    let data;
    form
      .validateFields()
      .then((values) => {
        // console.log("Form Values:", values);
        data = values;
      })
      .catch((error) => {
        // console.log("Validation Failed:", error);
        message.error("Please enter all fields");
      });
    // if (data) {
    const res = await getBusbarSizingCalculations();
    // }
  };
  return (
    <>
      {isLoading ? (
        <div className="flex h-[550px] items-center justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl p-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            //   {...formItemLayout}
            className="space-y-4"
          >
            {/* Fault Current Details */}
            <Card title="Fault Current Details" className="shadow-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label="Fault Current (kA)"
                  name="fault_current"
                  rules={[
                    { required: true, message: "Please enter fault current!" },
                  ]}
                >
                  <InputNumber min={0} disabled className="!w-full" />
                </Form.Item>
                <Form.Item
                  label="Fault Duration (Sec.)"
                  name="fault_duration"
                  rules={[
                    { required: true, message: "Please enter fault duration!" },
                  ]}
                >
                  <InputNumber min={0} disabled className="!w-full" />
                </Form.Item>
              </div>
            </Card>

            {/* Temperature Details */}
            <Card title="Temperature Details" className="shadow-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label="Operating Temperature (Deg C)"
                  name="operating_temperature"
                  rules={[
                    {
                      required: true,
                      message: "Please enter operating temperature!",
                    },
                  ]}
                >
                  <InputNumber min={0} disabled className="!w-full" />
                </Form.Item>
                <Form.Item
                  label="Max. Temperature during fault (Deg C)"
                  name="maximum_temperature_during_fault"
                  rules={[
                    {
                      required: true,
                      message: "Please enter max temperature!",
                    },
                  ]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
                <Form.Item
                  label="Ambient Temperature (Deg C)"
                  name="ambient_temperature"
                  rules={[
                    {
                      required: true,
                      message: "Please enter ambient temperature!",
                    },
                  ]}
                >
                  <InputNumber min={0} disabled className="!w-full" />
                </Form.Item>
                <Form.Item
                  label="Max. Busbar Temperature rise (Deg C)"
                  name="maximum_busbar_temperature_rise"
                  rules={[
                    {
                      required: true,
                      message: "Please enter max busbar temperature!",
                    },
                  ]}
                >
                  <InputNumber min={0} className="!w-full" />
                </Form.Item>
              </div>
            </Card>

            {/* Material Details */}
            <Card title="Material Details" className="shadow-sm">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Form.Item
                  label="Material"
                  name="material"
                  rules={[
                    { required: true, message: "Please select material!" },
                  ]}
                >
                  <Select
                    placeholder="Select material"
                    disabled
                    className="!w-full"
                  >
                    <Select.Option value="copper">Copper</Select.Option>
                    <Select.Option value="aluminum">Aluminum</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Material Constant"
                  name="material_constant"
                  rules={[
                    {
                      required: true,
                      message: "Please enter material constant!",
                    },
                  ]}
                >
                  <InputNumber min={0} disabled className="!w-full" />
                </Form.Item>
              </div>
            </Card>

            {/* Enclosure Details */}
            <Card title="Enclosure Details" className="shadow-sm">
              <div className="space-y-6">
                {/* Overall Dimensions */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Form.Item
                    label="Height (mm)"
                    name="enclosure_height"
                    rules={[
                      { required: true, message: "Please enter height!" },
                    ]}
                  >
                    <InputNumber min={0} className="!w-full" />
                  </Form.Item>
                  <Form.Item
                    label="Depth (mm)"
                    name="enclosure_depth"
                    rules={[{ required: true, message: "Please enter depth!" }]}
                  >
                    <InputNumber min={0} className="!w-full" />
                  </Form.Item>
                </div>

                {/* Chamber Dimensions */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Form.Item
                    label="Horizontal Busbar Chamber Height (mm)"
                    name="enclosure_horizontal_busbar_chamber_height"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter horizontal busbar chamber height!",
                      },
                    ]}
                  >
                    <InputNumber min={0} className="!w-full" />
                  </Form.Item>
                  <Form.Item
                    label="Horizontal Cable Chamber Height (mm)"
                    name="enclosure_horizontal_cable_chamber_height"
                    rules={[
                      {
                        required: true,
                        message:
                          "Please enter horizontal cable chamber height!",
                      },
                    ]}
                  >
                    <InputNumber min={0} className="!w-full" />
                  </Form.Item>
                  <Form.Item
                    label="Vertical Busbar Chamber Width (mm)"
                    name="enclosure_vertical_busbar_chamber_width"
                    rules={[
                      {
                        required: true,
                        message: "Please enter vertical busbar chamber width!",
                      },
                    ]}
                  >
                    <InputNumber min={0} className="!w-full" />
                  </Form.Item>
                  <Form.Item
                    label="Vertical Cable Chamber Width (mm)"
                    name="enclosure_vertical_cable_chamber_width"
                    rules={[
                      {
                        required: true,
                        message: "Please enter vertical cable chamber width!",
                      },
                    ]}
                  >
                    <InputNumber min={0} className="!w-full" />
                  </Form.Item>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                htmlType="button"
                onClick={handleCalculateBusbarSizing}
              >
                Calculate Busbar Sizing
              </Button>
              <Button type="primary" htmlType="button">
                Download Busbar Sizing
              </Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={() => setActiveTab("1")}
              >
                Next
              </Button>
            </div>
          </Form>
        </div>
      )}
    </>
  );
};

export default BusbarSizing;
