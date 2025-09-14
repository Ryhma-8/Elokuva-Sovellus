import GroupSelect from "./GroupSelect.jsx";

// Presentaatiokomponentti yhdelle elokuvalle.
export default function MovieCard({ title, image, times }) {
  return (
    <article className="show-card">
      <div className="show-card-image">
        {image ? <img src={image} alt="" /> : <div style={{ opacity: 0.6 }}>No image</div>}
      </div>

      <div className="show-card-body">
        <div className="show-card-title">{title}</div>

        <div className="show-card-times">
          {times.map((t) => (
            <div key={t}>
              {new Date(t).toLocaleDateString("fi-FI", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              {new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          ))}
        </div>

        {/* Tyhjäpohja: ryhmään lisääminen */}
        <div className="card-actions">
          <label className="card-label">Add for group:</label>
          <GroupSelect placeholder="Groups" disabled />
          <button className="add-btn" disabled>Add</button>
        </div>
      </div>
    </article>
  );
}
