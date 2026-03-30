class BaseSheetService {
  mapRows(headers, rows) {
    return rows.map((row) =>
      headers.reduce((acc, header, index) => {
        acc[header] = row[index] ?? "";
        return acc;
      }, {})
    );
  }

  rowsFromObjects(headers, items) {
    return items.map((item) => headers.map((header) => item[header] ?? ""));
  }
}

module.exports = BaseSheetService;
