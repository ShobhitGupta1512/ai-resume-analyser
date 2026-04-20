import { getToken } from "./authHelpers"

const authState = {
  user:    null,
  token:   getToken() || null,
  loading: false,
  error:   null,
}

export default authState