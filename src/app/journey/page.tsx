import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

export const metadata = redirectMetadata("/about/", "Journey — moved");

export default function Page() {
  return <RedirectStub to="/about/" label="About" />;
}
