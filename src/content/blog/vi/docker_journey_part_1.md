---
title: 'Docker - Quick start'
description: 'Bắt đầu với Docker: vòng đời pull, run, start, attach, các trạng thái của một container, và bộ lệnh tối thiểu để quản lý container cùng image mà không phải tra tài liệu.'
date: 2023-03-30
lang: vi
key: docker_journey_part_1
tags: ['docker']
---
## 1. Workflow với docker

Bước 1: Pull image về máy với `docker pull`. Tương tự như file cài đặt.

Bước 2: Khởi tạo và chạy một container với image được kéo về ở bước 1. 

Bước 3: Cài đặt tools trong container và làm các tác vụ cần thiết với container này. Có thể `stop` container, `exit` container ...

Bước 4: Commit để lưu thành 1 images mới chứa bộ tools đã được cài đặt cũng như tất cả dữ liệu khi thực hiện các tác vụ với `docker commit`. Images này có thể dùng ở các máy khác nhau với toàn bộ tools cũng như dữ liệu tại thời điểm thực hiện commit.

Một container có thể hiểu như là một phần mềm đã được cài đặt từ bộ cài `image`. Có một điều khác biệt căn bản ở so sánh trên là: một bộ cài chỉ cài được duy nhất 1 phần mềm trên 1 máy tính, nhưng với docker, một image có thể tạo được không giới hạn các container trên cùng một máy tính.

Một container luôn có hệ điều hành giống như một máy ảo, tuy nhiên nó có thể sử dụng được toàn bộ sức mạnh phần cứng của host, không phải phân chia core hay ram như một máy ảo.

## 2. Các trạng thái của một container

Trạng thái của một container có thể được quan sát với câu lệnh `docker ps -a`

* `Created` Container được khởi tạo mới bằng câu lệnh `docker run`
* `up` container đang ở trạng thái hoạt động (active) 
* `paused` trạng thái tạm ngưng, đóng băng
* `Exited` trạng thái off

```console
    $docker ps -a

    CONTAINER ID   IMAGE          COMMAND       CREATED          STATUS                    PORTS     NAMES
    71e7c47685f2   bi             "/bin/bash"   48 minutes ago   Up 48 minutes                       bo
    6a04fd311401   63878e911300   "/bin/bash"   4 hours ago      Up 4 hours                          kind_lamport
    4fc3ae93bff1   63878e911300   "/bin/bash"   4 hours ago      Exited (1) 4 hours ago              compassionate_aryabhata
    b58f67683814   centos         "-it"         3 months ago     Created                             centos
```

## 3. Docker commands

* `docker run` : Docker sẽ tạo một container mới và khởi chạy container. Container này sẽ chưa tồn tại trên hệ thống trước đó.
* `docker ps` : Liệt kê trạng thái các container đang ở trạng thái `active` or `up`
    * `docker ps -a`: Liệt kê tất cả các container đã tồn tại trên hệ thống và trạng thái của nó
    * `docker ps -l`: Liệt kê container chạy ở lần cuối 
* `docker start`: Khởi chạy một container đã tồn tại trên hệ thống
* `docker attach`: Truy cập trực tiếp vào container đang 'active'
* `ctrl+p then ctrl+q`: Thoát khỏi container đang chạy tuy nhiên không thay đổi trạng thái 'active' của container
* `exit`: Thoát khỏi container và chuyển container về trạng thái 'exited'
* `docker rm`
* `docker rename`
* `docker images`: list các docker image trên hệ thống 
* `docker rmi`: dùng để gỡ bỏ docker image
* `docker commit`


### 3.1 $docker run

`docker run` tạo một container mới dựa trên `image` được cung cấp. Container mới này được định danh bởi `container name` và `containter id`.

* `docker run` chỉ cần chạy `docker run` một lần duy nhất.
* `container name`: mỗi một `container` được tạo ra sẽ có một tên do hệ thống tự tạo ra. Ta có thể chủ động đặt tên cho `container` bằng `--name=<ten>`
    * Có thể rename cho một container bằng `docker rename old_name new_name`
    * Loại bỏ container bằng `docker rm name` hoặc `docker rm <container-id>`


* Các cờ quan trọng
    * `-it` : viết tắt của interactive và terminal: cho phép người dùng container được tương tác với terminal của container
    * `--name`: đặt tên cho container khi khởi tạo 
    * `--env`: thiết lập biến môi trường cho container 
    * `--net`: thiết lập network mode của container
    * `-v`: mounting volume cho container 

#### Example 1

```bash
docker run --name=bi -it ubuntu:20.04 /bin/bash
```
Giải nghĩa: `docker run` khởi chạy một `container` với các cờ sau

* `--name`: đặt tên cho container là `bi`
* `-it`: là một tổ hợp cờ bao gồm cờ `-i` interactive mode và cờ `-t` terminal. Cờ `-it` cho phép host tương tác với `container` terminal (shell) 
* `ubuntu:20.04`: images để tạo container là images chứa OS ubuntu 20.04
* `bin/bash`: là câu lệnh ta muốn chạy trong container. Trong trường hợp này ta gọi bash shell của container.

Khi ta chạy câu lệnh trên: Docker sẽ tạo một container mới có tên là `bi` từ `image` `ubuntu:20.04` và cho phép bạn tương tác với terminal bên trong container's bash shell

#### Example 2

```bash
docker run --name=bi -it --env="DISPLAY" --net="host" ubuntu:20.04 /bin/bash
```

Giải nghĩa: `docker run` khởi chạy một `container` với các cờ sau

