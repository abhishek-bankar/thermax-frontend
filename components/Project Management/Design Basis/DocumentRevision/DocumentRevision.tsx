"use client";
import {
  CheckCircleOutlined,
  CloudDownloadOutlined,
  CopyTwoTone,
  ExportOutlined,
  FolderOpenOutlined,
  RetweetOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Button, message, Table, TableColumnsType, Tag, Tooltip } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DESIGN_BASIS_REVISION_HISTORY_API,
  GET_DESIGN_BASIS_EXCEL_API,
  PROJECT_API,
  REVIEW_APPROVAL_EMAIL_API,
  REVIEW_SUBMISSION_EMAIL_API,
} from "@/configs/api-endpoints";
import { useGetData } from "@/hooks/useCRUD";
import { useLoading } from "@/hooks/useLoading";
import { getThermaxDateFormat } from "@/utils/helpers";
import { createData, downloadFile, updateData } from "@/actions/crud-actions";
import { DB_REVISION_STATUS } from "@/configs/constants";
import { mutate } from "swr";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import clsx from "clsx";
import ResubmitModel from "./ResubmitModel";
import CopyRevisionModel from "./CopyModel";

export default function DocumentRevision() {
  const userInfo = useCurrentUser();
  const params = useParams();
  const project_id = params.project_id as string;
  const [submitIconSpin, setSubmitIconSpin] = useState(false);
  const [approvalIconSpin, setApprovalIconSpin] = useState(false);
  const [downloadIconSpin, setDownloadIconSpin] = useState(false);
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [copyModelOpen, setCopyModelOpen] = useState(false);
  const [copyRevisionId, setCopyRevisionId] = useState("");
  const router = useRouter();

  const { setLoading: setModalLoading } = useLoading();
  useEffect(() => {
    setModalLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dbRevisionHistoryUrl = `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["*"]&order_by=creation asc`;

  const { data: revisionHistory } = useGetData(dbRevisionHistoryUrl);
  const { data: projectData } = useGetData(`${PROJECT_API}/${project_id}`);
  const projectOwnerEmail = projectData?.owner;

  const handleReviewSubmission = async (record: any) => {
    const revision_id = record?.key;
    const projectApproverEmail = record?.approverEmail;
    const currentStatus = record?.status;
    setModalLoading(true);
    try {
      let status = DB_REVISION_STATUS.Submitted;
      if (currentStatus === DB_REVISION_STATUS.Resubmitted) {
        status = DB_REVISION_STATUS.ResubmittedAgain;
      }
      await updateData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}/${revision_id}`,
        false,
        {
          status,
        }
      );

      await createData(REVIEW_SUBMISSION_EMAIL_API, false, {
        approver_email: projectApproverEmail,
        project_owner_email: projectOwnerEmail,
        project_oc_number: projectData?.project_oc_number,
        project_name: projectData?.project_name,
        subject: `Design Basis Approval - EnIMAX - ${projectData?.project_oc_number}`,
      });
      mutate(dbRevisionHistoryUrl);
      message.success("Review submission email sent");
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDownload = async (revision_id: string) => {
    setDownloadIconSpin(true);

    try {
      const base64Data: any = await downloadFile(
        GET_DESIGN_BASIS_EXCEL_API,
        true,
        {
          revision_id,
        }
      );

      // Create a Blob from the Base64 string
      const binaryData = Buffer.from(base64Data, "base64");
      const blob = new Blob([binaryData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a download link and trigger the download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const document_revision_length =
        revisionHistory.length > 0 ? revisionHistory.length : 0;

      // Use Content-Disposition header to get the filename
      const filename = `Design_Basis_${projectData?.project_oc_number}_R${
        document_revision_length - 1
      }.xlsx`;

      link.download = filename.replace(/"/g, ""); // Remove quotes if present

      link.click();
    } catch (error) {
      message.error("Error processing Excel file");
      console.error("Error processing Excel file:", error);
    }

    setDownloadIconSpin(false);
  };

  const handleClone = async (revision_id: string) => {
    setCopyRevisionId(revision_id);
    setCopyModelOpen(true);
  };

  const handleApprove = async (record: any) => {
    const revision_id = record?.key;
    const projectApproverEmail = record.approverEmail;
    setModalLoading(true);
    try {
      await updateData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}/${revision_id}`,
        false,
        {
          status: DB_REVISION_STATUS.Approved,
        }
      );

      await createData(REVIEW_APPROVAL_EMAIL_API, false, {
        approver_email: projectApproverEmail,
        project_owner_email: projectOwnerEmail,
        project_oc_number: projectData?.project_oc_number,
        project_name: projectData?.project_name,
        subject: `Approved - EnIMAX - ${projectData?.project_oc_number}`,
      });
      mutate(dbRevisionHistoryUrl);
      message.success("Project approval email sent");
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRelease = async (revision_id: string) => {
    setModalLoading(true);
    try {
      await updateData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}/${revision_id}`,
        false,
        {
          status: DB_REVISION_STATUS.Released,
        }
      );
      mutate(dbRevisionHistoryUrl);
      message.success("Design Basis revision is released and locked");
    } catch (error) {
      message.error("Error releasing Design Basis revision");
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  };

  // console.log(userInfo);
  // console.log(revisionHistory);

  // Ensure columns is defined as an array of ColumnType
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
              setModalLoading(true);
              router.push(`/project/${project_id}/design-basis/general-info`);
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
      render: (text, record) => {
        const projectApproverEmail = record.approverEmail;
        let status = text;

        switch (status) {
          case DB_REVISION_STATUS.Submitted:
            status =
              projectApproverEmail === userInfo.email
                ? "Review Submitted"
                : "Review Submitted and Pending for Approval";
            break;
          case DB_REVISION_STATUS.Resubmitted:
            status =
              projectApproverEmail === userInfo.email
                ? "Review Returned"
                : "Review Re-Submit";
            break;
          case DB_REVISION_STATUS.ResubmittedAgain:
            status =
              projectApproverEmail === userInfo.email
                ? "Review Re-Submitted"
                : "Review Re-Submitted and Pending for Approval";
            break;
          case DB_REVISION_STATUS.Approved:
            status = "Review Approved";
            break;
          case DB_REVISION_STATUS.Released:
            status = "Released & Locked";
            break;
          default:
            status = "Review Unsubmitted";
            break;
        }

        return (
          <div className="text-center">
            <Tag color="green">{status}</Tag>
          </div>
        );
      },
    },
    {
      title: () => <div className="text-center">Approver</div>,
      dataIndex: "approverEmail",
      render: (text) => <div className="text-center">{text}</div>,
    },
    {
      title: () => <div className="text-center">Document Revision</div>,
      dataIndex: "documentRevision",
      render: (text) => <div className="text-center">{text}</div>,
    },
    {
      title: () => <div className="text-center">Clone</div>,
      dataIndex: "clone",
      render: (_, record) => {
        return (
          <div className="text-center">
            <Tooltip title={"Clone Revision"}>
              <Button
                type="link"
                shape="circle"
                icon={
                  <CopyTwoTone
                    style={{
                      fontSize: "1rem",
                    }}
                    twoToneColor={
                      record.status === DB_REVISION_STATUS.Released
                        ? "blue"
                        : "grey"
                    }
                  />
                }
                onClick={() => handleClone(record?.key)}
                disabled={record.status !== DB_REVISION_STATUS.Released}
              />
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: () => <div className="text-center">Created Date</div>,
      dataIndex: "createdDate",
      align: "center",
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
        const projectApproverEmail = record.approverEmail;
        return (
          <div className="flex flex-row justify-center gap-2 hover:cursor-pointer">
            <div>
              <Tooltip title={"Download"}>
                <Button
                  type="link"
                  shape="circle"
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
            <div>
              <Tooltip title={"Submit for Review"}>
                <Button
                  type="link"
                  shape="circle"
                  icon={
                    <ExportOutlined
                      style={{
                        color:
                          [
                            DB_REVISION_STATUS.Released,
                            DB_REVISION_STATUS.Submitted,
                            DB_REVISION_STATUS.Approved,
                          ].includes(record?.status) ||
                          userInfo?.email !== record.owner
                            ? "grey"
                            : "orange",
                      }}
                      spin={submitIconSpin}
                    />
                  }
                  onClick={async () => await handleReviewSubmission(record)}
                  disabled={
                    [
                      DB_REVISION_STATUS.Released,
                      DB_REVISION_STATUS.Submitted,
                      DB_REVISION_STATUS.Approved,
                    ].includes(record?.status) ||
                    userInfo?.email !== record.owner
                  }
                />
              </Tooltip>
            </div>
            <div
              className={clsx(
                projectApproverEmail !== userInfo.email && "hidden"
              )}
            >
              <Tooltip title={"Resubmit for Review"}>
                <Button
                  type="link"
                  shape="circle"
                  icon={
                    <RetweetOutlined
                      style={{
                        fontSize: "1.3rem",
                        color: [
                          DB_REVISION_STATUS.Released,
                          DB_REVISION_STATUS.Resubmitted,
                          DB_REVISION_STATUS.Approved,
                          DB_REVISION_STATUS.Unsubmitted,
                        ].includes(record?.status)
                          ? "grey"
                          : "#fcba2e",
                      }}
                    />
                  }
                  onClick={() => setResubmitModalOpen(true)}
                  disabled={[
                    DB_REVISION_STATUS.Released,
                    DB_REVISION_STATUS.Resubmitted,
                    DB_REVISION_STATUS.Approved,
                    DB_REVISION_STATUS.Unsubmitted,
                  ].includes(record?.status)}
                />
              </Tooltip>
            </div>
            <div
              className={clsx(
                projectApproverEmail !== userInfo.email && "hidden"
              )}
            >
              <Tooltip title={"Approve"}>
                <Button
                  type="link"
                  shape="circle"
                  icon={
                    <CheckCircleOutlined
                      style={{
                        color: [
                          DB_REVISION_STATUS.Released,
                          DB_REVISION_STATUS.Approved,
                          DB_REVISION_STATUS.Unsubmitted,
                          DB_REVISION_STATUS.Resubmitted,
                        ].includes(record?.status)
                          ? "grey"
                          : "green",
                      }}
                      // spin={approvalIconSpin}
                    />
                  }
                  onClick={() => handleApprove(record)}
                  disabled={[
                    DB_REVISION_STATUS.Released,
                    DB_REVISION_STATUS.Approved,
                    DB_REVISION_STATUS.Unsubmitted,
                    DB_REVISION_STATUS.Resubmitted,
                  ].includes(record?.status)}
                />
              </Tooltip>
            </div>
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
            <Button
              type="primary"
              size="small"
              name="Release"
              disabled={
                record.status === DB_REVISION_STATUS.Released ||
                record.status !== DB_REVISION_STATUS.Approved ||
                userInfo?.email !== record.owner
              }
              onClick={() => handleRelease(record.key)}
            >
              Release
            </Button>
          </div>
        );
      },
    },
  ];

  const dataSource = revisionHistory?.map((item: any, index: number) => ({
    key: item.name,
    documentName: "Design Basis",
    status: item.status,
    documentRevision: `R${index}`,
    createdDate: item.creation,
    approverEmail: item.approver_email,
    owner: item.owner,
  }));
  // console.log(revisionHistory);

  return (
    <>
      <div className="text-end">
        <Button
          icon={<SyncOutlined color="#492971" />}
          onClick={() => mutate(dbRevisionHistoryUrl)}
        >
          {" "}
          Refresh
        </Button>
      </div>

      <div className="mt-2">
        <Table columns={columns} dataSource={dataSource} size="small" />
      </div>
      <ResubmitModel
        open={resubmitModalOpen}
        setOpen={setResubmitModalOpen}
        projectData={projectData}
        dbRevisionHistoryUrl={dbRevisionHistoryUrl}
      />
      <CopyRevisionModel
        open={copyModelOpen}
        setOpen={setCopyModelOpen}
        userInfo={userInfo}
        projectData={projectData}
        dbRevisionHistoryUrl={dbRevisionHistoryUrl}
        revision_id={copyRevisionId}
        setCopyRevisionId={setCopyRevisionId}
      />
    </>
  );
}
