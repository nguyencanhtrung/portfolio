---
title: 'Python - Beginner - Day 1st Variables'
description: '100 Days of code - The complete Python Pro Bootcamp'
date: 2022-10-19
lang: en
key: python-learning-1
tags: ['python']
---

## Overview
Learning

[Brand Name Generator](https://replit.com/@appbrewery/band-name-generator-end)

[Brand Name Generator](https://replit.com/@appbrewery/day-1-printing-start#main.py)

***

## Installation

The current stable version 1.7.1 of cocotb requires:
* Python 3.6+
* GNU Make 3+
* A Verilog or VHDL simulator, depending on your RTL source code


### Python installation

```bash
sudo apt-get install make python3 python3-pip
```

We can use the global python installation for `cocotb`. However, the better way is to create a separated environment for `cocotb` to prevent any corruption on main python installation.

Here, we create our own python env inside the `cocotb` working directory.

```bash
cd $PATH_TO_YOUR_COCOTB_WS
python3 -m venv venv
```

It creates the `venv` directory. Now, check the current environment

```bash
which python3
```

You will notice that it still uses the global environment `usr/bin/python3`

Lets activate the working environment

```bash
source venv/bin/active
```

Now, check the current environment

```bash
which python3
```

New environment for cocotb is activated.


```bash
cd $PATH_TO_YOUR_COCOTB_WS
python3 -m venv venv
sudo apt-get install make python3 python3-pip
```


```bash
pip install pytest cocotb cocotb-bus cocotb-coverage
```

You may need to add to `PATH` and add this line into your `.bashrc` file

```bash
export PATH=/home/tesla/.local/bin:$PATH
```

Checking whether it is successfull or not by typing `cocotb-config`


### Installation simulator Icarus

```bash
sudo apt install iverilog
```


***

## My Hello World with cocotb


***

## Code Blocks


***

## Layouts


