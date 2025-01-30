import { PROJECT_API, PROJECT_INFO_API, TRCC_PANEL } from '@/configs/api-endpoints';
import { useGetData, useNewGetData } from '@/hooks/useCRUD';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { convertToFrappeDatetime } from '@/utils/helpers';
import { useParams, useRouter } from 'next/navigation';
import * as zod from "zod";
import React, { useEffect, useRef, useState } from 'react'
import useMCCPCCPanelDropdowns from './MCCPCCPanelDropdown';
import { zodResolver } from '@hookform/resolvers/zod';
import { trccPanelValidationSchema } from '../schemas';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Divider, message, Skeleton } from 'antd';
import CustomSingleSelect from '@/components/FormInputs/CustomSingleSelect';
import { updateData } from '@/actions/crud-actions';
import CustomTextInput from '@/components/FormInputs/CustomInput';

const getDefaultValues = (
    projectMetadata: any,
    projectInfo: any,
    trccPanelData: any
) => {
    return {
        secondary_voltage_input: trccPanelData?.secondary_voltage_input || "111 kV NO LOAD",
        secondary_current_output: trccPanelData?.secondary_current_output || "200 mA",
        bushing_orientation: trccPanelData?.bushing_orientation || "Horizontal",
        cable_entry: trccPanelData?.cable_entry || "Top",
        communication_protocol_input: trccPanelData?.communication_protocol_input || "RS 485"
    };
};

const TRCCPanel = ({
    revision_id,
    panel_id,
    setActiveKey,
}: {
    revision_id: string;
    panel_id: string;
    setActiveKey: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const params = useParams();
    const router = useRouter();
    const tabsCount = useRef("0");

    const project_id = params.project_id;
    const { data: trccPanelData, isLoading: isTrccPanelLoading } = useNewGetData(
        `${TRCC_PANEL}?fields=["*"]&filters=[["panel_id", "=", "${panel_id}"]]`
    );

    const lastModified = convertToFrappeDatetime(
        new Date(trccPanelData?.[0]?.modified)
    );

    const getProjectInfoUrl = `${PROJECT_INFO_API}/${project_id}`;
    const getProjectMetadataUrl = `${PROJECT_API}/${project_id}`;

    const { data: projectMetadata, isLoading: isProjectMetaDataLoading } = useGetData(getProjectMetadataUrl);
    const { data: projectInfo, isLoading: isProjectInfoLoading } = useGetData(getProjectInfoUrl);

    const [loading, setLoading] = useState(false);
    const userInfo = useCurrentUser();
    const userDivision = userInfo?.division;
    const projectDivision = projectMetadata?.division;

    console.log("TrccPanelData", trccPanelData);

    const isLoading = isTrccPanelLoading || isProjectInfoLoading || isProjectMetaDataLoading;

    const { dropdown } = useMCCPCCPanelDropdowns()

    const { formState, control, watch, reset, setValue, handleSubmit } = useForm({
        resolver: zodResolver(trccPanelValidationSchema),
        defaultValues: getDefaultValues(
            projectMetadata,
            projectInfo,
            trccPanelData?.[0]
        ),
        mode: "onSubmit",
    });

    useEffect(() => {
        window.scroll(0, 0);
    }, []);

    useEffect(() => {
        reset(getDefaultValues(projectMetadata, projectInfo, trccPanelData?.[0]));
    }, [trccPanelData, projectMetadata, projectInfo, reset]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            tabsCount.current = localStorage.getItem("dynamic-tabs-count") ?? "0";
        }
    }, []);



    const handleError = (error: any) => {
        try {
            const errorObj = JSON.parse(error?.message) as any;
            message?.error(errorObj?.message);
        } catch (parseError) {
            console.error(parseError);
            message?.error(error?.message || "An unknown error occured");
        }
    };


    const onSubmit: SubmitHandler<
        zod.infer<typeof trccPanelValidationSchema>
    > = async (data) => {
        setLoading(true);
        try {
            // console.log(data);

            const fieldsToStringify = ["mi_analog", "mi_digital", "panel_incomer_protection"];

            const transformedData: any = { ...data };

            fieldsToStringify.forEach((field) => {
                if (Array.isArray(transformedData[field])) {
                    transformedData[field] = JSON.stringify(transformedData[field]);
                }
            });
            await updateData(
                `${TRCC_PANEL}/${trccPanelData[0].name}`,
                false,
                transformedData
            );
            message.success("Panel Data Saved Successfully");
            const redirectToLayout = () => {
                router.push(`/project/${project_id}/design-basis/layout`);
            };
            // const tabsCount = localStorage.getItem("dynamic-tabs-count") ?? "0";
            setActiveKey((prevKey: string) => {
                if (prevKey == tabsCount.current) {
                    redirectToLayout();
                    // return "1";
                }

                return (parseInt(prevKey, 10) + 1).toString();
            });
            // setActiveKey((prevKey: string) => (parseInt(prevKey, 10) + 1).toString());
        } catch (error) {
            console.error("error: ", error);
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div>
                <Skeleton active paragraph={{ rows: 8 }} />
            </div>
        );
    }

    return (
        <>
            <div className="text-end">
                <h3 className="italic text-gray-500 text-sm">
                    last modified: {lastModified}
                </h3>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-2 px-4"
            >
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <CustomTextInput
                            control={control}
                            name="secondary_voltage_input"
                            label="Secondary Voltage Input"
                            size="small"
                        />
                    </div>
                    <div className="flex-1">
                        <CustomTextInput
                            control={control}
                            name="secondary_current_output"
                            label="Secondary Current Output"
                            size="small"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">

                    <div className="flex-1">
                        <CustomSingleSelect
                            control={control}
                            name="bushing_orientation"
                            label="Bushing Orientation"
                            options={ dropdown["Bushing Orientation"] || []}
                            size="small"
                        />
                    </div>
                    <div className="flex-1">
                        <CustomSingleSelect
                            control={control}
                            name="cable_entry"
                            label="Cable Entry"
                            options={ dropdown["TRCC Cable Entry"] || []}
                            size="small"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">

                    <div className="w-1/2">
                        <CustomTextInput
                            control={control}
                            name="communication_protocol_input"
                            label="Communication Protocol Input"
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
    )
}

export default TRCCPanel