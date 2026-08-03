---
title: 'Psioniq file header for VScode'
description: 'Automatic file headers in VSCode with the psioniq extension: what each config block controls, per-language templates, and keeping the modification fields up to date on every save.'
date: 2023-09-15
lang: en
key: vscode-psioniq-file-header
tags: ['vscode']
---
## 1. What the psioniq extension does

It inserts a header into a source file with a single shortcut, `Ctrl+Alt+H`
(pressed twice). It also inserts a `Revision` entry with `Ctrl+Alt+C` (twice).
Here is a header it produced for a VHDL file:

```
//-----------------------------------------------------------------------------
// 
// Project   : 5G L1 PDSCH and PUSCH channels
// Module    : chspad
// Parent    : crc.sv
// Children  : ifc_axis.sv, axis_fifo.sv, axis_reg.sv
// 
// Author    : Nguyen Canh Trung
// Email     : nguyencanhtrung 'at' me 'dot' com
// Date      : 2023-09-14 00:12:05
// Last Modified : 2023-10-17 11:34:25
// Modified By   : Nguyen Canh Trung
// 
// Description: 
//
// Parameters:
// 
// Multicycle and False Paths: 
// 
// HISTORY:
// Date         By  Comments
// ----------   --- ---------------------------------------------------------
// 2023-09-14   NCT File created
//-----------------------------------------------------------------------------
```

## 2. Configuration

This section covers how to set psioniq up so that it recognises the `language`
of the file and inserts the matching header.

Get to the settings via `File` > `Preferences` > `Settings` > `Extensions` >
`psioniq File Header` > `Editing settings.json`.

### 2.1 `psi-header.config`

```jsonc
"psi-header.config": {
        "forceToTop": true,
        "blankLinesAfter": 6,
        "spacesBetweenYears": false,
        "license": "MIT",
        "author": "Nguyen Canh Trung",
        "initials": "NCT",
        "authorEmail": "nguyencanhtrung 'at' me 'dot' com",
        "company": "",
        "copyrightHolder": "",
        "creationDateZero": "asIs",
        "hostname": ""
    }
```

This block holds the general information: `LICENSE`, `author`, and `initials`
(the short form of the author's name used in the `HISTORY` and `Revision`
entries).

### 2.2 `psi-header.changes-tracking`

This block sets up the extension's tracking behaviour and how it updates an
existing header:

```jsonc
  "psi-header.changes-tracking": {
        "isActive": true,
        "modAuthor": "Modified By",
        "modDate": "Last Modified",
        "modDateFormat": "YYYY-MM-DD HH:mm:ss",
        "include": [],
        "includeGlob": [],
        "exclude": [
            "markdown",
            "json",
            "jsonc",
            "shellscript"
        ],
        "excludeGlob": [
            "./**/*/ignoreme.*"
        ],
        "autoHeader": "autoSave",
        "enforceHeader": false,
        "updateLicenseVariables": false
    }
```

With tracking active, the extension looks for the text `Modified By` and
`Last Modified` and refreshes them using the format given in `modDateFormat`.

Note that those two strings have to match whatever your header template
actually says — they are labels the extension searches for, not fixed field
names. The template itself is set up in section 2.4.

### 2.3 `psi-header.lang-config`

This block defines the header's shape for each `language`:

