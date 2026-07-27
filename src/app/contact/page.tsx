import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

export const metadata = redirectMetadata("/about/", "Contact — moved");

export default function Page() {
  return <RedirectStub to="/about/" label="About" />;
}
