"use client"

import { QuestionCircleOutlined } from "@ant-design/icons"
import { Button, FloatButton } from "antd"
import DesignBasis from "components/Project Components/Design Basis/DesignBasis"
import ElectricalLoadList from "components/Project Components/Electrical Load List/ElectricalLoadList"
import ProjectInfo from "components/Project Components/ProjectInfo"
import { useState } from "react"

const tabData = [
  { label: "Project Information", key: "1" },
  { label: "Design Basis", key: "2" },
  { label: "Electrical Load List", key: "3" },
  { label: "SLD", key: "4" },
  { label: "Cable Tray", key: "5" },
  { label: "Earthing", key: "6" },
  { label: "Lighting", key: "7" },
  { label: "Sizing", key: "8" },
]

export default function Page({ params }: { params: { slug: string } }) {
  const [openTab, setOpenTab] = useState<string>("1") // current open tab
  const [savedTabs, setSavedTabs] = useState<string[]>([]) // array to track saved tabs

  // Check if a tab is saved
  const isSaved = (tabKey: string) => savedTabs.includes(tabKey)

  // Handle tab click
  const handleTabClick = (tabKey: string) => {
    // Prevent navigating to a tab if it's not saved and not immediately next to a saved tab
    const currentIndex = tabData.findIndex((tab) => tab.key === openTab)
    const targetIndex = tabData.findIndex((tab) => tab.key === tabKey)

    if (targetIndex <= currentIndex || (targetIndex === currentIndex + 1 && isSaved(openTab))) {
      setOpenTab(tabKey)
    }
  }

  const changeTab = (tab: string) => {
    setOpenTab(tab) // set the tab to desired tab
  }

  // Handle save action
  const handleSave = () => {
    if (!isSaved(openTab)) {
      setSavedTabs([...savedTabs, openTab])
    }
  }

  // Render the tab classes based on their state
  const renderTabClass = (tabKey: string) => {
    if (openTab === tabKey) {
      return isSaved(tabKey) ? "bg-green-500 text-white" : "bg-orange-500 text-white" // Current tab (saved or unsaved)
    }
    if (savedTabs.includes(tabKey)) {
      return "bg-blue-500 text-white" // Visited and saved
    }
    let nextIndex = tabData.findIndex((tab) => tab.key === openTab) + 1
    if (tabData[nextIndex] && tabData[nextIndex].key === tabKey && savedTabs.includes(openTab)) {
      return "bg-white text-gray-600" // visitable
    }
    return "bg-gray-300 text-gray-600 cursor-not-allowed" // Unvisited, disabled
  }

  return (
    <>
      <div className="m-4 flex flex-wrap">
        <div className="w-full">
          <ul className="mb-0 flex  list-none flex-row flex-wrap pb-4 pt-3" role="tablist">
            {tabData.map((tab) => (
              <li key={tab.key} className="-mb-px mr-2 flex-auto text-center last:mr-0">
                <a
                  className={
                    "block rounded border px-5 py-3 text-xs font-bold uppercase leading-normal shadow-lg " +
                    renderTabClass(tab.key)
                  }
                  onClick={(e) => {
                    e.preventDefault()
                    handleTabClick(tab.key)
                  }}
                  data-toggle="tab"
                  href={`#link${tab.key}`}
                  role="tablist"
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded bg-white shadow-lg">
            <div className="flex-auto px-4 py-5">
              <div className="tab-content tab-space">
                {/* Tab Content */}
                <div className={openTab === "1" ? "block" : "hidden"} id="link1">
                  <ProjectInfo isSaved={isSaved} handleSave={handleSave} changeTab={changeTab} />
                </div>

                <div className={openTab === "2" ? "block" : "hidden"} id="link2">
                  <DesignBasis handleSave={handleSave} />
                </div>

                <div className={openTab === "3" ? "block" : "hidden"} id="link3">
                  <ElectricalLoadList handleSave={() => {}} />
                </div>

                <div className={openTab === "4" ? "block" : "hidden"} id="link4">
                  <p>Content of SLD</p>
                </div>

                <div className={openTab === "5" ? "block" : "hidden"} id="link5">
                  <p>Content of Cable Tray</p>
                </div>

                <div className={openTab === "6" ? "block" : "hidden"} id="link6">
                  <p>Content of Earthing</p>
                </div>

                <div className={openTab === "7" ? "block" : "hidden"} id="link7">
                  <p>Content of Lighting</p>
                </div>

                <div className={openTab === "8" ? "block" : "hidden"} id="link8">
                  <p>Content of Sizing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="flex w-full justify-end gap-4">
          <Button type="primary" onClick={handleSave} disabled={isSaved(openTab)}>
            {isSaved(openTab) ? "Saved" : "Save Tab"}
          </Button>
        </div> */}

        <FloatButton icon={<QuestionCircleOutlined />} />
      </div>
    </>
  )
}
