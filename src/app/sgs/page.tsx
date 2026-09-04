import { redirect } from "next/navigation";

export default function SgsPageRedirect() {
  const sgsUrl = process.env.NEXT_PUBLIC_SGS_URL || "https://sgs-brown.vercel.app";
  redirect(sgsUrl);
}

