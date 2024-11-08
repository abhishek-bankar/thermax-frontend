"use client"
import { Button, Divider, message, Radio, RadioChangeEvent, Select } from "antd"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { createData, getData, updateData } from "actions/crud-actions"
import { createDropdownOptions } from "components/Package Management/package-management.logic"
import {
  BATTERY_LIMIT_API,
  DESIGN_BASIS_GENERAL_INFO_API,
  MAIN_PKG_API,
  MOTOR_PARAMETER_API,
  PROJECT_MAIN_PKG_API,
  PROJECT_MAIN_PKG_LIST_API,
  SUB_PKG_API,
} from "configs/api-endpoints"
import { useGetData } from "hooks/useCRUD"
import { useDropdownOptions } from "hooks/useDropdownOptions"
import { useLoading } from "hooks/useLoading"
import GIPkgSelectionTabs from "./GIPkgSelection"

const GeneralInfo = ({ revision_id }: { revision_id: string }) => {
  const params = useParams()
  const [selectedPkg, setSelectedPkg] = useState("")
  const [addPkgLoading, setAddPkgLoading] = useState(false)
  const { data: dbPkgList } = useGetData(`${MAIN_PKG_API}?fields=["*"]`)
  const [generalInfoData, setGeneralInfoData] = useState<any>({})
  const [refresh, setRefresh] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const router = useRouter()

  const { setLoading: setModalLoading } = useLoading()
  useEffect(() => {
    setModalLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const generalInfoDefaultData = await getData(
        `${DESIGN_BASIS_GENERAL_INFO_API}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
      )

      const mainPkgData = await getData(`${PROJECT_MAIN_PKG_LIST_API}?revision_id=${revision_id}`)
      if (generalInfoDefaultData && generalInfoDefaultData.length > 0) {
        setGeneralInfoData({
          is_package_selection_enabled: generalInfoDefaultData[0]?.is_package_selection_enabled,
          pkgList: mainPkgData,
          battery_limit: generalInfoDefaultData[0]?.battery_limit,
        })
      }
    }
    fetchData()
  }, [refresh, revision_id])

  const projectMainPkgUrl = `${PROJECT_MAIN_PKG_LIST_API}?revision_id=${revision_id}`

  const filteredOptions = dbPkgList?.filter(
    (pkg: any) =>
      pkg.package_name !== selectedPkg &&
      !generalInfoData?.pkgList?.some((mainPkg: any) => mainPkg.main_package_name === pkg.package_name)
  )
  const { dropdownOptions: batteryLimitOptions } = useDropdownOptions(BATTERY_LIMIT_API, "name")

  const handleAddPkg = async () => {
    setAddPkgLoading(true)

    const subPkgUrl = `${SUB_PKG_API}?fields=["*"]&filters=[["main_package_name", "=", "${selectedPkg}"]]`
    if (!selectedPkg) {
      setAddPkgLoading(false)
      return
    }
    const subPkgData = await getData(subPkgUrl)
    const subPkgCreateData = subPkgData?.map((subPkg: any) => ({
      main_package_name: selectedPkg,
      sub_package_name: subPkg?.package_name,
      area_of_classification: subPkg?.classification_area,
      is_sub_package_selected: false,
    }))
    await createData(PROJECT_MAIN_PKG_API, false, {
      revision_id: revision_id,
      main_package_name: selectedPkg,
      sub_packages: subPkgCreateData,
    })
    setRefresh(!refresh)
    setSelectedPkg("")
    setAddPkgLoading(false)
  }

  const handleSave = async () => {
    setSaveLoading(true)
    const existingDesignBasis = await getData(
      `${DESIGN_BASIS_GENERAL_INFO_API}?filters=[["revision_id", "=", "${revision_id}"]]`
    )
    if (existingDesignBasis && existingDesignBasis.length > 0) {
      await updateData(`${DESIGN_BASIS_GENERAL_INFO_API}/${existingDesignBasis[0].name}`, false, {
        is_package_selection_enabled: generalInfoData?.is_package_selection_enabled,
        battery_limit: generalInfoData?.battery_limit,
      })
    } else {
      await createData(DESIGN_BASIS_GENERAL_INFO_API, false, {
        revision_id,
        is_package_selection_enabled: generalInfoData.is_package_selection_enabled,
        battery_limit: generalInfoData.battery_limit,
      })
    }
    const pkgList = generalInfoData?.pkgList
    if (pkgList && pkgList.length > 0) {
      let hasHazardousArea = false
      for (const mainPkg of pkgList) {
        const subPkgList = mainPkg?.sub_packages
        const updateSubPkgList = []
        if (subPkgList && subPkgList.length > 0) {
          for (const subPkg of subPkgList) {
            if (subPkg.area_of_classification === "Hazardous Area" && Boolean(subPkg.is_sub_package_selected)) {
              hasHazardousArea = true
            }
            updateSubPkgList.push({
              sub_package_name: subPkg.sub_package_name,
              area_of_classification: subPkg.area_of_classification,
              is_sub_package_selected: subPkg.is_sub_package_selected,
            })
          }
        }

        await updateData(`${PROJECT_MAIN_PKG_API}/${mainPkg.name}`, false, {
          main_package_name: mainPkg.main_package_name,
          sub_packages: updateSubPkgList,
          standard: mainPkg?.standard,
          zone: mainPkg?.zone,
          gas_group: mainPkg?.gas_group,
          temperature_class: mainPkg?.temperature_class,
        })
      }

      const motorParameters = await getData(
        `${MOTOR_PARAMETER_API}?fields=["*"]&filters=[["revision_id", "=", "${revision_id}"]]`
      )

      const isHazardousAreaPresent = hasHazardousArea ? true : false

      if (motorParameters && motorParameters.length > 0) {
        // Update existing motor parameters
        await updateData(`${MOTOR_PARAMETER_API}/${motorParameters[0].name}`, false, {
          is_hazardous_area_present: isHazardousAreaPresent,
        })
      } else {
        // Create new motor parameters if none exist
        await createData(MOTOR_PARAMETER_API, false, {
          revision_id,
          is_hazardous_area_present: isHazardousAreaPresent,
        })
      }
    }
    setSaveLoading(false)
    message.success("Design Basis General Info saved successfully")
    setModalLoading(true)
    router.push(`/project/${params.project_id}/design-basis/motor-parameters`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          <div className="font-bold text-slate-800">Package Selection</div>
          <div>
            <Radio.Group
              defaultValue={1}
              value={generalInfoData?.is_package_selection_enabled}
              onChange={(e: RadioChangeEvent) =>
                setGeneralInfoData({ ...generalInfoData, is_package_selection_enabled: e.target.value })
              }
            >
              <Radio value={1}>Yes</Radio>
              <Radio value={0}>No</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-4">
          <div className="text-sm font-semibold text-slate-700">Main Package</div>
          <div className="flex w-1/2">
            <Select
              placeholder="Select main package"
              onChange={setSelectedPkg}
              options={createDropdownOptions(filteredOptions, "package_name")}
              style={{ width: "100%" }}
              allowClear={false}
              disabled={generalInfoData?.is_package_selection_enabled === 0}
            />
          </div>
          <div className="">
            <Button
              type="primary"
              onClick={handleAddPkg}
              loading={addPkgLoading}
              disabled={generalInfoData?.is_package_selection_enabled === 0}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      <GIPkgSelectionTabs
        mainPkgUrl={projectMainPkgUrl}
        generalInfoData={generalInfoData}
        setMainPkgData={null}
        setGeneralInfoData={setGeneralInfoData}
        refresh={refresh}
        setRefresh={setRefresh}
      />
      <Divider>
        <span className="font-bold text-slate-700">Battery Limit</span>
      </Divider>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="flex w-3/4 gap-4">
            <p className="text-sm font-semibold"> Power Supply At </p>
            <div className="flex-1">
              <Select
                options={batteryLimitOptions}
                value={generalInfoData?.battery_limit}
                size="small"
                style={{ width: "100%" }}
                onChange={(value) => setGeneralInfoData({ ...generalInfoData, battery_limit: value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full justify-end gap-4">
        <Button type="primary" onClick={handleSave} loading={saveLoading}>
          Save
        </Button>
      </div>
    </div>
  )
}

export default GeneralInfo
