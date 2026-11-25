import type { TableAction } from "./types";
import { elementForNode, setCaretAfter, setCaretIn } from "./selectionUtils";

function createTable(rows: number, columns: number): HTMLTableElement {
  const table = document.createElement("table");
  const body = table.createTBody();
  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const row = body.insertRow();
    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      row.insertCell().append(document.createElement("br"));
    }
  }
  return table;
}

function closestTextBlock(node: Node, editor: HTMLElement): HTMLElement | null {
  const element = elementForNode(node);
  const block = element?.closest("p, h1, h2, h3, h4, h5, h6, blockquote, li");
  return block instanceof HTMLElement && editor.contains(block) ? block : null;
}

export function insertTableAtRange(
  editor: HTMLElement,
  range: Range,
  rows: number,
  columns: number,
): Range {
  const table = createTable(rows, columns);
  range.deleteContents();
  const block = closestTextBlock(range.startContainer, editor);

  if (!block) {
    range.insertNode(table);
    const paragraph = document.createElement("p");
    paragraph.append(document.createElement("br"));
    table.after(paragraph);
    return setCaretAfter(paragraph);
  }

  const tailRange = range.cloneRange();
  tailRange.setEnd(block, block.childNodes.length);
  const trailingContent = tailRange.extractContents();
  const trailingParagraph = document.createElement("p");
  if (trailingContent.hasChildNodes()) trailingParagraph.append(trailingContent);
  else trailingParagraph.append(document.createElement("br"));

  if (block.tagName === "LI") {
    block.append(table, trailingParagraph);
  } else {
    block.after(table);
    table.after(trailingParagraph);
  }

  return setCaretIn(trailingParagraph);
}

export function updateTableAtRange(
  editor: HTMLElement,
  range: Range,
  action: TableAction,
): Range | null {
  const selectedCell = elementForNode(range.startContainer)?.closest("td, th");
  if (!(selectedCell instanceof HTMLTableCellElement)) return null;
  const cell = selectedCell;
  const table = cell.closest("table");
  const row = cell.parentElement;
  if (
    !(table instanceof HTMLTableElement) ||
    !(row instanceof HTMLTableRowElement) ||
    !editor.contains(table)
  ) return null;

  if (action === "add-row") {
    const newRow = row.cloneNode(false) as HTMLTableRowElement;
    Array.from(row.cells).forEach((currentCell) => {
      const newCell = document.createElement(currentCell.tagName.toLowerCase());
      newCell.append(document.createElement("br"));
      newRow.append(newCell);
    });
    row.after(newRow);
    return setCaretIn(newRow.cells[Math.min(cell.cellIndex, newRow.cells.length - 1)]);
  }

  if (action === "remove-row") {
    if (table.rows.length <= 1) return null;
    const cellIndex = cell.cellIndex;
    const nextRow = row.nextElementSibling ?? row.previousElementSibling;
    row.remove();
    if (!(nextRow instanceof HTMLTableRowElement) || !nextRow.cells.length) return null;
    return setCaretIn(nextRow.cells[Math.min(cellIndex, nextRow.cells.length - 1)]);
  }

  const columnIndex = cell.cellIndex;
  const columnCount = Math.max(0, ...Array.from(table.rows, (tableRow) => tableRow.cells.length));
  if (action === "remove-column" && columnCount <= 1) return null;

  Array.from(table.rows).forEach((tableRow) => {
    if (action === "add-column") {
      const newCell = document.createElement(cell.tagName.toLowerCase());
      newCell.append(document.createElement("br"));
      tableRow.insertBefore(newCell, tableRow.cells[columnIndex + 1] ?? null);
    } else {
      tableRow.cells[columnIndex]?.remove();
    }
  });

  const nextCell = row.cells[Math.min(columnIndex, row.cells.length - 1)];
  return nextCell ? setCaretIn(nextCell) : null;
}
