import axios from "@/utils/axios";

//===================登入===================//
export async function set_sign_in(payload) {
  const res = await axios.post("/api/sign/in", payload);
  if (!res.error) {
    return true;
  } else {
    return false;
  }
}
