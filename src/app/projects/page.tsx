import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

export const metadata = redirectMetadata("/work/", "Projects — moved");

export default function Page() {
  return <RedirectStub to="/work/" label="Work" />;
}
