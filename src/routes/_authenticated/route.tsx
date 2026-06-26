import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getStaffSession } from "@/integrations/supabase/staffAuth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const staff = getStaffSession();
    if (staff?.user) {
      return {
        user: staff.user,
        erpRole: staff.user.user_metadata.erpRole,
        department: staff.user.user_metadata.department,
      };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    return {
      user: data.user,
      erpRole: roleData?.role ?? "member",
      department: null,
    };
  },
  component: () => <Outlet />,
});
