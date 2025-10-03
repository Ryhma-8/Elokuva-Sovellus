export default function Alert({ type = "info", children }) {
  const cls =
    type === "success" ? "alert-success" :
    type === "warning" ? "alert-warning" :
    type === "danger"  ? "alert-danger"  :
    "alert-info";
  return <div className={`alert ${cls}`} role="alert">{children}</div>;
}
