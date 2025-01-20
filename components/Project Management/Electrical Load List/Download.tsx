"use client";
import {
  CloudDownloadOutlined,
  CopyTwoTone,
  FolderOpenOutlined,
  SaveTwoTone,
  SyncOutlined,
} from "@ant-design/icons";
import { downloadFile, getData, updateData } from "@/actions/crud-actions";
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
import {
  CABLE_SCHEDULE_REVISION_HISTORY_API,
  COMMON_CONFIGURATION_1,
  COMMON_CONFIGURATION_2,
  COMMON_CONFIGURATION_3,
  ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API,
  GET_CABLE_SCHEDULE_EXCEL_API,
  GET_ISOLATOR_EXCEL_API,
  GET_LOAD_LIST_EXCEL_API,
  GET_LPBS_SPECS_EXCEL_API,
  GET_MOTOR_SPECS_EXCEL_API,
  LBPS_SPECIFICATIONS_REVISION_HISTORY_API,
  LOCAL_ISOLATOR_REVISION_HISTORY_API,
  LPBS_SCHEMES_URI,
  MOTOR_CANOPY_REVISION_HISTORY_API,
  MOTOR_PARAMETER_API,
  MOTOR_SPECIFICATIONS_REVISION_HISTORY_API,
  PROJECT_API,
  PROJECT_MAIN_PKG_LIST_API,
  STATIC_DOCUMENT_API,
} from "@/configs/api-endpoints";
import {
  DB_REVISION_STATUS,
  LOAD_LIST_REVISION_STATUS,
} from "@/configs/constants";
import { useGetData } from "@/hooks/useCRUD";
import "./DownloadComponent.css";
import { useLoading } from "@/hooks/useLoading";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { mutate } from "swr";
import { getThermaxDateFormat } from "@/utils/helpers";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getStandByKw } from "./Electrical Load List/LoadListComponent";
import CopyRevision from "@/components/Modal/CopyRevision";

interface Props {
  designBasisRevisionId: string;
  loadListLatestRevisionId: string;
  cableScheduleRevisionId: string;
}

