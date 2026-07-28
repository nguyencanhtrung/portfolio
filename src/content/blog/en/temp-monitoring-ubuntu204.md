---
title: 'Temperature monitoring'
description: 'Temperature monitoring in ubuntu 20.4'
date: 2022-10-23
lang: en
key: temp-monitoring-ubuntu204
tags: ['ubuntu']
---

## Sensors

Sensors is a command-line utility to monitor CPU and GPU temperature in Linux. It is a free and open-source tool. It helps you to see the readings of all sensor chips including the CPU. You can also monitor fans of your system with this tool..Run the following command in Ubuntu to install Sensors.

```bash
sudo apt-get install lm-sensors
```
Run the following command to detect all the available sensors on your system.

```bash
sudo sensors-detect
```
After detecting the available sensors on your system, run the following command to monitor CPU and GPU temperature.

```bash
sensors
```

## Glances

Glances is a cross-platform real-time system monitoring tool. You access it via a web browser to remotely monitor your Linux server. It is a curses-based system monitoring tool written in Python

Run the following command install Glances on your system:

```bash
curl -L https://bit.ly/glances | /bin/bash
OR
wget -O- https://bit.ly/glances | /bin/bash
```

Once you have installed it, start Glances with the following command and press f key to view sensors information.

```bash
glances
```