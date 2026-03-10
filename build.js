#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// =============================================================================
// Everforest Color Palette
// =============================================================================

// Shared colors (same across all variants)
const palette = {
  fg: "#d3c6aa",
  red: "#e67e80",
  orange: "#e69875",
  yellow: "#dbbc7f",
  green: "#a7c080",
  aqua: "#83c092",
  blue: "#7fbbb3",
  purple: "#d699b6",
  grey0: "#7a8478",
  grey1: "#859289",
  grey2: "#9da9a0",
  // Git/diff colors
  statusGreen: "#899c40",
  statusRed: "#da6362",
};

// Variant-specific background colors
const variants = {
  hard: {
    name: "Everforest Dark Hard",
    bgDim: "#1b2024",
    bg0: "#272e33",
    bg1: "#2e383c",
    bg2: "#374145",
    bg3: "#414b50",
    bg4: "#495156",
    bg5: "#21272b",
    errorBg: "#4c3743",
    elementBg: "#5a6648",
    activeLine: "#374145",
    infoBg: "#7fbbb320",
    warningBg: "#4D4C43",
  },
  medium: {
    name: "Everforest Dark Medium",
    bgDim: "#1b2024",
    bg0: "#2d353b",
    bg1: "#343f44",
    bg2: "#3d484d",
    bg3: "#475258",
    bg4: "#4f585e",
    bg5: "#232a2e",
    errorBg: "#543a48",
    elementBg: "#5a6648",
    activeLine: "#3d484d",
    infoBg: "#7fbbb320",
    warningBg: "#4D4C43",
  },
  soft: {
    name: "Everforest Dark Soft",
    bgDim: "#293136",
    bg0: "#333c43",
    bg1: "#3a464c",
    bg2: "#434f55",
    bg3: "#4d5960",
    bg4: "#555f66",
    bg5: "#293136",
    errorBg: "#5c3f4f",
    elementBg: "#5d6b66",
    activeLine: "#4d5960",
    infoBg: "#3f586520",
    warningBg: "#55544a",
  },
};

// =============================================================================
// Syntax Highlighting (defined once, shared across variants)
// =============================================================================

