export const getFrappeDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getThermaxDateFormat = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

export const getFrappeTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

export const convertToFrappeDatetime = (datetime: Date): string => {
  const expiresDate = getFrappeDate(datetime);
  const expiresTime = getFrappeTime(datetime);
  const expires = `${expiresDate} ${expiresTime}`;
  return expires;
};

export const mergeLists = (
  list1: any[],
  list2: any[],
  list1Key: string,
  list2Key: string
) => {
  const combinedList = [];
  for (const list1Item of list1 || []) {
    // Find a matching item in list2
    const matchingItem = list2?.find(
      (list2Item) => list1Item[list1Key] === list2Item[list2Key]
    );

    // If a match is found, combine the objects
    if (matchingItem) {
      combinedList.push({ ...list1Item, ...matchingItem });
    }
  }

  return combinedList;
};

export const changeNameToKey = (projectList: any[]) => {
  if (!projectList) return [];
  projectList.forEach((project) => {
    project.key = project.name;
  });
  return projectList;
};

// to sort Numerically
export function sortDropdownOptions(options: any[]): any[] {
  if (options && options.length !== 0) {
    return options?.sort((a, b) => {
      if (!isNaN(a.name) && !isNaN(b.name)) {
        return Number(a.name) - Number(b.name);
      }
      return 0;
    });
  } else {
    return [];
  }
}

// to sort DateWise

export function sortDatewise(data: any[]): any[] {
  if (data && data.length !== 0) {
    data.sort((a: any, b: any) => {
      const dateA = new Date(a.creation);
      const dateB = new Date(b.creation);
      return dateA.getTime() - dateB.getTime();
    });
  }

  return data;
}

// to place "NA" at the bottom
export function moveNAtoEnd(options: any[]): any[] {
  // Validate that options is a non-null array
  if (!Array.isArray(options) || options.length === 0) {
    return [];
  }

  // Separate "NA" items and other items
  const naItems = options.filter((item: any) => item?.name === "NA");
  const otherItems = options.filter((item: any) => item?.name !== "NA");

  // Return combined array with "NA" items at the end
  return [...otherItems, ...naItems];
}

//sort alphanumeric strings array containing space

export const sortAlphaNumericArray = (data: any) => {
  if (!data) return [];
  const sortedData = data?.sort((a: any, b: any) => {
    const numA = parseInt(a.name.split(" ")[0], 10);
    const numB = parseInt(b.name.split(" ")[0], 10);
    return numA - numB;
  });

  console.log(sortedData);
  return sortedData;
};
