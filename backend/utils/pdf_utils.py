"""Shared PDF-related helpers (page parsing, colors, etc.)."""
from typing import List, Tuple


def parse_pages(pages_str: str, total: int) -> List[int]:
    """
    Parse page numbers string and return list of 0-indexed page numbers.
    Supports: 'all', '1,3,5', '1-5', '1,3-5,7'
    Converts from 1-indexed (user input) to 0-indexed (PyMuPDF).
    """
    if not pages_str or pages_str.lower() == "all":
        return list(range(total))

    pages: List[int] = []
    parts = pages_str.split(",")

    for part in parts:
        part = part.strip()
        if "-" in part:
            try:
                start, end = part.split("-")
                start = int(start.strip()) - 1
                end = int(end.strip()) - 1
                pages.extend(range(start, end + 1))
            except ValueError:
                continue
        else:
            try:
                page_num = int(part) - 1
                pages.append(page_num)
            except ValueError:
                continue

    valid_pages = [p for p in pages if 0 <= p < total]
    return sorted(list(set(valid_pages)))


def hex_to_rgb(hex_color: str) -> Tuple[float, float, float]:
    """Convert 6-character hex color to (r, g, b) floats in 0..1."""
    hex_color = hex_color.strip()
    if len(hex_color) != 6 or not all(c in "0123456789ABCDEFabcdef" for c in hex_color):
        raise ValueError("color must be a valid 6-character hex string")
    r = int(hex_color[0:2], 16) / 255
    g = int(hex_color[2:4], 16) / 255
    b = int(hex_color[4:6], 16) / 255
    return (r, g, b)


def to_roman(num: int) -> str:
    """Convert number to lowercase roman numerals."""
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syms = ["m", "cm", "d", "cd", "c", "xc", "l", "xl", "x", "ix", "v", "iv", "i"]
    result = []
    for i in range(len(val)):
        count = num // val[i]
        if count:
            result.append(syms[i] * count)
            num -= val[i] * count
    return "".join(result)
