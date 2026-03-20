import { AdminReservationCalendar } from "@/components/AdminReservationCalendar";

export const metadata = {
  title: "Admin | Peak Gaming",
  description: "Admin reservation calendar with contact details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminReservationCalendar />;
}
