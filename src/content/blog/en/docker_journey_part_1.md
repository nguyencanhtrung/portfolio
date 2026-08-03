---
title: 'Docker - Quick start'
description: 'Getting started with Docker: the pull, run, start and attach cycle, the states a container moves through, and the minimum set of commands for managing containers and images without reaching for the manual.'
date: 2023-03-30
lang: en
key: docker_journey_part_1
tags: ['docker']
---
## 1. The Docker workflow

Step 1: pull an image onto the machine with `docker pull`. Think of it as an
installer.

Step 2: create and run a container from the image pulled in step 1.

Step 3: install tools inside the container and do whatever work you need there.
You can `stop` the container, `exit` it, and come back to it later.

Step 4: save the result as a new image with `docker commit` — the installed
toolchain and everything else on the filesystem at that moment. That image can
be moved to other machines with all of it intact.

A container is roughly a piece of software installed from an `image`. The
comparison breaks in one important way: an installer installs one copy of a
program on one machine, whereas one Docker image can produce any number of
containers on the same machine.

From the inside a container looks like its own operating system, but unlike a
virtual machine it **shares the host's kernel** — the image contains only
userspace (libraries, utilities, the filesystem). Because there is no second
kernel and no hypervisor layer, a container uses the host's full CPU and RAM by
default rather than being given a fixed slice of cores and memory the way a VM
is. The flip side: a Linux container only runs on a Linux kernel.

## 2. Container states

`docker ps -a` shows what state each container is in:

* `Created` — freshly created, by `docker run`
* `Up` — running
* `Paused` — suspended, frozen
* `Exited` — stopped

```console
    $docker ps -a

    CONTAINER ID   IMAGE          COMMAND       CREATED          STATUS                    PORTS     NAMES
    71e7c47685f2   bi             "/bin/bash"   48 minutes ago   Up 48 minutes                       bo
    6a04fd311401   63878e911300   "/bin/bash"   4 hours ago      Up 4 hours                          kind_lamport
    4fc3ae93bff1   63878e911300   "/bin/bash"   4 hours ago      Exited (1) 4 hours ago              compassionate_aryabhata
    b58f67683814   centos         "-it"         3 months ago     Created                             centos
```

## 3. Docker commands

* `docker run`: creates a brand-new container and starts it. The container did
  not exist on the system before.
* `docker ps`: lists the containers that are `active` or `up`
    * `docker ps -a`: lists every container on the system and its state
    * `docker ps -l`: lists the most recently run container
* `docker start`: starts a container that already exists on the system
* `docker attach`: drops you into a running container
* `ctrl+p then ctrl+q`: leave a running container without changing its state
* `exit`: leave the container and put it into the `exited` state
* `docker rm`
* `docker rename`
* `docker images`: lists the images on the system
* `docker rmi`: removes an image
* `docker commit`

### 3.1 $docker run

`docker run` creates a new container from the given `image`. The new container
is identified by a `container name` and a `container id`.

* `docker run` is only ever run once per container.
* `container name`: every container gets a system-generated name. You can
  choose your own with `--name=<name>`
    * Rename with `docker rename old_name new_name`
    * Remove with `docker rm name` or `docker rm <container-id>`

* The flags that matter
    * `-it`: short for interactive and terminal — lets you interact with the
      container's terminal
    * `--name`: name the container at creation
    * `--env`: set an environment variable inside the container
    * `--net`: set the container's network mode
    * `-v`: mount a volume into the container

#### Example 1

```bash
docker run --name=bi -it ubuntu:20.04 /bin/bash
```

What it does — `docker run` starts a `container` with these flags:

* `--name`: names the container `bi`
* `-it`: the combination of `-i` (interactive mode) and `-t` (terminal). It
  lets the host interact with the container's terminal (shell).
* `ubuntu:20.04`: the image to build the container from, here Ubuntu 20.04
* `bin/bash`: the command to run inside the container — in this case the
  container's bash shell