* `Language`: the identifier VSCode uses, listed [here](https://code.visualstudio.com/docs/languages/identifiers)
* `begin`: the first line of the header
* `prefix`: the characters that open each line — usually the language's comment
  syntax, `//` for C and `--` for VHDL
* `suffix`: the characters that close each line — mostly used to draw the
  header as a text box
* `linelength`: the maximum line length
* `end`: the last line of the header
* `forceToTop`: insert the header at the top of the file rather than at the
  cursor
* `mapTo`: reuse another language's configuration instead of repeating it
* `afterHeader`: text placed below the header, typically a code template

Those are the common settings; the rest are in psioniq's
[language config](https://marketplace.visualstudio.com/items?itemName=psioniq.psi-header#language-configuration).

```jsonc
"psi-header.lang-config": [
    {
        "language": "*",
        "begin": "// ----------------------------------------------------------------------------",
        "prefix": "// ",
        "suffix": "",
        "lineLength": 80,
        "end": "// ----------------------------------------------------------------------------",
        "forceToTop": true,
        "blankLinesAfter": 0
    },
    {
        "language": "systemverilog",
        "begin": "//-----------------------------------------------------------------------------",
        "prefix": "// ",
        "suffix": "",
        "lineLength": 80,
        "end": "//-----------------------------------------------------------------------------",
        "forceToTop": true,
        "blankLinesAfter": 0,
        "afterHeader": [
            "`timescale 1ns / 1ps"
        ]
    },
    {
        "language": "verilog",
        "mapTo": "systemverilog"
    }
]
```

That is a header setup for `SystemVerilog`, `verilog`, and everything else.

### 2.4 `psi-header.templates`

This block describes the header's content. If you use different wording for
`Last Modified` and `Modified By`, change `psi-header.changes-tracking` to
match — otherwise the extension cannot find the fields it is supposed to
update.

Here are the templates for `SystemVerilog` and for everything else:

```jsonc
"psi-header.templates": [
    {
        "language": "*",
        "template": [
            "",
            "Project   : ",
            "Filename  : <<filenamebase>>",
            "",
            "Author    : <<author>>",
            "Email     : <<authoremail>>",
            "Date      : <<filecreated('YYYY-MM-DD HH:mm:ss')>>",
            "Last Modified : <<dateformat('YYYY-MM-DD HH:mm:ss')>>",
            "Modified By   : <<author>>",
            "",
            "Description: ",
            "",
            "HISTORY:",
            "Date      \tBy\tComments",
            "----------\t---\t---------------------------------------------------------"
        ],
        "changeLogCaption": "HISTORY:",
        "changeLogHeaderLineCount": 2,
        "changeLogEntryTemplate": [
            "<<dateformat(YY-MM-DD)>>\t<<initials>>\t"
        ]
    },
    {
        "language": "systemverilog",
        "template": [
            "",
            "Project   : ",
            "Module    : <<filenamebase>>",
            "Parent    : ",
            "Children  : ",
            "",
            "Author    : <<author>>",
            "Email     : <<authoremail>>",
            "Date      : <<filecreated('YYYY-MM-DD HH:mm:ss')>>",
            "Last Modified : <<dateformat('YYYY-MM-DD HH:mm:ss')>>",
            "Modified By   : <<author>>",
            "",
            "Description: ",
            "", 
            "Parameters:",
            "",
            "Multicycle and False Paths: ",
            "", 
            "HISTORY:",
            "Date      \tBy\tComments",
            "----------\t---\t---------------------------------------------------------"  
        ],
        "changeLogCaption": "HISTORY:",
        "changeLogHeaderLineCount": 2,
        "changeLogEntryTemplate": [
            "<<dateformat(YY-MM-DD)>>\t<<initials>>\t"
        ]
    }
]
```

## 3. The complete configuration

Everything above, assembled into one `settings.json`:

```jsonc
{
    "workbench.colorTheme": "Default High Contrast",
    "code-runner.runInTerminal": true,
    "files.autoSave": "afterDelay",
    "[python]": {
        "editor.formatOnType": true
    },
    "editor.inlineSuggest.enabled": true,
    "git.autofetch": true,
    "explorer.confirmDelete": false,
    "editor.fontSize": 13,
    "editor.formatOnPaste": true,
    "editor.multiCursorModifier": "ctrlCmd",
    "editor.snippetSuggestions": "top",
    "security.workspace.trust.untrustedFiles": "open",
    "psi-header.config": {
        "forceToTop": true,
        "blankLinesAfter": 6,
        "spacesBetweenYears": false,
        "license": "MIT",
        "author": "Nguyen Canh Trung",
        "initials": "NCT",
        "authorEmail": "nguyencanhtrung 'at' me 'dot' com",
        "company": "",
        "copyrightHolder": "",
        "creationDateZero": "asIs",
        "hostname": ""
    },
    "psi-header.changes-tracking": {
        "isActive": true,
        "modAuthor": "Modified By",
        "modDate": "Last Modified",
        "modDateFormat": "YYYY-MM-DD HH:mm:ss",
        "include": [],
        "includeGlob": [],
        "exclude": [
            "markdown",
            "json",
            "jsonc",
            "shellscript"
        ],
        "excludeGlob": [
            "./**/*/ignoreme.*"
        ],
        "autoHeader": "autoSave",
        "enforceHeader": false,
        "updateLicenseVariables": false
    },
    "psi-header.lang-config": [
        {
            "language": "*",
            "begin": "// ----------------------------------------------------------------------------",
            "prefix": "// ",
            "suffix": "",
            "lineLength": 80,
            "end": "// ----------------------------------------------------------------------------",
            "forceToTop": true,
            "blankLinesAfter": 0
        },
        {
            "language": "vhdl",
            "begin": "-- ----------------------------------------------------------------------------",
            "prefix": "-- ",
            "suffix": "",
            "lineLength": 80,
            "end": "-- ----------------------------------------------------------------------------",
            "forceToTop": true,
            "blankLinesAfter": 0,
            "afterHeader": [
                "-- Language: VHDL-1993",
                "",
                "library ieee;",
                "\tuse ieee.std_logic_1164.all;"
            ]
        },
        {
            "language": "systemverilog",
            "begin": "//-----------------------------------------------------------------------------",
            "prefix": "// ",
            "suffix": "",
            "lineLength": 80,
            "end": "//-----------------------------------------------------------------------------",
            "forceToTop": true,
            "blankLinesAfter": 0,
            "afterHeader": [
                "`timescale 1ns / 1ps"
            ]
        },
        {
            "language": "verilog",
            "mapTo": "systemverilog"
        }
    ],
    "psi-header.templates": [
        {
            "language": "*",
            "template": [
                "",
                "Project   : ",
                "Filename  : <<filenamebase>>",
                "",
                "Author    : <<author>>",
                "Email     : <<authoremail>>",
                "Date      : <<filecreated('YYYY-MM-DD HH:mm:ss')>>",
                "Last Modified : <<dateformat('YYYY-MM-DD HH:mm:ss')>>",
                "Modified By   : <<author>>",
                "",
                "Description: ",
                "",
                "HISTORY:",
                "Date      \tBy\tComments",
                "----------\t---\t---------------------------------------------------------"
            ],
            "changeLogCaption": "HISTORY:",
            "changeLogHeaderLineCount": 2,
            "changeLogEntryTemplate": [
                "<<dateformat(YY-MM-DD)>>\t<<initials>>\t"
            ]
        },
        {
            "language": "systemverilog",
            "template": [
                "",
                "Project   : ",
                "Module    : <<filenamebase>>",
                "Parent    : ",
                "Children  : ",
                "",
                "Author    : <<author>>",
                "Email     : <<authoremail>>",
                "Date      : <<filecreated('YYYY-MM-DD HH:mm:ss')>>",
                "Last Modified : <<dateformat('YYYY-MM-DD HH:mm:ss')>>",
                "Modified By   : <<author>>",
                "",
                "Description: ",
                "", 
                "Parameters:",
                "",
                "Multicycle and False Paths: ",
                "", 
                "HISTORY:",
                "Date      \tBy\tComments",
                "----------\t---\t---------------------------------------------------------"  
            ],
            "changeLogCaption": "HISTORY:",
            "changeLogHeaderLineCount": 2,
            "changeLogEntryTemplate": [
                "<<dateformat(YY-MM-DD)>>\t<<initials>>\t"
            ]
        },
        {
            "language": "vhdl",
            "template": [
                "",
                "Project   : ",
                "Module    : <<filenamebase>>",
                "Parent    : ",
                "Children  : ",
                "",
                "Author    : <<author>>",
                "Email     : <<authoremail>>",
                "Date      : <<filecreated('YYYY-MM-DD HH:mm:ss')>>",
                "Last Modified : <<dateformat('YYYY-MM-DD HH:mm:ss')>>",
                "Modified By   : <<author>>",
                "",
                "Description: ",
                "",
                "Parameters:",
                "",
                "Multicycle and False Paths: ",
                "",
                "HISTORY:",
                "Date      \tBy\tComments",
                "----------\t---\t---------------------------------------------------------"
            ],
            "changeLogCaption": "HISTORY:",
            "changeLogHeaderLineCount": 2,
            "changeLogEntryTemplate": [
                "<<dateformat(YY-MM-DD)>>\t<<initials>>\t"
            ]
        }
    ],
}
```