const buildSyntax = (p) => ({
  attribute: { color: p.purple, font_style: "italic" },
  boolean: { color: p.purple },
  character: { color: p.aqua },
  "character.special": { color: p.green },
  comment: { color: p.grey1, font_style: "italic" },
  "comment.doc": { color: p.grey1, font_style: "italic" },
  "comment.documentation": { color: p.grey1, font_style: "italic" },
  "comment.error": { color: p.red, font_style: "italic" },
  "comment.hint": { color: p.green, font_style: "italic" },
  "comment.info": { color: p.blue, font_style: "italic" },
  "comment.note": { color: p.blue, font_style: "italic" },
  "comment.todo": { color: p.orange, font_style: "italic" },
  "comment.warn": { color: p.yellow, font_style: "italic" },
  "comment.warning": { color: p.yellow, font_style: "italic" },
  concept: { color: p.blue },
  constant: { color: p.fg },
  "constant.builtin": { color: p.purple, font_style: "italic" },
  "constant.macro": { color: p.purple },
  constructor: { color: p.green },
  "diff.minus": { color: p.red },
  "diff.plus": { color: p.green },
  embedded: { color: p.fg },
  emphasis: { color: p.fg, font_style: "italic" },
  "emphasis.strong": { color: p.fg, font_weight: 700 },
  enum: { color: p.yellow },
  field: { color: p.blue },
  float: { color: p.purple },
  function: { color: p.green },
  "function.builtin": { color: p.green },
  "function.call": { color: p.green },
  "function.decorator": { color: p.purple, font_style: "italic" },
  "function.macro": { color: p.green },
  "function.method": { color: p.green },
  "function.method.call": { color: p.green },
  hint: { color: p.green, font_style: "italic" },
  keyword: { color: p.red },
  "keyword.conditional": { color: p.red },
  "keyword.conditional.ternary": { color: p.red },
  "keyword.coroutine": { color: p.red },
  "keyword.debug": { color: p.red },
  "keyword.directive": { color: p.purple },
  "keyword.directive.define": { color: p.purple },
  "keyword.exception": { color: p.red },
  "keyword.export": { color: p.red },
  "keyword.function": { color: p.red },
  "keyword.import": { color: p.red },
  "keyword.modifier": { color: p.red },
  "keyword.operator": { color: p.orange },
  "keyword.repeat": { color: p.red },
  "keyword.return": { color: p.red },
  "keyword.storage": { color: p.red },
  "keyword.type": { color: p.red },
  label: { color: p.orange },
  link_text: { color: p.purple },
  link_uri: { color: p.blue, font_style: "italic" },
  module: { color: p.yellow },
  namespace: { color: p.yellow, font_style: "italic" },
  number: { color: p.purple },
  "number.float": { color: p.purple },
  operator: { color: p.orange },
  parameter: { color: p.fg },
  parent: { color: p.purple, font_style: "italic" },
  predictive: { color: p.grey0 },
  predoc: { color: p.red },
  primary: { color: p.fg },
  property: { color: p.blue },
  punctuation: { color: p.grey2 },
  "punctuation.bracket": { color: p.fg },
  "punctuation.delimiter": { color: p.grey1 },
  "punctuation.list_marker": { color: p.red },
  "punctuation.special": { color: p.blue },
  "punctuation.special.symbol": { color: p.aqua },
  string: { color: p.aqua },
  "string.doc": { color: p.aqua, font_style: "italic" },
  "string.documentation": { color: p.aqua, font_style: "italic" },
  "string.escape": { color: p.green },
  "string.regex": { color: p.green },
  "string.regexp": { color: p.green },
  "string.special": { color: p.yellow },
  "string.special.path": { color: p.yellow },
  "string.special.symbol": { color: p.aqua },
  "string.special.url": { color: p.blue, font_style: "italic" },
  symbol: { color: p.blue },
  tag: { color: p.orange },
  "tag.attribute": { color: p.purple, font_style: "italic" },
  "tag.delimiter": { color: p.grey1 },
  "tag.doctype": { color: p.purple },
  text: { color: p.fg },
  "text.literal": { color: p.aqua },
  title: { color: p.yellow, font_weight: 700 },
  type: { color: p.yellow },
  "type.builtin": { color: p.yellow, font_style: "italic" },
  "type.class.definition": { color: p.yellow },
  "type.definition": { color: p.yellow },
  "type.interface": { color: p.yellow, font_style: "italic" },
  "type.super": { color: p.yellow, font_style: "italic" },
  variable: { color: p.fg },
  "variable.builtin": { color: p.purple, font_style: "italic" },
  "variable.member": { color: p.blue },
  "variable.parameter": { color: p.fg },
  "variable.special": { color: p.purple, font_style: "italic" },
  variant: { color: p.purple },

  // Markdown-specific scopes
  "title.markup": { color: p.red, font_weight: 700 },  // Headings (all levels)
  "text.literal.markup": { color: p.green },           // Inline code
  "punctuation.embedded.markup": { color: p.orange },  // Fenced code language identifier
  "punctuation.list_marker.markup": { color: p.red },
  "emphasis.markup": { color: p.fg, font_style: "italic" },
  "emphasis.strong.markup": { color: p.fg, font_weight: 700 },
  "link_text.markup": { color: p.purple },
  "link_uri.markup": { color: p.blue, font_style: "italic" },
});

// =============================================================================
// Theme Style Builder
// =============================================================================

