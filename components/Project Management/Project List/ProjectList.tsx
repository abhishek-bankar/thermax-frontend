"use client";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FileDoneOutlined,
  FolderAddOutlined,
  SyncOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Input,
  message,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useEffect, useState } from "react";
import { mutate } from "swr";
import { updateData } from "@/actions/crud-actions";
import { PROJECT_API } from "@/configs/api-endpoints";
import { useGetData } from "@/hooks/useCRUD";
import { useLoading } from "@/hooks/useLoading";
import ProjectFormModal from "./ProjectFormModal";
import { UploadProjectFilesModal } from "./UploadProjectFilesModal";
import { getThermaxDateFormat } from "@/utils/helpers";
import { deleteThermaxProject } from "@/actions/project";
import {
  ENVIRO,
  HEATING,
  WWS_SERVICES,
  TagColors,
  WWS_IPG,
  WWS_SPG,
} from "@/configs/constants";
import CopyProjectModel from "./CopyProjectModel";
import { useSearchParams } from "next/navigation";

interface DataType {
  key: string;
  name?: string;
  project_oc_number: string;
  client_name: string;
  project_name: string;
  creation: string;
  modified: string;
}

const { Search } = Input;

const changeNameToKey = (projectList: any[]) => {
  if (!projectList) return [];
  projectList.forEach((project) => {
    project.key = project.name;
  });
  return projectList;
};

