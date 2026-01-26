import { CHANGE_ROLE } from "../types";

export const changeUserRole = (role: string) => ({
  type: CHANGE_ROLE,
  payload: role,
});
