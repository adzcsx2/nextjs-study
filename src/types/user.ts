import { USER_ROLE, USER_SEX, USER_STATUS } from "@/utils/constants";
import { ValueOf } from "next/dist/shared/lib/constants";

export interface User {
  name?: string;
  _id?: string;
  role?: string;
  status?: string;
  nickName?: string;
  createAt?: string;
  token?: string;
}

export interface UserQueryType {
  current?: number;
  pageSize?: number;
  name?: string;
  all?: boolean;
  status?: USER_STATUS;
}

export interface UserFormProps {
  title: string;
  editData?: User;
}
