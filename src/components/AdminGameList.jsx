export default function AdminGameList({ games, busy, onEdit, onDelete }) {
  return (
    <div className="panel table-wrap">
      <table>
        <thead>
          <tr>
            <th>เกม</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.title}</td>
              <td>{game.isPublished ? 'เผยแพร่' : 'ซ่อน'}</td>
              <td>
                <button disabled={busy} onClick={() => onEdit(game)}>
                  แก้ไข
                </button>
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() => onDelete(game)}
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!games.length && <p>ยังไม่มีเกม กดนำเข้าเกม Steam หรือเพิ่มข้อมูลด้านบน</p>}
    </div>
  );
}
