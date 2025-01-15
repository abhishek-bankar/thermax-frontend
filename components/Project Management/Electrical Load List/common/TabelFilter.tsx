// import React, { useState, useCallback } from 'react';
// import { Select, Input, DatePicker, Button, Space, Form } from 'antd';
// import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
// import type { Dayjs } from 'dayjs';

// const { RangePicker } = DatePicker;
// const { Option } = Select;

// export interface FilterConfig {
//   key: string;
//   label: string;
//   type: 'select' | 'input' | 'dateRange';
//   options?: Array<{
//     value: string | number;
//     label: string;
//   }>;
//   placeholder?: string;
// }

// export interface FilterValues {
//   [key: string]: string | string[] | [Dayjs, Dayjs] | undefined;
// }

// interface TableFilterProps {
//   filters: FilterConfig[];
//   onFilter: (values: FilterValues) => void;
//   loading?: boolean;
//   initialValues?: FilterValues;
// }

// const TableFilter: React.FC<TableFilterProps> = ({
//   filters,
//   onFilter,
//   loading = false,
//   initialValues = {},
// }) => {
//   const [form] = Form.useForm();
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleReset = useCallback(() => {
//     form.resetFields();
//     onFilter({});
//   }, [form, onFilter]);

//   const handleFinish = useCallback((values: FilterValues) => {
//     // Remove empty values
//     const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
//       if (value !== undefined && value !== '' && value !== null) {
//         if (Array.isArray(value) && value.length === 0) {
//           return acc;
//         }
//         acc[key] = value;
//       }
//       return acc;
//     }, {} as FilterValues);
    
//     onFilter(filteredValues);
//   }, [onFilter]);

//   const renderFilterInput = useCallback((filter: FilterConfig) => {
//     console.log(filter);
    
//     switch (filter.type) {
//       case 'select':
//         return (
//           <Select 
//             placeholder={filter.placeholder || `Select ${filter.label}`}
//             style={{ width: '100%' }}
//           >
//             {filter.options?.map((option) => (
//               <Option key={option.value} value={option.value}>
//                 {option.label}
//               </Option>
//             ))}
//           </Select>
//         );
//       case 'dateRange':
//         return (
//           <RangePicker
//             style={{ width: '100%' }}
//             placeholder={[
//               filter.placeholder || 'Start Date',
//               filter.placeholder || 'End Date'
//             ]}
//           />
//         );
//       default:
//         return (
//           <Input
//             placeholder={filter.placeholder || `Enter ${filter.label}`} 
//           />
//         );
//     }
//   }, []);

//   return (
//     <Form
//       form={form}
//       onFinish={handleFinish}
//       initialValues={initialValues}
//       className="mb-4"
//     >
//       <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-16'} overflow-hidden`}>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {filters.map((filter) => (
//             <Form.Item
//               key={filter.key}
//               name={filter.key}
//               label={filter.label}
//               className="mb-2"
//             >
//               {renderFilterInput(filter)}
//             </Form.Item>
//           ))}
//         </div>
//       </div>

//       <Space className="mt-4">
//         <Button
//           type="primary"
//           icon={<FilterOutlined />}
//           htmlType="submit"
//           loading={loading}
//         >
//           Filter
//         </Button>
//         <Button
//           icon={<ClearOutlined />}
//           onClick={handleReset}
//           disabled={loading}
//         >
//           Reset
//         </Button>
//         <Button
//           type="link"
//           onClick={() => setIsExpanded(!isExpanded)}
//         >
//           {isExpanded ? 'Show Less' : 'Show More'}
//         </Button>
//       </Space>
//     </Form>
//   );
// };

// export default TableFilter;





import React, { useState, useCallback } from 'react';
import { Select, Input, DatePicker, Button, Space, Form } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'input' | 'dateRange';
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string | string[] | [Dayjs, Dayjs] | undefined;
}

interface TableFilterProps {
  filters: FilterConfig[];
  onFilter: (values: FilterValues) => void;
  loading?: boolean;
  initialValues?: FilterValues;
}

const TableFilter: React.FC<TableFilterProps> = ({
  filters,
  onFilter,
  loading = false,
  initialValues = {},
}) => {
  const [form] = Form.useForm();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReset = useCallback(() => {
    form.resetFields();
    onFilter({});
  }, [form, onFilter]);

  const handleFinish = useCallback((values: FilterValues) => {
    const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        acc[key] = value;
      }
      return acc;
    }, {} as FilterValues);
    onFilter(filteredValues);
  }, [onFilter]);

  const renderFilterInput = useCallback((filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select
            placeholder={filter.placeholder || `Select ${filter.label}`}
            className="w-full"
          >
            {filter.options?.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      case 'dateRange':
        return (
          <RangePicker
            className="w-full"
            placeholder={[
              filter.placeholder || 'Start Date',
              filter.placeholder || 'End Date'
            ]}
          />
        );
      default:
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            className="w-full"
          />
        );
    }
  }, []);

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      initialValues={initialValues}
      className=""
      layout="vertical"
    >
      <div 
        className={`transition-all duration-300 ${
          isExpanded ? 'max-h-96' : 'max-h-16'
        } overflow-hidden`}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {filters.map((filter) => (
            <Form.Item
              key={filter.key}
              name={filter.key}
              label={filter.label}
              className=""
            >
              {renderFilterInput(filter)}
            </Form.Item>
          ))}
        </div>
      </div>
      
      <Space className="">
        <Button
          type="primary"
          icon={<FilterOutlined />}
          htmlType="submit"
          loading={loading}
          className="inline-flex items-center"
        >
          Filter
        </Button>
        <Button
          icon={<ClearOutlined />}
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center"
        >
          Reset
        </Button>
        <Button
          type="link"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      </Space>
    </Form>
  );
};

export default TableFilter;