export default function ProjectList({ userInfo, isComplete }: any) {
  const userDivision = userInfo?.division;
  const isUserSuperUser = userInfo?.is_superuser;
  const [open, setOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);
  const [copyModelOpen, setCopyModelOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [projectRow, setProjectRow] = useState<any>(null);
  const [projectListData, setProjectListData] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const year = searchParams.get("year");
  const category = searchParams.get("category");

  console.log(year, category, "projes");
  // if()
  let getProjectUrl = `${PROJECT_API}?fields=["*"]&limit=1000&filters=[["division", "=",  "${userDivision}"], ["is_complete", "=", "${isComplete}"]]&order_by=creation desc`;
  console.log(isComplete);

  if (isUserSuperUser) {
    getProjectUrl = `${PROJECT_API}?fields=["*"]&limit=1000&filters=[["is_complete", "=", "${isComplete}"]]&order_by=creation desc`;
  }
  if (year && category) {
    const start_date = `${year.split("-")[0]}-04-01`;
    const end_date = `${year.split("-")[1]}-03-31`;
    console.log(start_date, end_date, "start_date");
    //     const startDate = "2024-02-01";
    // const endDate = "2024-02-10";

    getProjectUrl = `${PROJECT_API}?fields=["*"]&limit=1000&filters=[["is_complete", "=", "${Number(
      category
    )}"], ["creation", "Between", ["${start_date}", "${end_date}"]]]&order_by=creation desc`;
    console.log(getProjectUrl);
  }
  const { data: projectList, isLoading } = useGetData(getProjectUrl);

  if (projectList) {
    projectList.sort((a: any, b: any) => {
      if (a.division === userDivision && b.division !== userDivision) {
        return -1; // Place 'a' before 'b'
      }
      if (a.division !== userDivision && b.division === userDivision) {
        return 1; // Place 'b' before 'a'
      }
      return 0; // No change in order if both are from the same division
    });
  }

  const projectOCNos = projectList?.map(
    (project: any) =>
      project.division === userDivision && project.project_oc_number
  );
  const { setLoading: setModalLoading } = useLoading();
  useEffect(() => {
    setModalLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const filteredList = projectList?.filter((project: any) =>
      Object.values(project).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setProjectListData(filteredList);
  }, [projectList, searchQuery]);

  const columns: ColumnsType<DataType> = [
    {
      title: () => <div className="text-center">Project ID</div>,
      dataIndex: "name",
      key: "name",
      hidden: true,
    },
    {
      title: () => <div className="text-center">Division</div>,
      dataIndex: "division",
      key: "division",
      hidden: !isUserSuperUser,
      width: 100,
      render: (text: keyof typeof TagColors) => {
        return (
          <div className="text-center text-wrap">
            <Tag color={TagColors[text]}>{text}</Tag>
          </div>
        );
      },
      filters: [HEATING, ENVIRO, WWS_IPG, WWS_SPG, WWS_SERVICES].map(
        (division) => {
          return { text: division, value: division };
        }
      ),
      onFilter: (value, record: any) => record?.division.indexOf(value) === 0,
      defaultFilteredValue: [userDivision],
    },
    {
      title: () => <div className="text-center text-wrap">Project OC No</div>,
      dataIndex: "project_oc_number",
      key: "project_oc_number",
      ellipsis: true,
      render: (text) => {
        return <div className="text-center text-wrap">{text}</div>;
      },
    },
    {
      title: () => <div className="text-center">Client Name</div>,
      dataIndex: "client_name",
      render: (text) => {
        return <div className="text-center">{text}</div>;
      },
    },
    {
      title: () => <div className="text-center">Project</div>,
      dataIndex: "project_name",
      align: "center",
      key: "project_name",

      render: (text, record) => (
        <Link
          href={`/project/${record.name}`}
          className="text-center hover:underline"
          onClick={() => setModalLoading(true)}
        >
          {record.project_name}
        </Link>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "creation",
      key: "creation",
      align: "center",
      width: 100,
      render: (text) => {
        const date = new Date(text);
        const stringDate = getThermaxDateFormat(date);
        return stringDate;
      },
    },
    {
      title: "Modified Date",
      dataIndex: "modified",
      key: "modified",
      align: "center",
      width: 100,
      render: (text) => {
        const date = new Date(text);
        const stringDate = getThermaxDateFormat(date);
        return stringDate;
      },
    },
    {
      title: () => <div className="text-center">Project Creator</div>,
      dataIndex: "owner",
      key: "owner",
      render: (text) => {
        return <div className="text-center">{text}</div>;
      },
    },
    {
      title: () => <div className="text-center">Approver</div>,
      dataIndex: "approver",
      key: "approver",
      align: "center",
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      ellipsis: true,
      render: (text, record: any) => {
        return (
          <div className="flex justify-center gap-1">
            <Tooltip placement="top" title="Edit">
              <Button
                type="link"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => handleEditProject(record)}
                disabled={record?.division !== userDivision}
                style={{ display: isComplete === 1 ? "none" : "" }}
              />
            </Tooltip>
            <Tooltip placement="top" title="Upload Files">
              <Button
                type="link"
                shape="circle"
                icon={<UploadOutlined />}
                onClick={() => handleUploadFiles(record)}
                disabled={record?.division !== userDivision}
                style={{ display: isComplete === 1 ? "none" : "" }}
              />
            </Tooltip>
            <Tooltip placement="top" title="Copy Project">
              <Button
                type="link"
                shape="circle"
                icon={<CopyOutlined />}
                onClick={() => handleCopyProject(record)}
                disabled={record?.division !== userDivision}
              />
            </Tooltip>
            {Boolean(isUserSuperUser) && (
              <>
                <Tooltip placement="top" title="Complete Project">
                  <Popconfirm
                    title="Are you sure to mark this project as complete?"
                    onConfirm={async () => await handleCompleteProject(record)}
                    okText="Yes"
                    cancelText="No"
                    placement="topRight"
                    disabled={record?.division !== userDivision}
                  >
                    <Button
                      type="link"
                      shape="circle"
                      icon={<FileDoneOutlined />}
                      disabled={record?.division !== userDivision}
                      style={{ display: isComplete === 1 ? "none" : "" }}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip placement="top" title="Delete">
                  <Popconfirm
                    title="Are you sure to delete this project?"
                    onConfirm={async () =>
                      await handleDeleteProject(record.key)
                    }
                    okText="Yes"
                    cancelText="No"
                    placement="topRight"
                    disabled={record?.division !== userDivision}
                  >
                    <Button
                      type="link"
                      shape="circle"
                      icon={<DeleteOutlined />}
                      danger
                      disabled={record?.division !== userDivision}
                      style={{ display: isComplete === 1 ? "none" : "" }}
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleAddProject = () => {
    setOpen(true);
    setEditMode(false);
    setProjectRow(null);
  };

  const handleEditProject = (selectedRow: any) => {
    setOpen(true);
    setEditMode(true);
    setProjectRow(selectedRow);
  };

  const handleUploadFiles = (selectedRow: any) => {
    setUploadFileOpen(true);
    setProjectRow(selectedRow);
  };

  const handleCopyProject = async (selectedRow: any) => {
    setCopyModelOpen(true);
    setProjectRow(selectedRow);
  };

  const handleDeleteProject = async (selectedRowID: string) => {
    try {
      await deleteThermaxProject(selectedRowID);
      message.success("Project Deleted Successfully");
    } catch (error) {
      message.error(`Error deleting project: ${error}`);
      console.error("Error deleting project", error);
    }
    mutate(getProjectUrl);
  };

  const handleCompleteProject = async (selectedRow: {
    name: string;
    is_complete: boolean;
  }) => {
    await updateData(`${PROJECT_API}/${selectedRow?.name}`, false, {
      is_complete: !selectedRow?.is_complete,
    });
    mutate(getProjectUrl);
  };
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" tip="Loading Project data..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-bold tracking-wide">
          {isComplete === 1 ? "Completed Project Console" : "Project Console"}
        </div>
        <div className="basis-1/2">
          <Search
            placeholder="Search Project"
            enterButton
            allowClear
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </div>
        <div className="flex gap-3">
          <Tooltip title="Refresh">
            <div className="rounded-full hover:bg-blue-100">
              <Button
                type="link"
                shape="circle"
                icon={<SyncOutlined spin={isLoading} />}
                onClick={() => mutate(getProjectUrl)}
              />
            </div>
          </Tooltip>
          {!(isComplete === 1) && (
            <Button
              type="primary"
              icon={<FolderAddOutlined />}
              iconPosition={"end"}
              onClick={handleAddProject}
            >
              Add Project
            </Button>
          )}
        </div>
      </div>
      <div className="shadow-md">
        <Table
          columns={columns}
          bordered
          dataSource={changeNameToKey(projectListData)}
          pagination={{ size: "small", pageSize: 8 }}
          size="small"
        />
      </div>
      <ProjectFormModal
        open={open}
        setOpen={setOpen}
        editMode={editMode}
        values={projectRow}
        userInfo={userInfo}
        getProjectUrl={getProjectUrl}
        projectOCNos={projectOCNos}
      />
      <UploadProjectFilesModal
        open={uploadFileOpen}
        setOpen={setUploadFileOpen}
        values={projectRow}
        userInfo={userInfo}
      />
      <CopyProjectModel
        open={copyModelOpen}
        setOpen={setCopyModelOpen}
        projectRowData={projectRow}
        projectOCNos={projectOCNos}
        userInfo={userInfo}
        getProjectUrl={getProjectUrl}
      />
    </div>
  );
}
