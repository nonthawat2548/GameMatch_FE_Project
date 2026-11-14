export default function AdminGameForm({ g, setG, busy, loading, onSave, onReset }) {
  return (
    <form className="panel" onSubmit={onSave} aria-busy={busy}>
      <fieldset disabled={busy || loading}>
        <h2>{g.id ? 'แก้ไขเกม #' + g.id : 'เพิ่มเกม'}</h2>
        <div className="quiz-fields">
          <label>
            ชื่อเกม
            <input
              value={g.title}
              onChange={(e) => setG({ ...g, title: e.target.value })}
              required
              maxLength={250}
            />
          </label>
          <label>
            รูป HTTPS URL
            <input
              type="url"
              value={g.imageUrl}
              onChange={(e) => setG({ ...g, imageUrl: e.target.value })}
            />
          </label>
          {[
            ['genres', 'Genres เช่น rpg, action'],
            ['tags', 'Tags เช่น singleplayer, story-rich'],
            ['platforms', 'Platforms เช่น PC'],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={g[key].join(',')}
                onChange={(e) => setG({ ...g, [key]: e.target.value.split(',') })}
                onBlur={() => setG({ ...g, [key]: g[key].map((x) => x.trim()).filter(Boolean) })}
              />
            </label>
          ))}
        </div>
        <p className="muted">ถ้ามีคำอธิบายไทย ระบบจะแสดงภาษาไทยก่อน โดยเก็บต้นฉบับแยกไว้</p>
        <label>
          คำอธิบายภาษาไทย
          <textarea value={g.descriptionTh} onChange={(e) => setG({ ...g, descriptionTh: e.target.value })} />
        </label>
        <label>
          คำอธิบายต้นฉบับ
          <textarea value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} />
        </label>
        <label className="inline">
          <input
            type="checkbox"
            checked={g.isPublished}
            onChange={(e) => setG({ ...g, isPublished: e.target.checked })}
          />
          เผยแพร่
        </label>
        <button disabled={busy}>บันทึกเกม</button>
        <button type="button" className="secondary" disabled={busy} onClick={() => onReset()}>
          ล้างฟอร์ม
        </button>
      </fieldset>
    </form>
  );
}
