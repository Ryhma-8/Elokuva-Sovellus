import { useEffect, useState } from "react";
import { getUserGroups } from "../services/groups.js";

/**
 * - Näyttää selkeät tilat: lataus, tyhjä, virhe
 * - Varsinainen disablointi tulee ylhäältä (esim. jos ei kirjautunut)
 */
export default function GroupSelect({
  value = "",
  onChange = () => {},
  placeholder = "Groups",
  disabled = false,
  className = "",
  ariaLabel = "Groups",
}) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    // Jos komponentti on disabloitu, ei ole kiire hakea mitään
    if (disabled) {
      setGroups([]);
      setLoading(false);
      setLoadError("");
      return;
    }

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        // Haetaan käyttäjän ryhmät ja suodatetaan roolin mukaan
        const data = await getUserGroups();
        const ownOrMember = (data || []).filter(
          (g) => g?.user_role === "owner" || g?.user_role === "member"
        );

        // Pieni siistiminen: järjestetään nimen mukaan
        ownOrMember.sort((a, b) =>
          String(a?.group_name || "").localeCompare(String(b?.group_name || ""))
        );

        if (!cancelled) setGroups(ownOrMember);
      } catch (e) {
        // Ei kaadeta UI:ta, mutta annetaan käyttäjälle vihje valitsimen kautta
        if (!cancelled) setLoadError(e?.message || "Failed to load groups");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [disabled]);

  return (
    <select
      className={`form-select ${className}`.trim()}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {/* Placeholder ensimmäisenä */}
      <option value="">{placeholder}</option>

      {/* Lataustila */}
      {loading && <option disabled>Loading…</option>}

      {/* Virhetila */}
      {!loading && loadError && <option disabled>Failed to load groups</option>}

      {/* Tyhjätila */}
      {!loading && !loadError && groups.length === 0 && (
        <option disabled>No groups yet</option>
      )}

      {/* Varsinaiset vaihtoehdot */}
      {!loading &&
        !loadError &&
        groups.map((g) => (
          <option key={g.group_id} value={g.group_id}>
            {g.group_name} {g.user_role === "owner" ? "— owner" : ""}
          </option>
        ))}
    </select>
  );
}
