import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PowerIcon from "@/icons/PowerIcon";
import { useUserStore } from "@/store/zustandStores";
import {
  useGetAttendanceDashboardQuery,
  useGetAttendanceHistoryQuery,
  useClockInMutation,
  useClockOutMutation,
  type AttendanceRecord,
} from "@/redux/api/settingsApi";
import Loader from "@/components/Loader";

const ClockInOut: React.FC = () => {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  // ---- API Queries ----
  const {
    data: dashData,
    isLoading: dashLoading,
    isError: dashError,
  } = useGetAttendanceDashboardQuery();

  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
  } = useGetAttendanceHistoryQuery({ limit: 30 });

  // ---- API Mutations ----
  const [clockInApi, { isLoading: clockingIn }] = useClockInMutation();
  const [clockOutApi, { isLoading: clockingOut }] = useClockOutMutation();

  // ---- 1. Accurately Determine Clocked-In Status ----
  const currentAttendance = dashData?.data?.current_attendance;

  // A user is clocked in if current_attendance exists AND clock_out is null/undefined
  const isClockedIn = !!currentAttendance && !currentAttendance.clock_out;

  // ---- Derived Data ----
  const history: AttendanceRecord[] = historyData?.data ?? [];

  // Find clock in time
  const clockInTime = currentAttendance?.clock_in
    ? new Date(currentAttendance.clock_in).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
    : "--";

  // Calculate worked minutes dynamically
  const workedMinutes = useMemo(() => {
    if (!currentAttendance?.clock_in) return 0;
    const end = currentAttendance.clock_out
      ? new Date(currentAttendance.clock_out)
      : new Date();
    const start = new Date(currentAttendance.clock_in);
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  }, [currentAttendance]);

  // Calculate breaks
  const breakMinutes = useMemo(() => {
    if (!currentAttendance?.breaks) return 0;
    return currentAttendance.breaks.reduce((acc, b) => {
      if (!b.end_at) return acc;
      return acc + Math.floor((new Date(b.end_at).getTime() - new Date(b.start_at).getTime()) / 60000);
    }, 0);
  }, [currentAttendance]);

  // ---- Handle Click ----
  const handleClock = async () => {
    const loadingToast = toast.loading(
      isClockedIn ? t("Clocking out...") : t("Clocking in...")
    );
    try {
      if (isClockedIn) {
        await clockOutApi().unwrap();
        toast.success(t("Clocked out successfully!"), { id: loadingToast });
      } else {
        await clockInApi().unwrap();
        toast.success(t("Clocked in successfully!"), { id: loadingToast });
      }
      // RTK Query will auto-refetch dashboard and history due to invalidatesTags
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
        err?.message ||
        t("Failed to update clock status. Please try again."),
        { id: loadingToast }
      );
    }
  };

  // ---- Map History to Activities ----
  const activities = useMemo(() => {
    return history.slice(0, 10).map((r) => {
      const d = new Date(r.work_date);
      const dateLabel = d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
      });
      const [day, month] = dateLabel.split(" ");

      const inTime = r.clock_in
        ? new Date(r.clock_in).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "--";
      const outTime = r.clock_out
        ? new Date(r.clock_out).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        : null;

      return {
        day,
        month,
        text: outTime
          ? t("Clocked in {{in}} – out {{out}}", { in: inTime, out: outTime })
          : t("Clocked in {{in}}", { in: inTime }),
        ago: outTime ? t("Completed") : t("In progress"),
      };
    });
  }, [history, t]);

  // ---- Info Boxes ----
  const infoBoxes = [
    () => ({
      content: (
        <>
          <img
            src={user?.profilePic}
            alt="avatar"
            className="w-14 h-14 rounded-full mr-2 inline-block align-middle"
          />
          <div className="flex flex-col justify-around">
            <span className="align-middle font-medium">{user?.name}</span>
            <span className="text-sm font-normal">{user?.role}</span>
          </div>
        </>
      ),
      className: "min-w-[120px] flex items-center flex-row",
    }),
    () => ({
      content: (
        <div className="flex flex-col justify-center items-center">
          <span className="font-bold">{clockInTime}</span>
          <span className="text-xs">{t("Clock in")}</span>
        </div>
      ),
      className: "",
    }),
    () => ({
      content: (
        <>
          <span className="font-bold">
            {Math.floor(workedMinutes / 60).toString().padStart(2, "0")}
          </span>
          <span className="text-xs">
            {t("hrs")} <br />
            {t("Worked today")}
          </span>
        </>
      ),
      className: "",
    }),
    () => ({
      content: (
        <>
          <span className="font-bold">{breakMinutes.toString().padStart(2, "0")}</span>
          <span className="text-xs">
            {t("mins")} <br />
            {t("Break")}
          </span>
        </>
      ),
      className: "",
    }),
    () => ({
      content: (
        <>
          <span className="font-bold">{dashData?.data?.leave_balance ?? "--"}</span>
          <span className="text-xs">{t("Leaves Left")}</span>
        </>
      ),
      className: "",
    }),
  ];

  // ---- Loading / Error States ----
  if (dashLoading && !dashData) {
    return <div className="p-10 text-center"><div className="flex items-center justify-center w-full min-h-[60vh]">
      <Loader />
    </div></div>;
  }
  if (dashError) {
    return (
      <div className="p-10 text-center text-red-600">
        {t("Failed to load attendance data.")}
      </div>
    );
  }

  const busy = clockingIn || clockingOut;

  return (
    <div className="m-6 px-2 sm:px-6 md:px-10 py-6 w-full">
      <h1 className="text-3xl sm:text-2xl font-bold mb-6">
        {t("Employee Clock in / out")}
      </h1>

      {/* Clock Button Area */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex flex-col items-center bg-white custom-shadow px-12 py-10 rounded-lg">
          <div className="rounded-full shadow-lg">
            <div
              className={`w-24 h-24 md:w-32 md:h-32 flex justify-center items-center rounded-full transition-colors duration-300 ${isClockedIn ? "bg-primary-gradient" : "bg-primary-gradient-light"
                }`}
            >
              {isClockedIn ? <PowerIcon color="white" /> : <PowerIcon />}
            </div>
          </div>

          {/* Conditional Rendering */}
          <div className="mt-6 w-[150px] text-center">
            {busy ? (
              <button
                disabled
                className="transition-all duration-200 w-[148px] p-3 rounded-xl bg-gray-300 text-gray-600 cursor-not-allowed opacity-80"
              >
                {t("Processing...")}
              </button>
            ) : isClockedIn ? (
              <button
                onClick={handleClock}
                className="transition-all duration-200 w-[148px] p-3 rounded-xl text-black gradient-border-inner bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
              >
                {t("Clock out")}
              </button>
            ) : (
              <button
                onClick={handleClock}
                className="transition-all duration-200 w-[148px] p-3 rounded-xl bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white shadow-md hover:opacity-90"
              >
                {t("Clock in")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {infoBoxes.map((fn, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-3 flex flex-col items-center justify-center text-center ${i === 0
                ? "bg-primary-gradient-light text-primary"
                : "bg-primary-gradient text-white"
              } ${fn().className}`}
            style={{ minWidth: 110 }}
          >
            {fn().content}
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{t("Recent Activities")}</h2>
        {historyLoading && !historyData && (
          <div className="text-center text-gray-500">{t("Loading...")}</div>
        )}
        {historyError && (
          <div className="text-center text-red-600">
            {t("Failed to load activity history.")}
          </div>
        )}
        {!historyLoading && !historyError && activities.length === 0 && (
          <div className="text-center text-gray-500">
            {t("No recent activity.")}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {activities.map((a, i) => (
            <div
              key={i}
              className="flex items-center bg-white rounded-lg shadow p-4 gap-4"
            >
              <div className="flex flex-col items-center justify-center bg-primary-gradient text-white rounded-md w-14 h-14 font-extrabold text-lg">
                <span>{a.day}</span>
                <span className="text-xs">{a.month}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base">{a.text}</div>
                <div className="text-xs text-gray-500 mt-1">{a.ago}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClockInOut;