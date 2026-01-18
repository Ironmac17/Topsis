export default function ResultTable({ data }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            {Object.keys(data[0]).map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
