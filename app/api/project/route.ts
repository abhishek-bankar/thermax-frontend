import { getData } from "@/actions/crud-actions";
import {
  DESIGN_BASIS_REVISION_HISTORY_API,
  PROJECT_API,
  PROJECT_INFO_API,
  STATIC_DOCUMENT_API,
} from "@/configs/api-endpoints";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project_id = searchParams.get("projectId");
  const project = await getData(`${PROJECT_API}/${project_id}`);
  const projectInfo = await getData(`${PROJECT_INFO_API}/${project_id}`);
  const staticDocumentData = await getData(
    `${STATIC_DOCUMENT_API}/${project_id}`
  );
  const dbRevisionHistory = await getData(
    `${DESIGN_BASIS_REVISION_HISTORY_API}?filters=[["project_id", "=", "${project_id}"]]&fields=["*"]&order_by=creation asc`
  );
  try {
    return NextResponse.json({ message: "Hello World!" });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}
