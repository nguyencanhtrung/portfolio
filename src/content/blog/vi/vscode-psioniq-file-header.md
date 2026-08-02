---
title: 'Psioniq file header for VScode'
description: 'Append file header in VScode with Psioniq extension'
date: 2023-09-15
lang: vi
key: vscode-psioniq-file-header
tags: ['vscode']
---
## 1. Giới thiệu về psioniq extension

Đây là một extension hỗ trợ chèn header vào file code chỉ với phím tắt `Ctrl+Alt+H` (x2 - nhấn 2 lần). Ngoài ra, nó còn hỗ trợ chèn `Revision` với tổ hợp phím `Ctrl+Alt+C` (x2 - nhấn 2 lần). Dưới đây là một ví dụ header được chèn vào code VHDL:

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


## 2. Thiết lập

Phần này sẽ mô tả cách thiết lập psioniq, để nó có thể tự động nhận diện `language` và chèn header phù hợp. 

Thiết lập `psioniq` bằng cách truy cập:  `File` > `Preferences` > `Settings` > `Extensions` > `psioniq File Header` > `Editing settings.json`

### 2.1 Trường `psi-header.config`

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

Trường này chứa thông tin chung về `LICENSE`, `author`, `initials` (viết tắt tên tác giả để chèn vào phần `HISTORY` hay `Revision`)


### 2.2 Trường `psi-header.changes-tracking`

Trường này thiết lập cơ chế tracking của extension và cách extension update header như ở ví dụ dưới đây:


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

Tracking được `activate`, extension sẽ tìm đến trường text `Modified By` và `Last Modified` để cập nhật thông tin với format được mô tả ở `modDateFormat`.

Chú ý rằng: trường text `Modified By` và `Last Modified` phụ thuộc vào nội dung header mà bạn quy định. Việc thiết lập nội dung của header được thực hiện ở `bước d`.

### 2.3 Trường `psi-header.lang-config`

Trường này thiết lập định dạng của header ứng với mỗi một `language` khác nhau. 

* `Language`: được quy định bởi VScode theo [link](https://code.visualstudio.com/docs/languages/identifiers)
* `begin`   : dòng đầu tiên của header
* `prefix`  : Ký tự đầu dòng của header - thường là comment syntax của mỗi `language`. Đối với C là `//`, VHDL là `--`
* `suffix`  : Ký tự cuối dòng của header -- thường để taọ header dưới dạng một `text box`
* `linelength`: quy định chiều dài tối đa của một dòng.
* `end`     : dòng cuối cùng của header
* `forceToTop`: force chèn header vào top của file, thay vì tại vị trí con trỏ.
* `mapTo`   : ánh xạ cấu hình của một `language` với cấu hình được định nghĩa trước, tránh việc khai báo nhiều lần.
* `afterHeader`: được dùng để thiết lập đoạn text bên dưới header, thường là code template

Trên đây là một vài thiết lập phổ biến, nếu bạn muốn tìm hiểu thêm các thiết lập khác hãy truy cập vào psioniq [language config](https://marketplace.visualstudio.com/items?itemName=psioniq.psi-header#language-configuration)


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

Đây là một ví dụ về việc thiết lập header file cho file `SystemVerilog`, `verilog` và các ngôn ngữ còn lại.


### 2.4 Trường `psi-header.templates`

Mô tả template của header. Chú ý: nếu bạn sử dụng cụm từ khác để mô tả `Last Modified` và `Modified by` thì phải thay đổi `si-header.changes-tracking` bằng cụm từ tương ứng để extension có thể lọc và thay đổi nội dụng.

Dưới đây là ví dụ về header teamplate của `SystemVerilog` và các định dạng còn lại.

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

## 3. Cấu hình hoàn thiện

Cấu hình hoàn thiện bao gồm tất cả các trường mô tả bên trên và được lưu tại `settings.json`


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