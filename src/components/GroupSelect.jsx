// Tyhjä ryhmä dropdown.
export default function GroupSelect({
  value = "",
  onChange = () => {},
  placeholder = "Groups",
  disabled = false,
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
      <option value="">{placeholder}</option>
      {}
    </select>
  );
}
