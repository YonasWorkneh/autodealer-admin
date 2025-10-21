import toast from "react-hot-toast";

type ToastType = "success" | "error";

export const useToast = () => {
  const showToast = (type: ToastType = "success", message: string) => {
    if (type === "success") {
      toast.success(message || "Success", {
        duration: 4000,
        style: {
          background: "#D1FAE5",
          color: "#065F46",
          border: "1px solid #6EE7B7",
        },
        iconTheme: {
          primary: "#10B981",
          secondary: "#FFFFFF",
        },
      });
    } else {
      toast.error(message || "Error", {
        duration: 4000,
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          border: "1px solid #FCA5A5",
        },
        iconTheme: {
          primary: "#DC2626",
          secondary: "#FFFFFF",
        },
      });
    }
  };

  return {
    showToast,
  };
};