const buildStyle = (p, v) => ({
  // Borders
  border: v.bgDim,
  "border.variant": v.bgDim,
  "border.focused": v.bg0,
  "border.selected": v.bgDim,
  "border.transparent": v.bgDim,
  "border.disabled": v.bgDim,

  // Surfaces
  "elevated_surface.background": v.bg1,
  "surface.background": v.bg0,
  background: v.bg0,

  // Elements
  "element.background": v.elementBg,
  "element.hover": v.bg0,
  "element.selected": v.bg2,
  "drop_target.background": v.bg1,

  // Ghost elements
  "ghost_element.hover": v.bg0 + "00",
  "ghost_element.selected": v.bg2 + "80",

  // Text
  text: p.grey2,
  "text.muted": p.grey0,

  // UI chrome
  "status_bar.background": v.bg5,
  "title_bar.background": v.bg5,
  "toolbar.background": v.bg0,
  "tab_bar.background": v.bg5,
  "tab.inactive_background": v.bg5,
  "tab.active_background": v.bg0,
  "panel.background": v.bg5,

  // Scrollbar
  "scrollbar.thumb.background": v.bg4 + "80",
  "scrollbar.thumb.hover_background": v.bg4,
  "scrollbar.thumb.border": v.bg4 + "80",
  "scrollbar.track.background": v.bg0,
  "scrollbar.track.border": v.bg0 + "00",

  // Editor
  "editor.foreground": p.fg,
  "editor.background": v.bg0,
  "editor.gutter.background": v.bg0,
  "editor.active_line.background": v.activeLine + "90",
  "editor.line_number": p.grey0 + "a0",
  "editor.active_line_number": p.fg,
  "editor.wrap_guide": v.bgDim,
  "editor.active_wrap_guide": v.bgDim,

  // Terminal
  "terminal.background": v.bg0,
  "terminal.foreground": p.fg,
  "terminal.ansi.black": v.bg1,
  "terminal.ansi.bright_black": p.grey1,
  "terminal.ansi.red": p.red,
  "terminal.ansi.bright_red": p.red,
  "terminal.ansi.green": p.green,
  "terminal.ansi.bright_green": p.green,
  "terminal.ansi.yellow": p.yellow,
  "terminal.ansi.bright_yellow": p.yellow,
  "terminal.ansi.blue": p.blue,
  "terminal.ansi.bright_blue": p.blue,
  "terminal.ansi.magenta": p.purple,
  "terminal.ansi.bright_magenta": p.purple,
  "terminal.ansi.cyan": p.aqua,
  "terminal.ansi.bright_cyan": p.aqua,
  "terminal.ansi.white": p.fg,
  "terminal.ansi.bright_white": p.fg,

  // Links
  "link_text.hover": p.green + "c0",

  // Git status
  conflict: p.purple + "a0",
  created: p.statusGreen + "a0",
  deleted: p.statusRed + "a0",
  modified: p.blue + "a0",
  hidden: p.grey0,
  ignored: v.bg4,

  // Diagnostics
  error: p.red,
  "error.background": v.errorBg,
  warning: p.yellow,
  "warning.background": v.warningBg,
  hint: p.green,
  info: p.blue,
  "info.background": v.infoBg,
  predictive: p.grey0,

  // Players (cursor/selection)
  players: [
    {
      cursor: p.fg,
      selection: v.bg3,
      background: v.bg3,
    },
  ],

  // Syntax highlighting
  syntax: buildSyntax(p),
});

// =============================================================================
// Build Theme
// =============================================================================

const buildTheme = () => ({
  $schema: "https://zed.dev/schema/themes/v0.1.0.json",
  name: "Everforest",
  author: "Sainnhe, brought to Zed by Thomas Alban",
  themes: Object.entries(variants).map(([key, variant]) => ({
    name: variant.name,
    appearance: "dark",
    style: buildStyle(palette, variant),
  })),
});

// =============================================================================
// Output
// =============================================================================

const theme = buildTheme();
const outputPath = path.join(__dirname, "themes", "everforest-dark.json");

fs.writeFileSync(outputPath, JSON.stringify(theme, null, 2) + "\n");

console.log(`Generated: ${outputPath}`);