Running that line, Docker creates a new container called `bi` from the
`ubuntu:20.04` `image` and hands you an interactive prompt inside the
container's bash shell.

#### Example 2

```bash
docker run --name=bi -it --env="DISPLAY" --net="host" ubuntu:20.04 /bin/bash
```

What it does — `docker run` starts a `container` with these flags:

* `--env="DISPLAY"` sets the container's `DISPLAY` variable to the host's X11
  display, which is what lets GUI applications inside the container render.
* `--net="host"` sets the container's network mode to `host`, giving it the
  host's network stack. This is what lets the container reach the host's X11
  server.

Running that line, Docker creates a new container called `bi` from the
`ubuntu:20.04` image, able to run GUI applications, with an interactive bash
shell inside.

### 3.2 $docker start

`docker start` brings back a container that is in the `exited` state.

```bash
docker start <container_name>
```

Either the container name or the container ID works.

```
CONTAINER ID   IMAGE          COMMAND       CREATED       STATUS                     PORTS     NAMES
71e7c47685f2   bi             "/bin/bash"   2 weeks ago   Exited (2) 4 seconds ago             bo
6a04fd311401   63878e911300   "/bin/bash"   2 weeks ago   Exited (129) 2 weeks ago             kind_lamport
```

To start the `bo` container:

`$ docker start bo`

### 3.3 $docker attach

Once a container is running, get into its environment with:

```bash
docker attach <container name>
```

Either the container name or the container ID works.

To get into `bo`:

`$docker attach bo`

### 3.4 $docker ps

`docker ps` behaves differently depending on the flag, as follows.

`docker ps` lists the active containers.

```console
    $docker ps

    CONTAINER ID   IMAGE          COMMAND       CREATED          STATUS          PORTS     NAMES
    71e7c47685f2   bi             "/bin/bash"   43 minutes ago   Up 43 minutes             bo
    6a04fd311401   63878e911300   "/bin/bash"   4 hours ago      Up 4 hours                kind_lamport
```

`docker ps -a` lists every container on the system with its state:

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

`docker ps -l` lists the most recently run container:

```console
    $docker ps -l

    CONTAINER ID   IMAGE     COMMAND       CREATED          STATUS          PORTS     NAMES
    71e7c47685f2   bi        "/bin/bash"   49 minutes ago   Up 49 minutes             bo
```

### 3.5 $docker rm

As the `docker ps -a` listing shows, plenty of containers sit around long after
they stopped being useful. `docker rm` clears them out:

```bash
docker rm eloquent_merkle
```

which is the same as:

```bash
docker rm c5e156ba746f
```

### 3.6 $docker images

Lists every image on the system:

```console
$docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
bi           latest    9b486bf052eb   6 hours ago   1.14GB
ubuntu       latest    08d22c0ceb15   3 weeks ago   77.8MB
ubuntu       20.04     1c5c8d0b973a   3 weeks ago   72.8MB

```

### 3.7 $docker rmi

To remove an image you must first remove every container created from it, with
`docker rm <container-name>`. Then:

```bash
docker rmi 08d22c0ceb15
```

### 3.8 $docker commit

This is step 4 of the workflow at the top: package a container's current state
as a new image.

```bash
docker commit <container> <new_image_name>:<tag>
```

For example, once the toolchain is installed in container `bi`:

```bash
docker commit bi bi-tools:v1
```

The new image shows up in `docker images` and can be used with `docker run` to
create as many containers as you like, here or on another machine.

Two things worth knowing:

* A commit captures only the container's **filesystem**. Data in a volume
  mounted with `-v` is not in the image — that is precisely what volumes are
  for.
* An image built by `commit` carries no recipe for rebuilding itself. Six
  months later nobody knows what is inside it or which commands put it there.
  It is a convenient way to freeze an environment mid-flight; for one you plan
  to keep, write a `Dockerfile`.
