#!/usr/bin/env python3
"""Extract structured metadata from the spreadsheet dictionaries.

The project ships two authoritative dictionaries at the repository root:
- ``escape_game_dictionnaire.xlsx`` (Excel) — early MySQL oriented schema.
- ``DICO_Escape_Game.ods`` (LibreOffice) — expanded specification (UUIDs, enums, etc.).

This helper reads both files using only Python's standard library (``zipfile`` +
``xml.etree``) and writes a consolidated JSON payload that can be exposed by
our API or reused by future tooling.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List
from zipfile import ZipFile
import xml.etree.ElementTree as ET

# Namespaces used by XLSX and ODS documents
XLSX_NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
ODS_NS = {
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
}


def _load_shared_strings(zf: ZipFile) -> Dict[int, str]:
    data = zf.read("xl/sharedStrings.xml")
    root = ET.fromstring(data)
    shared: Dict[int, str] = {}
    for idx, si in enumerate(root.findall("s:si", XLSX_NS)):
        parts = [node.text or "" for node in si.findall(".//s:t", XLSX_NS)]
        shared[idx] = "".join(parts)
    return shared


def _read_xlsx_sheet(zf: ZipFile, sheet: str, shared: Dict[int, str]) -> List[List[str]]:
    root = ET.fromstring(zf.read(sheet))
    rows: List[List[str]] = []
    for row in root.findall(".//s:row", XLSX_NS):
        cells: List[str] = []
        for cell in row.findall("s:c", XLSX_NS):
            cell_type = cell.get("t")
            value_node = cell.find("s:v", XLSX_NS)
            if value_node is None:
                cells.append("")
                continue
            raw = value_node.text or ""
            if cell_type == "s":
                resolved = shared.get(int(raw), "")
            else:
                resolved = raw
            cells.append(resolved)
        # strip trailing blanks to keep JSON compact
        while cells and cells[-1] == "":
            cells.pop()
        if any(cells):
            rows.append(cells)
    return rows


def _rows_to_dicts(header: List[str], rows: List[List[str]]) -> List[Dict[str, str]]:
    data: List[Dict[str, str]] = []
    for row in rows:
        entry: Dict[str, str] = {}
        for idx, key in enumerate(header):
            normalized_key = key or f"col_{idx}"
            entry[normalized_key] = row[idx] if idx < len(row) else ""
        data.append(entry)
    return data


def parse_excel_dictionary(path: Path) -> Dict[str, List[Dict[str, str]]]:
    with ZipFile(path) as zf:
        shared = _load_shared_strings(zf)
        sheet1 = _read_xlsx_sheet(zf, "xl/worksheets/sheet1.xml", shared)
        sheet2 = _read_xlsx_sheet(zf, "xl/worksheets/sheet2.xml", shared)

    if not sheet1:
        raise ValueError("Excel dictionary appears empty")

    columns_header, *columns_rows = sheet1
    tables_header, *tables_rows = sheet2 if sheet2 else ([], [])

    return {
        "columns": _rows_to_dicts(columns_header, columns_rows),
        "tables": _rows_to_dicts(tables_header, tables_rows) if tables_header else [],
    }


def _read_ods_table(table_node: ET.Element) -> List[List[str]]:
    rows: List[List[str]] = []
    for row in table_node.findall("table:table-row", ODS_NS):
        values: List[str] = []
        for cell in row.findall("table:table-cell", ODS_NS):
            text = "\n".join((node.text or "") for node in cell.findall("text:p", ODS_NS))
            repeat = int(cell.get(
                "{urn:oasis:names:tc:opendocument:xmlns:table:1.0}number-columns-repeated",
                "1",
            ))
            values.extend([text] * repeat)
        while values and values[-1] == "":
            values.pop()
        if any(values):
            rows.append(values)
    return rows


def parse_ods_dictionary(path: Path) -> Dict[str, Dict[str, List[List[str]]]]:
    with ZipFile(path) as zf:
        root = ET.fromstring(zf.read("content.xml"))

    result: Dict[str, Dict[str, List[List[str]]]] = {}
    for table in root.findall(".//table:table", ODS_NS):
        name = table.get("{urn:oasis:names:tc:opendocument:xmlns:table:1.0}name")
        if not name:
            continue
        rows = _read_ods_table(table)
        if not rows:
            continue
        header, *data_rows = rows
        result[name.lower()] = {
            "header": header,
            "rows": data_rows,
            "records": _rows_to_dicts(header, data_rows),
        }
    return result


def build_dictionary(repo_root: Path) -> Dict[str, object]:
    excel_path = repo_root / "escape_game_dictionnaire.xlsx"
    ods_path = repo_root / "DICO_Escape_Game.ods"
    if not excel_path.exists():
        raise FileNotFoundError(f"Excel dictionary not found: {excel_path}")
    if not ods_path.exists():
        raise FileNotFoundError(f"ODS dictionary not found: {ods_path}")

    excel = parse_excel_dictionary(excel_path)
    ods = parse_ods_dictionary(ods_path)
    return {
        "excel": excel,
        "ods": ods,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("api/data/data_dictionary.json"),
        help="Path (relative to the repository root) for the generated JSON.",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    payload = build_dictionary(repo_root)

    output_path = args.output
    if not output_path.is_absolute():
        output_path = repo_root / output_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

    print(f"Data dictionary written to {output_path}")


if __name__ == "__main__":
    main()
