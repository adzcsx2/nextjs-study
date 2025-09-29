import { USER_ROLE, USER_SEX, USER_STATUS } from "@/utils/constants";
import { ValueOf } from "next/dist/shared/lib/constants";

export interface LoginRes {
  name: string;
  _id: string;
  role: string;
  status: string;
  nickName: string;
  token: string | null;
}

export interface LoginReq {
  name: string;
  password: string;
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
  editData?: LoginReq;
}