const Download: React.FC<Props> = ({
  designBasisRevisionId,
  cableScheduleRevisionId,
  loadListLatestRevisionId,
}) => {
  const { setLoading: setModalLoading } = useLoading();
  const router = useRouter();
  const userInfo = useCurrentUser();

  const [downloadIconSpin, setDownloadIconSpin] = useState(false);
  // const [submitIconSpin, setSubmitIconSpin] = useState(false);
  const [versionToCopy, setVersionToCopy] = useState(null); 
  const params = useParams();
  const project_id = params.project_id as string;
  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);

  const { data: documentList } = useGetData(
    `${STATIC_DOCUMENT_API}?fields=["*"]&filters=[["project_id", "=", "${project_id}"]]`
  );

  const userDivision = userInfo?.division;
  const projectDivision = projectData?.division;

  const dbLoadlistHistoryUrl = `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["*"]&order_by=creation asc`;
  const { data: revisionHistory } = useGetData(dbLoadlistHistoryUrl);

  const [dataSource, setDataSource] = useState<any[]>([]);
  const [commonConfigData, setCommonConfigData] = useState<any>([]);
  const [motorSpecsData, setMotorSpecsData] = useState<any>([]);
  const [loadListData, setLoadListData] = useState<any>([]);
  const [cableScheduleData, setCableScheduleData] = useState<any>([]);
  const [lpbsSchemes, setLpbsSchemes] = useState<any>([]);
  const [tabKey, setTabKey] = useState("1");
  // const userInfo: {
  //   division: string;
  // } = useCurrentUser();

  useEffect(() => {
    console.log(revisionHistory);

    if (revisionHistory?.length) {
      const dataSource = revisionHistory?.map((item: any, index: number) => ({
        key: item.name,
        documentName: documentList[0]?.electrical_load_list,
        status: item.status,
        documentRevision: `R${index}`,
        createdDate: item.creation,
        is_copied: item.is_copied,
      }));
      setDataSource(dataSource);
    }
  }, [documentList, revisionHistory]);

  const getDownLoadEndpoint = () => {
    console.log(tabKey);

    switch (tabKey) {
      case "1":
        return GET_LOAD_LIST_EXCEL_API;

      case "2":
        return GET_CABLE_SCHEDULE_EXCEL_API;
      case "3":
        return "";
      case "4":
        return GET_MOTOR_SPECS_EXCEL_API;
      case "5":
        return GET_LPBS_SPECS_EXCEL_API;
      case "6":
        return GET_ISOLATOR_EXCEL_API;
      default:
        return "";
    }
  };

  const handleDownload = async (revision_id: string) => {
    setDownloadIconSpin(true);
    console.log(revision_id);

    try {
      const base64Data: any = await downloadFile(getDownLoadEndpoint(), true, {
        revision_id,
      });

      // Create a Blob from the Base64 string
      const binaryData = Buffer.from(base64Data, "base64");
      const blob = new Blob([binaryData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      // Use Content-Disposition header to get the filename
      const filename = `${getName(tabKey)}.xlsx`;

      link.download = filename.replace(/"/g, ""); // Remove quotes if present

      link.click();
    } catch (error) {
      console.error(error);
      message.error("Unable to download file");

      setDownloadIconSpin(false);
    } finally {
      setDownloadIconSpin(false);
    }
  };

  const handleRelease = async (record: any, tab: any) => {
    console.log(record, tab);

    // getSaveEndPoint("x",)
    setModalLoading(true);
    try {
      // console.log(row);
      if (record.status === LOAD_LIST_REVISION_STATUS.NotReleased) {
        const response = await updateData(
          getSaveEndPoint(record?.key, tab),
          false,
          { status: LOAD_LIST_REVISION_STATUS.Released }
        );
        console.log(response);
      }
      console.log(tabKey);

      // updateDataSource()
      // await copyDesignBasisRevision(project_id, revision_id)
      // mutate(dbLoadlistHistoryUrl);
      message.success("Revision is Released and Locked");
      updateDataSource(tabKey);
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };
  const handleClone = async (record: any) => {
    setVersionToCopy(record);
    // console.log(record);
  };
  // const { setLoading: setModalLoading } = useLoading()
  useEffect(() => {
    setModalLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    // console.log(dataSource);
  }, [dataSource]);
  const getColumns = (tab: string) => {
    const columns: TableColumnsType = [
      {
        title: () => <div className="text-center">Document Name</div>,
        dataIndex: "documentName",
        align: "center",
        render: (text, record) => (
          <Tooltip title="Edit Revision" placement="top">
            <Button
              type="link"
              iconPosition="start"
              onClick={() => {
                if (
                  tab !== "motor-specs" &&
                  tab !== "lpbs-specs" &&
                  tab !== "local-isolator"
                ) {
                  setModalLoading(true);
                  router.push(
                    `/project/${project_id}/electrical-load-list/${tab}`
                  );
                }
              }}
              icon={
                <FolderOpenOutlined
                  style={{ color: "#fef65b", fontSize: "1.2rem" }}
                />
              }
              disabled={record.status === DB_REVISION_STATUS.Released}
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
        render: (text) => {
          const date = new Date(text);
          const stringDate = getThermaxDateFormat(date);
          return stringDate;
        },
      },
      {
        title: () => <div className="text-center">Download</div>,
        dataIndex: "download",
        render(text, record) {
          return (
            <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
              <div>
                <Tooltip title={"Download"}>
                  <Button
                    type="link"
                    shape="circle"
                    disabled={
                      (tab === "lpbs-specs" &&
                        !commonConfigData?.is_local_push_button_station_selected) ||
                      (tab === "local-isolator" &&
                        !commonConfigData?.is_field_motor_isolator_selected)
                    }
                    icon={
                      <CloudDownloadOutlined
                        style={{
                          fontSize: "1.3rem",
                          color: "green",
                        }}
                        spin={downloadIconSpin}
                      />
                    }
                    onClick={() => handleDownload(record?.key)}
                  />
                </Tooltip>
              </div>
            </div>
          );
        },
      },
      {
        title: () => <div className="text-center">Create New Revision</div>,
        dataIndex: "clone",
        render: (_, record) => {
          console.log(record);
          if (record.is_copied === 1) {
            return null;
          }

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
                    record.status !== DB_REVISION_STATUS.Released ||
                    userDivision !== projectDivision
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
        render: (text, record) => {
          return (
            <div className="text-center">
              {/* <Button
                type="primary"
                size="small"
                name="Release"
                disabled={
                  record.status === DB_REVISION_STATUS.Released ||
                  userDivision !== projectDivision ||
                  (tab === "lpbs-specs" &&
                    !commonConfigData?.is_local_push_button_station_selected) ||
                  (tab === "local-isolator" &&
                    !commonConfigData?.is_field_motor_isolator_selected)
                }
                onClick={() => handleRelease(record, tab)}
              >
                Release
              </Button> */}

              <Popconfirm
                title="Are you sure to release this revision?"
                onConfirm={async () => handleRelease(record, tab)}
                okText="Yes"
                cancelText="No"
                placement="topRight"
                disabled={
                  record.status === DB_REVISION_STATUS.Released ||
                  userDivision !== projectDivision ||
                  (tab === "lpbs-specs" &&
                    !commonConfigData?.is_local_push_button_station_selected) ||
                  (tab === "local-isolator" &&
                    !commonConfigData?.is_field_motor_isolator_selected)
                }
              >
                <Button
                  type="primary"
                  size="small"
                  name="Release"
                  disabled={
                    record.status === DB_REVISION_STATUS.Released ||
                    userDivision !== projectDivision ||
                    (tab === "lpbs-specs" &&
                      !commonConfigData?.is_local_push_button_station_selected) ||
                    (tab === "local-isolator" &&
                      !commonConfigData?.is_field_motor_isolator_selected)
                  }
                >
                  Release
                </Button>
              </Popconfirm>
            </div>
          );
        },
      },
    ];
    const saveElement = {
      title: () => <div className="text-center">Save</div>,
      dataIndex: "download",
      render(text: any, record: any) {
        if (
          record.is_copied === 1 ||
          record.status === LOAD_LIST_REVISION_STATUS.Released
        ) {
          return null;
        }

        return (
          <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
            <div>
              <Tooltip title={"Save"}>
                <Button
                  type="link"
                  shape="circle"
                  disabled={
                    (tab === "lpbs-specs" &&
                      !commonConfigData?.is_local_push_button_station_selected) ||
                    (tab === "local-isolator" &&
                      !commonConfigData?.is_field_motor_isolator_selected)
                  }
                  icon={
                    <SaveTwoTone
                      style={{
                        fontSize: "1rem",
                        color: "green",
                      }}
                    />
                  }
                  onClick={() => handleSave(record?.key, tab)}
                />
              </Tooltip>
            </div>
          </div>
        );
      },
    };
    if (
      tab === "local-isolator" ||
      tab === "motor-specs" ||
      tab === "lpbs-specs"
    ) {
      const position = columns.length - 3;

      // Insert the element at the calculated position
      columns.splice(position, 0, saveElement);
    }
    return columns;
  };

  const getSaveEndPoint = (id: any, tab: any) => {
    console.log(tab);

    switch (tab) {
      case "local-isolator":
        return `${LOCAL_ISOLATOR_REVISION_HISTORY_API}/${id}`;
      case "lpbs-specs":
        return `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}/${id}`;
      case "motor-specs":
        return `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}/${id}`;
      case "load-list":
        return `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${id}`;
      case "cable-schedule":
        return `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${id}`;
      case "motor-canopy":
        return `${MOTOR_CANOPY_REVISION_HISTORY_API}/${id}`;

      default:
        return "";
    }
  };

  const handleSave = async (key: any, tab: any) => {
    if (tab === "local-isolator") {
      // console.log(commonConfigData);
      // console.log(loadListData);
      const payload = {
        local_isolator_data: [
          {
            fmi_type: commonConfigData?.safe_field_motor_type,
            fmi_ip_protection: commonConfigData?.safe_field_motor_enclosure,
            fmi_enclouser_moc: commonConfigData?.safe_field_motor_material,
            fmi_enclouser_thickness:
              commonConfigData?.safe_field_motor_thickness,
            fmi_qty: commonConfigData?.safe_field_motor_qty,
            ifm_isolator_color_shade:
              commonConfigData?.safe_field_motor_isolator_color_shade,
            ifm_cable_entry: commonConfigData?.safe_field_motor_cable_entry,
            canopy: commonConfigData?.safe_field_motor_canopy,
            canopy_type: commonConfigData?.safe_field_motor_canopy_type,
            area: "Safe",
          },
          {
            fmi_type: commonConfigData?.hazardous_field_motor_type,
            fmi_ip_protection:
              commonConfigData?.hazardous_field_motor_enclosure,
            fmi_enclouser_moc: commonConfigData?.hazardous_field_motor_material,
            fmi_enclouser_thickness:
              commonConfigData?.hazardous_field_motor_thickness,
            fmi_qty: commonConfigData?.hazardous_field_motor_qty,
            ifm_isolator_color_shade:
              commonConfigData?.hazardous_field_motor_isolator_color_shade,
            ifm_cable_entry:
              commonConfigData?.hazardous_field_motor_cable_entry,
            canopy: commonConfigData?.hazardous_field_motor_canopy,
            canopy_type: commonConfigData?.hazardous_field_motor_canopy_type,
            area: "Hazardous",
          },
        ],
        local_isolator_motor_details_data:
          loadListData?.electrical_load_list_data
            ?.filter((el: any) => el.local_isolator === "Yes")
            .map((item: any, index: number) => ({
              serial_number: index + 1,
              tag_number: item.tag_number,
              service_description: item.service_description,
              working_kw: getStandByKw(item.working_kw, item.standby_kw),
              motor_rated_current: item.motor_rated_current,
              local_isolator: item.local_isolator,
              motor_location: item.motor_location,
              isolator_rating: "to be added",
              gland_size: `2 No X 1 "ET 1No X 3/4 "ET`,
              package: item.package,
              area: item.area,
              standard: item.standard,
              zone: item.zone,
              temprature_class: item.temperature_class,
              gas_group: item.gas_group,
            })),
      };
      try {
        const respose = await updateData(
          getSaveEndPoint(key, tab),
          false,
          payload
        );
        message.success("Local Isolator Specifications Saved");
      } catch (error) {
        message.error("Unable to Save Local Isolator Specifications");
      }
    }
    if (tab === "lpbs-specs") {
      console.log(commonConfigData);
      console.log(loadListData);
      let start_push_button = "";
      // let forward_start_push_button = "";
      // let reverse_start_push_button = "";
      let emergency_stop_push_button = "";
      let analogue_ammeter_push_button = "";
      let speed_inc_push_button = "";
      let speed_dec_push_button = "";
      let analogue_rpm_push_button = "";
      let on_indication_lamp_push_button = "";
      let off_indication_lamp_push_button = "";

      console.log(lpbsSchemes);
      loadListData?.electrical_load_list_data?.forEach(
        (item: any, index: number) => {
          if (item.lpbs_type !== "NA") {
            console.log(item.lpbs_type);
            const lpbsScheme = lpbsSchemes?.find(
              (el: any) => el.lpbs_type === item.lpbs_type
            );

            if (lpbsScheme) {
              console.log(item.lpbs_type + ">>>>>>>>>", lpbsScheme);
              if (lpbsScheme.start_push_button !== "NA") {
                start_push_button = "Yes";
              }
              if (lpbsScheme.emergency_stop_push_button !== "NA") {
                emergency_stop_push_button = "Yes";
              }
              if (lpbsScheme.analog_ammeter !== "NA") {
                analogue_ammeter_push_button = "Yes";
              }
              if (lpbsScheme.speed_push_button !== "NA") {
                speed_inc_push_button = "Yes";
                speed_dec_push_button = "Yes";
              }
              if (lpbsScheme.analog_rpm_meter !== "NA") {
                analogue_rpm_push_button = "Yes";
              }
              if (lpbsScheme.start_indication_button !== "NA") {
                on_indication_lamp_push_button = "Yes";
              }
              if (lpbsScheme.stop_indication_button !== "NA") {
                off_indication_lamp_push_button = "Yes";
              }
            }
          }
        }
      );
      const payload = {
        is_safe_lpbs_selected: commonConfigData?.is_safe_lpbs_selected,
        is_hazardous_lpbs_selected:
          commonConfigData?.is_hazardous_lpbs_selected,
        lpbs_specification_data: [
          {
            safe_lpbs_type: commonConfigData?.safe_lpbs_type,
            safe_lpbs_ip_protection: commonConfigData?.safe_lpbs_enclosure,
            safe_lpbs_moc: commonConfigData?.safe_lpbs_material,
            safe_lpbs_quantity: commonConfigData?.safe_lpbs_qty,
            safe_lpbs_thickness: commonConfigData?.safe_lpbs_thickness,
            safe_lpbs_color_shade: commonConfigData?.safe_lpbs_color_shade,
            safe_lpbs_canopy: commonConfigData?.safe_lpbs_canopy,
            safe_lpbs_cable_entry: "3",
            safe_lpbs_canopy_type: commonConfigData?.safe_lpbs_canopy_type,
            hazardous_lpbs_type: commonConfigData?.hazardous_lpbs_type,
            hazardous_ip_protection: commonConfigData?.hazardous_lpbs_enclosure,
            hazardous_lpbs_moc: commonConfigData?.hazardous_lpbs_material,
            hazardous_lpbs_qty: commonConfigData?.hazardous_lpbs_qty,
            hazardous_lpbs_thickness:
              commonConfigData?.hazardous_lpbs_thickness,
            hazardous_lpbs_color_shade:
              commonConfigData?.hazardous_lpbs_color_shade,
            hazardous_lpbs_canopy: commonConfigData?.hazardous_lpbs_canopy,
            hazardous_lpbs_cable_entry: "3",
            hazardous_lpbs_canopy_type:
              commonConfigData?.hazardous_lpbs_canopy_type,
            lpbs_push_button_start_color:
              commonConfigData?.lpbs_push_button_start_color,
            lpbs_forward_push_button_start_color:
              commonConfigData?.lpbs_forward_push_button_start,
            lpbs_reverse_push_button_start_color:
              commonConfigData?.lpbs_reverse_push_button_start,
            lpbs_push_button_ess_color: commonConfigData?.lpbs_push_button_ess,
            lpbs_speed_increase_color: commonConfigData?.lpbs_speed_increase,
            lpbs_speed_decrease_color: commonConfigData?.lpbs_speed_decrease,
            lpbs_indication_lamp_start_color:
              commonConfigData?.lpbs_indication_lamp_start_color,
            lpbs_indication_lamp_stop_color:
              commonConfigData?.lpbs_indication_lamp_stop_color,
          },
          {
            lpbs_start_push_button: start_push_button,
            // forward_start_push_button,
            // reverse_start_push_button,
            forward_start_push_button: "",
            reverse_start_push_button: "",
            emergency_stop_push_button,
            analog_ammeter_push_button: analogue_ammeter_push_button,
            speed_increase_push_button: speed_inc_push_button,
            speed_decrease_push_button: speed_dec_push_button,
            analog_rpm_push_button: analogue_rpm_push_button,
            on_indication_lamp_push_button: on_indication_lamp_push_button,
            off_indication_lamp_push_button: off_indication_lamp_push_button,
          },
        ],
        lpbs_specifications_motor_details:
          loadListData?.electrical_load_list_data
            ?.filter((el: any) => el.lpbs_type !== "NA")
            .map((item: any, index: number) => ({
              serial_number: index + 1,
              tag_number: item.tag_number,
              service_description: item.service_description,
              working_kw: getStandByKw(item.working_kw, item.standby_kw),
              lpbs_type: item.lpbs_type,
              motor_location: item.motor_location,
              gland_size: `2 No X 1 "ET 1No X 3/4 "ET`,
              package: item.package,
              area: item.area,
              standard: item.standard,
              zone: item.zone,
              temprature_class: item.temperature_class,
              gas_group: item.gas_group,
            })),
      };
      console.log(payload);

      try {
        const respose = await updateData(
          getSaveEndPoint(key, tab),
          false,
          payload
        );
        console.log(respose);
        message.success("LPBS Specifications & List Saved");
      } catch (error) {
        message.error("Unable to Save LPBS Specifications & List");
      }
    }
    if (tab === "motor-specs") {
      console.log(motorSpecsData);
      console.log(loadListData);
      console.log(cableScheduleData);
      const payload = {
        motor_specification_data: [
          {
            area_classification: "",
            // standard: motorSpecsData.standard,
            // zone: motorSpecsData.zone,
            // gas_group: motorSpecsData.gas_group,
            // temperature_class: motorSpecsData.temperature_class,
            // dm_standard: motorSpecsData.dm_standard,
            // safe_area_enclosure_ip_rating: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_enclosure_ip_rating: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_duty: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_duty: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_insulation_class: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_insulation_class: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_temperature_rise: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_temperature_rise: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_start_hour_permissible: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_start_hour_permissible: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_service_factor: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_service_factor: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_cooling_type: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_cooling_type: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_body_material: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_body_material: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_terminal_box_material: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_terminal_box_material: motorSpecsData.safe_area_enclosure_ip_rating,
            // safe_area_paint_type_and_shade: motorSpecsData.safe_area_enclosure_ip_rating,
            // hazardous_area_paint_type_and_shade: motorSpecsData.safe_area_enclosure_ip_rating,

            gas_group: motorSpecsData?.data?.gas_group,
            temperature_class: motorSpecsData?.data?.temperature_class,
            standard: motorSpecsData?.data?.standard,
            zone: motorSpecsData?.data?.zone,
            dm_standard: motorSpecsData?.data?.dm_standard,
            safe_area_enclosure_ip_rating:
              motorSpecsData?.data?.safe_area_enclosure_ip_rating,
            hazardous_area_enclosure_ip_rating:
              motorSpecsData?.data?.hazardous_area_enclosure_ip_rating,
            safe_area_duty: motorSpecsData?.data?.safe_area_duty,
            hazardous_area_duty: motorSpecsData?.data?.safe_area_duty,
            safe_area_insulation_class:
              motorSpecsData?.data?.safe_area_insulation_class,
            hazardous_area_insulation_class:
              motorSpecsData?.data?.hazardous_area_insulation_class,

            safe_area_temperature_rise:
              motorSpecsData?.data?.safe_area_temperature_rise,
            hazardous_area_temperature_rise:
              motorSpecsData?.data?.hazardous_area_temperature_rise,
            safe_area_starts_hour_permissible:
              motorSpecsData?.data?.safe_area_starts_hour_permissible,
            hazardous_area_starts_hour_permissible:
              motorSpecsData?.data?.hazardous_area_starts_hour_permissible,
            safe_area_service_factor:
              motorSpecsData?.data?.safe_area_service_factor,
            hazardous_area_service_factor:
              motorSpecsData?.data?.hazardous_area_service_factor,
            safe_area_cooling_type:
              motorSpecsData?.data?.safe_area_cooling_type,
            hazardous_area_cooling_type:
              motorSpecsData?.data?.hazardous_area_cooling_type,

            safe_area_body_material:
              motorSpecsData?.data?.safe_area_body_material,
            hazardous_area_body_material:
              motorSpecsData?.data?.hazardous_area_body_material,
            safe_area_terminal_box_material:
              motorSpecsData?.data?.safe_area_terminal_box_material,
            hazardous_area_terminal_box_material:
              motorSpecsData?.data?.hazardous_area_terminal_box_material,
            safe_area_paint_type_and_shade:
              motorSpecsData?.data?.safe_area_paint_type_and_shade,
            hazardous_area_paint_type_and_shade:
              motorSpecsData?.data?.hazardous_area_paint_type_and_shade,
          },
        ],
        motor_details_data:
          motorSpecsData?.loadListData?.electrical_load_list_data?.map(
            (feeder: any) => {
              const cableScheduleRow =
                cableScheduleData?.cable_schedule_data?.find(
                  (el: any) => el.tag_number === feeder.tag_number
                );
              const cable_material =
                cableScheduleRow?.cable_material === "Copper" ? "Cu" : "Al";
              const cable_size =
                cableScheduleRow?.number_of_runs +
                "R" +
                " X " +
                cableScheduleRow?.number_of_cores +
                " X " +
                cableScheduleRow?.final_cable_size +
                " Sqmm " +
                cable_material +
                " Armoured";
              return {
                tag_number: feeder.tag_number,
                service_description: feeder.service_description,
                working_kw: feeder.working_kw,
                standby_kw: feeder.standby_kw,
                starter_type: feeder.starter_type,
                supply_voltage: feeder.supply_voltage,
                rpm: feeder.motor_rpm,
                type_of_mounting: feeder.motor_mounting_type,
                motor_frame_size: feeder.motor_frame_size,
                motor_gd2: feeder.motor_gd2,
                gd2_of_driven_equipment: feeder.motor_driven_equipment_gd2,
                bkw: feeder.bkw,
                type_of_couplings: feeder.coupling_type,
                motor_location: feeder.motor_location,
                space_heater: feeder.space_heater,
                thermistor: feeder.thermistor,
                type_of_bearing: feeder.bearing_type,
                motor_rated_current: feeder.motor_rated_current,
                winding_rtd: feeder.wiring_rtd,
                bearing_rtd: feeder.bearing_rtd,
                efficiency: feeder.motor_efficiency,
                power_factor: feeder.power_factor,
                make: feeder.motor_make,
                part_code: feeder.motor_part_code,
                remark: feeder.remark,
                area: feeder.area,
                motor_scope: feeder.motor_scope,
                cable_size: cable_size ?? "",
              };
            }
          ),
      };
      console.log(payload);
      try {
        const respose = await updateData(
          getSaveEndPoint(key, tab),
          false,
          payload
        );
        console.log(respose);
        message.success("Motor Specifications & List Saved");
      } catch (error) {
        message.error("Unable to Save Motor Specifications & List");
      }
    }
  };
  const DownloadTabs = [
    {
      label: `DOWNLOAD ELECTRICAL LOAD LIST`,
      key: "1",
      children: (
        <>
          <div className="text-end">
            <Button
              icon={<SyncOutlined color="#492971" />}
              onClick={() => updateDataSource("1")}
            >
              {" "}
              Refresh
            </Button>
          </div>

          <div className="mt-2">
            <Table
              columns={getColumns("load-list")}
              dataSource={dataSource}
              size="small"
            />
          </div>
        </>
      ),
    },
    {
      label: `DOWNLOAD CABLE SCHEDULE`,
      key: "2",
      children: (
        <>
          <div className="text-end">
            <Button
              icon={<SyncOutlined color="#492971" />}
              onClick={() => updateDataSource("2")}
            >
              {" "}
              Refresh
            </Button>
          </div>

          <div className="mt-2">
            <Table
              columns={getColumns("cable-schedule")}
              dataSource={dataSource}
              size="small"
            />
          </div>
        </>
      ),
    },
    {
      label: `DOWNLOAD MOTOR CANOPY LIST`,
      key: "3",
      children: (
        <>
          <div className="text-end">
            <Button
              icon={<SyncOutlined color="#492971" />}
              onClick={() => updateDataSource("3")}
            >
              {" "}
              Refresh
            </Button>
          </div>

          <div className="mt-2">
            <Table
              columns={getColumns("motor-canopy")}
              dataSource={dataSource}
              size="small"
            />
          </div>
        </>
      ),
    },
    {
      label: `DOWNLOAD MOTOR SPEC. & LIST`,
      key: "4",
      children: (
        <>
          <div className="text-end">
            <Button
              icon={<SyncOutlined color="#492971" />}
              onClick={() => updateDataSource("4")}
            >
              {" "}
              Refresh
            </Button>
          </div>

          <div className="mt-2">
            <Table
              columns={getColumns("motor-specs")}
              dataSource={dataSource}
              size="small"
            />
          </div>
        </>
      ),
    },
    {
      label: `LBPS SPECIFICATIONS & LIST`,
      key: "5",
      children: (
        <>
          <div className="text-end">
            <Button
              icon={<SyncOutlined color="#492971" />}
              onClick={() => updateDataSource("5")}
            >
              {" "}
              Refresh
            </Button>
          </div>

          <div className="mt-2">
            <Table
              columns={getColumns("lpbs-specs")}
              dataSource={dataSource}
              size="small"
            />
          </div>
        </>
      ),
    },
    {
      label: `LOCAL ISOLATOR SPECIFICATIONS LIST`,
      key: "6",
      children: (
        <>
          <div className="text-end">
            <Button
              icon={<SyncOutlined color="#492971" />}
              onClick={() => updateDataSource("6")}
            >
              {" "}
              Refresh
            </Button>
          </div>

          <div className="mt-2">
            <Table
              columns={getColumns("local-isolator")}
              dataSource={dataSource}
              size="small"
            />
          </div>
        </>
      ),
    },
  ];
  const getApiEndpoint = (key: any) => {
    const baseUrl = `?filters=[["project_id", "=", "${project_id}"]]&fields=["*"]&order_by=creation asc`;
    switch (key) {
      case "1":
        return `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}${baseUrl}`;
      case "2":
        return `${CABLE_SCHEDULE_REVISION_HISTORY_API}${baseUrl}`;
      case "3":
        return `${MOTOR_CANOPY_REVISION_HISTORY_API}${baseUrl}`;
      case "4":
        return `${MOTOR_SPECIFICATIONS_REVISION_HISTORY_API}${baseUrl}`;
      case "5":
        return `${LBPS_SPECIFICATIONS_REVISION_HISTORY_API}${baseUrl}`;
      case "6":
        return `${LOCAL_ISOLATOR_REVISION_HISTORY_API}${baseUrl}`;
      default:
        return "";
    }
  };
  const getIsolatorData = async () => {
    // console.log(designBasisRevisionId);

    try {
      const commonConfigData1 = await getData(
        `${COMMON_CONFIGURATION_1}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const commonConfigData2 = await getData(
        `${COMMON_CONFIGURATION_2}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );

      const commonConfigData3 = await getData(
        `${COMMON_CONFIGURATION_3}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );

      const commonConfigData = {
        ...commonConfigData1?.[0],
        ...commonConfigData2?.[0],
        ...commonConfigData3?.[0],
      };

      const loadListData = await getData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
      );
      const lpbsResponse = await getData(
        `${LPBS_SCHEMES_URI}?filters=[["division_name", "=", "${projectDivision}"]]&fields=["*"]&limit=2500`
      );
      console.log(lpbsResponse);

      setLpbsSchemes(lpbsResponse);
      setLoadListData(loadListData);
      setCommonConfigData(commonConfigData);
      // console.log(loadListData, "loadlist");
      // console.log(commonConfigData, "commonConfigData");
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };
  const getMotorSpecsData = async () => {
    // console.log(designBasisRevisionId);

    try {
      const getMainPkgUrl = await getData(
        `${PROJECT_MAIN_PKG_LIST_API}?revision_id=${designBasisRevisionId}`
      );
      const cableScheduleData = await getData(
        `${CABLE_SCHEDULE_REVISION_HISTORY_API}/${cableScheduleRevisionId}`
      );

      const commonConfigData1 = await getData(
        `${COMMON_CONFIGURATION_1}?fields=["dm_standard"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const motorParameters = await getData(
        `${MOTOR_PARAMETER_API}?fields=["*"]&filters=[["revision_id", "=", "${designBasisRevisionId}"]]`
      );
      const loadListData = await getData(
        `${ELECTRICAL_LOAD_LIST_REVISION_HISTORY_API}/${loadListLatestRevisionId}`
      );

      const data = {
        gas_group: getMainPkgUrl[0]?.gas_group,
        temperature_class: getMainPkgUrl[0]?.temperature_class,
        standard: getMainPkgUrl[0]?.standard,
        zone: getMainPkgUrl[0]?.zone,
        dm_standard: commonConfigData1[0]?.dm_standard,
        safe_area_enclosure_ip_rating:
          motorParameters[0]?.safe_area_enclosure_ip_rating,
        hazardous_area_enclosure_ip_rating:
          motorParameters[0]?.hazardous_area_enclosure_ip_rating,
        safe_area_duty: motorParameters[0]?.safe_area_duty,
        hazardous_area_duty: motorParameters[0]?.safe_area_duty,
        safe_area_insulation_class:
          motorParameters[0]?.safe_area_insulation_class,
        hazardous_area_insulation_class:
          motorParameters[0]?.hazardous_area_insulation_class,

        safe_area_temperature_rise:
          motorParameters[0]?.safe_area_temperature_rise,
        hazardous_area_temperature_rise:
          motorParameters[0]?.hazardous_area_temperature_rise,
        safe_area_starts_hour_permissible:
          motorParameters[0]?.safe_area_starts_hour_permissible,
        hazardous_area_starts_hour_permissible:
          motorParameters[0]?.hazardous_area_starts_hour_permissible,
        safe_area_service_factor: motorParameters[0]?.safe_area_service_factor,
        hazardous_area_service_factor:
          motorParameters[0]?.hazardous_area_service_factor,
        safe_area_cooling_type: motorParameters[0]?.safe_area_cooling_type,
        hazardous_area_cooling_type:
          motorParameters[0]?.hazardous_area_cooling_type,

        safe_area_body_material: motorParameters[0]?.safe_area_body_material,
        hazardous_area_body_material:
          motorParameters[0]?.hazardous_area_body_material,
        safe_area_terminal_box_material:
          motorParameters[0]?.safe_area_terminal_box_material,
        hazardous_area_terminal_box_material:
          motorParameters[0]?.hazardous_area_terminal_box_material,
        safe_area_paint_type_and_shade:
          motorParameters[0]?.safe_area_paint_type_and_shade,
        hazardous_area_paint_type_and_shade:
          motorParameters[0]?.hazardous_area_paint_type_and_shade,
      };
      setCableScheduleData(cableScheduleData);
      setMotorSpecsData({ data, loadListData: loadListData });
      console.log(getMainPkgUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };
  const getName = (key: any) => {
    switch (key) {
      case "1":
        return documentList[0]?.electrical_load_list;
      case "2":
        return documentList[0]?.electrical_cable_schedule;
      case "3":
        return documentList[0]?.motor_canopy_list_and_specification;
      case "4":
        return documentList[0]?.motor_specification;
      case "5":
        return documentList[0]?.lpbs_specifications_and_list;
      case "6":
        return documentList[0]?.local_isolator_specifications_and_list;
      default:
        return "";
    }
  };
  const updateDataSource = async (key: any) => {
    console.log(key);

    const data = await getData(getApiEndpoint(key));
    // console.log(data);

    const dataSource = data?.map((item: any, index: number) => ({
      key: item.name,
      documentName: getName(key),
      status: item.status,
      documentRevision: `R${index}`,
      createdDate: item.creation,
      is_copied: item.is_copied,
    }));
    console.log(dataSource, " fetched all revisions");

    setDataSource(dataSource);
  };

  const onChange = async (key: string) => {
    setModalLoading(true);

    // console.log(key);
    // console.log(documentList);
    // console.log(getApiEndpoint(key));

    try {
      // const documentList = await getData()

      // console.log(staticData,"staticData");

      updateDataSource(key);
      if (key === "6" || key === "5") {
        await getIsolatorData();
      }
      if (key === "4") {
        await getMotorSpecsData();
      }
      // console.log(dataSource);

      // console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
    setTabKey(key);
  };

  return (
    <div className="">
      <Tabs
        onChange={onChange}
        type="card"
        style={{ fontSize: "11px !important" }}
        items={DownloadTabs}
      />
      <CopyRevision
        version={versionToCopy}
        setVersionToCopy={setVersionToCopy} 
        tab={tabKey}
        updateTable={updateDataSource}
      />
    </div>
  );
};

export default Download;
