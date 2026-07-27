import RedirectStub, { redirectMetadata } from "@/components/RedirectStub";

export const metadata = redirectMetadata("/writing/", "Essays — moved");

export default function Page() {
  return <RedirectStub to="/writing/" label="Writing" />;
}
