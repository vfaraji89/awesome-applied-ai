import { Redirect } from "@/components/redirect";
export const metadata = { title: "Docs", robots: { index: false } };
export default function Page() { return <Redirect to="/docs/" />; }