* `--env="DISPLAY"`  set biến môi trường `DISPLAY` trong container bằng giá trị của X11 display của máy host. Cờ này sẽ giúp chạy các ứng dụng yêu cầu GUI trong container.
* `--net="host"` set network mode của container về giá trị `host`, nó cho phép sử dụng host network stack. Cờ này là cần thiết giúp container kết nối với X11 server ở host.

Khi chạy câu lệnh trên: Docker sẽ tạo một container mới có tên là `bi` từ image `ubuntu:20.04` và cho phép chạy GUI từ container, cũng như cho phép tương tác với bash shell bên trong container.

### 3.2 $docker start

Docker start được sử dụng để khởi chạy một container đang trong trạng thái `exited`.

```bash
docker start <ten_container>
```

Có thể sử dụng container name hoặc container ID 

```
CONTAINER ID   IMAGE          COMMAND       CREATED       STATUS                     PORTS     NAMES
71e7c47685f2   bi             "/bin/bash"   2 weeks ago   Exited (2) 4 seconds ago             bo
6a04fd311401   63878e911300   "/bin/bash"   2 weeks ago   Exited (129) 2 weeks ago             kind_lamport
```

Chạy container `bo` bằng cách:

`$ docker start bo`

### 3.3 $docker attach

Sau khi khởi chạy một container, truy cập vào môi trường của container bằng câu lệnh sau:

```bash
docker attach <ten container>
```

Có thể sử dụng container name hoặc container ID 

Truy cập môi trường container `bo` bằng cách:

`$docker attach bo`

### 3.4 $docker ps

`docker ps` được sử dụng với các cờ khác nhau và có chức năng khác nhau như bảng mô tả sau đây

`docker ps` liệt kê active containers.

```console
    $docker ps

    CONTAINER ID   IMAGE          COMMAND       CREATED          STATUS          PORTS     NAMES
    71e7c47685f2   bi             "/bin/bash"   43 minutes ago   Up 43 minutes             bo
    6a04fd311401   63878e911300   "/bin/bash"   4 hours ago      Up 4 hours                kind_lamport
```


`docker ps -a`: Liệt kê tất cả các container đã tồn tại trên hệ thống và trạng thái của nó

```console
    $docker ps -a

    CONTAINER ID   IMAGE          COMMAND       CREATED          STATUS                    PORTS     NAMES
    71e7c47685f2   bi             "/bin/bash"   48 minutes ago   Up 48 minutes                       bo
    6a04fd311401   63878e911300   "/bin/bash"   4 hours ago      Up 4 hours                          kind_lamport
    4fc3ae93bff1   63878e911300   "/bin/bash"   4 hours ago      Exited (1) 4 hours ago              compassionate_aryabhata
    787633e9ba6b   b1aca4e283c3   "/bin/bash"   4 hours ago      Exited (1) 4 hours ago              friendly_lalande
    da5542d0afe9   b1aca4e283c3   "/bin/bash"   4 hours ago      Exited (0) 4 hours ago              stoic_sammet
    ddee01f20648   ubuntu:20.04   "/bin/bash"   4 hours ago      Exited (0) 4 hours ago              hopeful_galileo
    ffd04bafba30   ubuntu:20.04   "/bin/bash"   4 hours ago      Exited (1) 4 hours ago              sad_pike
    c9b722c07457   ubuntu:20.04   "/bin/bash"   4 hours ago      Exited (0) 4 hours ago              vigorous_swirles
    a7f42806d870   ubuntu         "/bin/bash"   5 hours ago      Exited (0) 5 hours ago              fervent_solomon
    a0c13546b00c   1c5c8d0b973a   "/bin/bash"   5 hours ago      Exited (0) 5 hours ago              blissful_easley
    191e06db8539   ubuntu:20.04   "/bin/bash"   5 hours ago      Exited (0) 5 hours ago              festive_shtern
    3212c599efc1   centos         "/bin/bash"   3 months ago     Exited (0) 3 months ago             catapult
    23716beeda73   centos         "/bin/bash"   3 months ago     Exited (0) 3 months ago             kind_hertz
    e8ddaa72a7ec   centos         "/bin/bash"   3 months ago     Exited (0) 3 months ago             centos7
    b58f67683814   centos         "-it"         3 months ago     Created                             centos
    78409755de36   feb5d9fea6a5   "/hello"      3 months ago     Exited (0) 3 months ago             boring_shaw
    c5e156ba746f   feb5d9fea6a5   "/hello"      3 months ago     Exited (0) 3 months ago             eloquent_merkle
```

`docker ps -l`: Liệt kê container chạy ở lần cuối cùng

```console
    $docker ps -l

    CONTAINER ID   IMAGE     COMMAND       CREATED          STATUS          PORTS     NAMES
    71e7c47685f2   bi        "/bin/bash"   49 minutes ago   Up 49 minutes             bo
```

### 3.5 $docker rm

Như đã thấy ở danh sách `docker ps -a`, có rất nhiều containers không được dùng mà vẫn tồn tại trên hệ thống. Ta có thể loại bỏ chúng bằng câu lệnh `docker rm`

```bash
docker rm eloquent_merkle
```

Tương đương với

```bash
docker rm c5e156ba746f
```

### 3.6 $docker images

Liệt kê tất cả các images có trên hệ thống

```console
$docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
bi           latest    9b486bf052eb   6 hours ago   1.14GB
ubuntu       latest    08d22c0ceb15   3 weeks ago   77.8MB
ubuntu       20.04     1c5c8d0b973a   3 weeks ago   72.8MB

```

### 3.7 $docker rmi

Để gỡ docker images, trước tiên phải gỡ bỏ toàn bộ các container được tạo bởi image cần xóa bằng câu lệnh `docker rm <container-name>`. Sau đó, dùng câu lệnh `docker rmi`

```bash
docker rmi 08d22c0ceb15
```