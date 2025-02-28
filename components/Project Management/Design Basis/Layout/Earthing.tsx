import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, message } from "antd";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { createData, getData, updateData } from "@/actions/crud-actions";
import CustomTextInput from "@/components/FormInputs/CustomInput";
import CustomSingleSelect from "@/components/FormInputs/CustomSingleSelect";
import { DESIGN_BASIS_REVISION_HISTORY_API, LAYOUT_EARTHING, PROJECT_API } from "@/configs/api-endpoints";
import { useGetData, useNewGetData } from "@/hooks/useCRUD";
import useEarthingDropdowns from "./EarthingDropdown";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { convertToFrappeDatetime } from "@/utils/helpers";
import { DB_REVISION_STATUS } from "@/configs/constants";

const cableTrayValidationSchema = zod.object({
  earthing_system: zod.string({
    required_error: "Earthing System is required",
    message: "Please select an Earthing System",
  }),
  earth_strip: zod.string({
    required_error: "Earth Strip is required",
    message: "Please select an Earth Strip",
  }),
  earth_pit: zod.string({
    required_error: "Earthing Pit is required",
    message: "Please select an Earthing Pit",
  }),
  soil_resistivity: zod.string({
    required_error: "Soil Resistivity is required",
    message: "Please enter Soil Resistivity",
  }),
});

const getDefaultValues = (earthingData: any) => {
  return {
    earthing_system: earthingData?.earthing_system || "TNC",
    earth_strip: earthingData?.earth_strip || "GI",
    earth_pit: earthingData?.earth_pit || "GI",
    soil_resistivity: earthingData?.soil_resistivity || "0",
  };
};

const Earthing = ({ revision_id }: { revision_id: string }) => {
  const router = useRouter();
  const params = useParams();
  const userInfo = useCurrentUser();
  const { data: layoutEarthingData } = useNewGetData(
    `${LAYOUT_EARTHING}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
  );

  const lastModified = convertToFrappeDatetime(
    new Date(layoutEarthingData?.[0]?.modified)
  );

  const { data: projectData } = useGetData(
    `${PROJECT_API}/${params.project_id}`
  );

  const [loading, setLoading] = useState(false);

  const dropdown = useEarthingDropdowns();

  const earthing_system_options = dropdown["Earthing System"];
  const earth_strip_options = dropdown["Earth Strip"];
  const earthing_pit_options = dropdown["Earth Pit"];

  const userDivision = userInfo?.division;
  const projectDivision = projectData?.division;
  // const projectDivision =

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(cableTrayValidationSchema),
    defaultValues: getDefaultValues(layoutEarthingData?.[0]),
    mode: "onSubmit",
  });

  useEffect(() => {
    reset(getDefaultValues(layoutEarthingData?.[0]));
  }, [layoutEarthingData, reset]);

  const handleError = (error: any) => {
    try {
      const errorObj = JSON.parse(error?.message) as any;
      message?.error(errorObj?.message);
    } catch (parseError) {
      console.error(parseError);
      message?.error(error?.message || "An unknown error occured");
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await updateData(
        `${LAYOUT_EARTHING}/${layoutEarthingData[0].name}`,
        false,
        data
      );
      await updateData(
        `${DESIGN_BASIS_REVISION_HISTORY_API}/${revision_id}`,
        false,
        {
          status: DB_REVISION_STATUS.Unsubmitted,
        }
      );
      message.success("Earthing Data Saved Successfully");
    } catch (error) {
      console.error("error: ", error);
      handleError(error);
    } finally {
      setLoading(false);
      router.push(
        `/project/${params.project_id}/design-basis/document-revision`
      );
    }
  };

  return (
    <>
      <div className="text-end">
        <h3 className="italic text-gray-500 text-sm">
          last modified: {lastModified}
        </h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Divider orientation="center" orientationMargin={0}>
          <span className="font-bold text-slate-700">
            Material Of Construction
          </span>
        </Divider>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="earthing_system"
              label="Earthing Connection as Per"
              options={earthing_system_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="earth_strip"
              label="Earth Strip MOC"
              options={earth_strip_options || []}
              size="small"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <CustomSingleSelect
              control={control}
              name="earth_pit"
              label="Earth Pit MOC"
              options={earthing_pit_options || []}
              size="small"
            />
          </div>
          <div className="flex-1">
            <CustomTextInput
              control={control}
              name="soil_resistivity"
              label="Soil Resistivity"
              addonAfter={"ohm"}
              size="small"
            />
          </div>
        </div>
        <div className="mt-2 flex w-full justify-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={userDivision !== projectDivision}
          >
            Save and Next
          </Button>
        </div>
      </form>
    </>
  );
};

export default Earthing;
