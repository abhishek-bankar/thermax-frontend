export const NEXT_PUBLIC_FRAPPE_DOMAIN_NAME =
  process.env.NEXT_PUBLIC_FRAPPE_DOMAIN_NAME;

export const SIGN_IN = "/auth/sign-in";
export const SIGN_UP = "/auth/sign-up";
export const RESET_PASSWORD = "/auth/reset-password";
export const UNAUTHORIZED = "/unauthorized";
export const UNVERIFIED = "/unverified";

export const HOME_PAGE = "/";
export const DASHBOARD_PAGE = "/dashboard";
export const PROJECTS_PAGE = "/project";
export const PACKAGE_PAGE = "/package-management";
export const COMPLETE_PROJECT_PAGE = "/complete-project";
export const USER_MANAGEMENT_PAGE = "/user-management";

// Division Names
export const BTG = "BTG";
export const ENVIRO = "Enviro";
export const HEATING = "Heating";
export const SERVICES = "WWS Services";
export const WWS_IPG = "WWS IPG";
export const WWS_SPG = "WWS SPG";

export const S3FolderMapping = {
  [ENVIRO]: "ENVIRO",
  [HEATING]: "HEATING",
  [SERVICES]: "WWS-SERVICES",
  [WWS_IPG]: "WWS-IPG",
  [WWS_SPG]: "WWS-SPG",
};

// Panel Types
export const MCC_PANEL_TYPE = "MCC";
export const PCC_PANEL_TYPE = "PCC";
export const MCCcumPCC_PANEL_TYPE = "MCC cum PCC";

// Role Names
export const THERMAX_USER = "Thermax User";
export const THERMAX_SUPERUSER = `Thermax Superuser`;
export const THERMAX_DEVELOPER = "Thermax Developer";
export const SYSTEM_MANAGER = "System Manager";

export const TagColors = {
  BTG: "magenta",
  Enviro: "green",
  Heating: "volcano",
  "WWS Services": "blue",
  "WWS IPG": "cyan",
  "WWS SPG": "red",
};

export const DB_REVISION_STATUS = {
  Unsubmitted: "Review Unsubmitted",
  Submitted: "Review Submitted",
  Resubmitted: "Review Resubmitted",
  ResubmittedAgain: "Review Resubmitted Again",
  Approved: "Approved",
  Released: "Released",
};
export const LOAD_LIST_REVISION_STATUS = {
  NotReleased: "Not Released",
  Released: "Released",
};

export const SLD_REVISION_STATUS = {
  DEFAULT: "DEFAULT",
  DOWNLOAD_READY: "DOWNLOAD_READY",
  IN_PROCESS: "IN_PROCESS",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
};
