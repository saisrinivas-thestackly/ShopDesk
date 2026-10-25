export default function Table({ columns, rows, rowKey = 'id', caption }) {
  return (
    <div className="relative -mx-2 overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`border-b border-line px-2 py-3 text-xs font-normal text-muted ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="transition-colors hover:bg-hover">
              {columns.map((col) => (
                <td key={col.key} className={`border-b border-line px-2 py-3 first:rounded-l-control last:rounded-r-control ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
