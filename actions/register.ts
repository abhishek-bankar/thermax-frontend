"use server";

import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import {
  CREDENTIALS_EMAIL_API,
  EMAIL_VERIFICATION_API,
  NEXT_AUTH_USER_API,
  THERMAX_USER_API,
  USER_API,
} from "@/configs/api-endpoints";
import { BTG, NEXT_PUBLIC_FRONTEND_URL } from "@/configs/constants";
import { adminApiClient } from "./axios-clients";
import { createData, getData, updateData } from "./crud-actions";
import { getSuperuserEmail } from "./user-actions"; 
import { sendMail } from "./mail";

export const generateSimplePassword = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  return password;
};

export const checkUserExists = async (email: string) => {
  try {
    await getData(`${USER_API}/${email}`);
    return true;
  } catch (error: any) {
    throw error;
  }
};

export const checkNextAuthUserExists = async (
  email: string
): Promise<boolean> => {
  try {
    await getData(`${NEXT_AUTH_USER_API}/${email}`);
    return true;
  } catch (error: any) {
    throw error;
  }
};

export const createFrappeUser = async (
  email: string,
  first_name: string,
  last_name: string,
  role: string
) => {
  try {
    await createData(USER_API, true, {
      email,
      first_name,
      last_name,
      enabled: 1,
      roles: [
        {
          role: role,
        },
        {
          role: "System Manager",
        },
      ],
      send_welcome_email: 0,
    });
  } catch (error) {
    throw error;
  }
};

export const createNextAuthUser = async (
  email: string,
  hashedPassword: string,
  token: string
) => {
  try {
    await createData(NEXT_AUTH_USER_API, true, {
      linked_user: email,
      hashed_password: hashedPassword,
      email_verification_token: token,
      email_verified: false,
    });
  } catch (error) {
    throw error;
  }
};

export const createThermaxExtendedUser = async (
  email: string,
  division: string,
  name_initial: string,
  is_superuser: boolean
) => {
  try {
    await createData(THERMAX_USER_API, true, {
      email,
      division,
      name_initial,
      is_superuser,
    });
  } catch (error) {
    throw error;
  }
};

export const sendUserVerificationEmail = async (
  email: string,
  division_name: string,
  sent_by: string,
  token: string
) => {
  try {
    // await createData(EMAIL_VERIFICATION_API, true, {
    //   email,
    //   division_name,
    //   verification_link: `${NEXT_PUBLIC_FRONTEND_URL}/auth/verify-account?token=${token}`,
    //   sent_by,
    // });

    // await sendMail("email_verification_email", {
    //   recipient_email: email,
    //   division_name, 
    //   subject: "Verify your email account",
    //   verification_link: `${NEXT_PUBLIC_FRONTEND_URL}/auth/verify-account?token=${token}`,
    //   sent_by,
    // });
  } catch (error) {
    throw error;
  }
};

export const registerNewUser = async (
  values: any,
  user_role: string,
  division: string,
  is_superuser: boolean,
  name_initial: string = ""
) => {
  const { email, first_name, last_name } = values;

  try {
    const userExists = await checkUserExists(email);
    if (userExists) {
      return {
        message: "User already exists",
        type: "UserExistsError",
        status: 409,
      };
    }
  } catch (error: any) {
    const errObj: any = JSON.parse(error.message);
    if (errObj.type === "DoesNotExistError" && errObj.status === 404) {
      try {
        await createFrappeUser(email, first_name, last_name, user_role);
        const token = uuid();
        const hashedPassword = await bcrypt.hash("Admin", 10);
        await createNextAuthUser(email, hashedPassword, token);
        await createThermaxExtendedUser(
          email,
          division,
          name_initial,
          is_superuser
        );
        await sendCredentialsEmail(email, division, is_superuser);
      } catch (error) {
        throw error;
      }

      return {
        message: "User created successfully",
        type: "UserCreated",
        status: 201,
      };
    }
  }
};

export const sendCredentialsEmail = async (
  email: string,
  division_name: string,
  is_superuser: string | boolean
) => {
  try {
    let cc_email = "";
    if (is_superuser) {
      cc_email = await getSuperuserEmail(BTG);
    } else {
      cc_email = await getSuperuserEmail(division_name);
    }
    const system_generated_password = await generateSimplePassword();
    const hashed_password = await bcrypt.hash(system_generated_password, 10);
    await updateData(`${NEXT_AUTH_USER_API}/${email}`, true, {
      email_verified: true,
      hashed_password,
    });

    const superuser = await getData(`${USER_API}/${cc_email}`);

    // await createData(CREDENTIALS_EMAIL_API, true, {
    //   recipient_email: email,
    //   cc_email: cc_email,
    //   password: system_generated_password,
    //   division_name,
    //   is_superuser,
    //   sent_by: is_superuser
    //     ? "Team BTG"
    //     : `${superuser?.first_name} ${superuser?.last_name}`,
    //   subject: "Added New User - EnIMAX",
    // });

    await sendMail("send_credentials", {
      recipient_email: email,
      cc_email: cc_email,
      password: system_generated_password,
      division_name,
      is_superuser,
      sent_by: is_superuser
        ? "Team BTG"
        : `${superuser?.first_name} ${superuser?.last_name}`,
      subject: "Added New User - EnIMAX",
    });
  } catch (error) {
    throw error;
  }
};
