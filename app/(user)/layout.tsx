import Toast from "@/components/Toast";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
      <Toast />
    </section>
  );
}
