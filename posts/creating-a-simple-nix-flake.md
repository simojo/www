# Creating a Simple Nix Flake
## Let's make a simple Nix flake that builds a project and installs it.
### 2025-07-25

Nix flakes is an experimental feature of the Nix package manager
[(docs)](https://nixos.wiki/wiki/flakes). As opposed to standard `nix` files, flakes allow for a
self-contained, reproducible output thanks to the `flake.lock` file, which locks
dependencies in-place. Previously, with Nix derivations or shells, pinning
packages required one to manually specify how the package is to be downloaded
using a fetcher. Nix flakes simplifies this process, making it more ergonomic on
the user's end.

> Disclaimer: I am not an expert. I am trying to document my knowledge of Nix to
> formalize my understanding of it. I enjoy learning, so reach out if there's
> more to the story that I'm missing.

#### Before starting

Because Nix flakes is experimental, you won't find it usable with a fresh
install of Nix (at least currently). From [the wiki](https://nixos.wiki/wiki/flakes), you'll need tell `nix` you
want experimental features:

> When using any `nix` command, add the following command-line options:

```
 --experimental-features 'nix-command flakes'
```

#### Flake that writes to a file

A nix flake is made of four basic parts: a `description`, `inputs`, `outputs`,
and `nixConfig`. For our purposes, however, let's focus on the two most simple
ones, `inputs` and `outputs`:

```nix
# flake.nix
{
  inputs = { /*...*/ }; # needs to be an attribute set
  outputs = { self }: { /*...*/ }; # needs to be a function returning a nix derivation
}
```

The attributes of `inputs` can be anything containing a valid flake: local
files, GitHub repositories, tarballs, and zip archives. For now, our only input
will be a reference to an commit on the unstable branch of nixpkgs.

`outputs` is a function that must take `self`, a reference to the flake. For
example, `self.inputs` returns `inputs` as we have defined it. If we run `nix
build` on `flake.nix` as-is, we'll get

```
error: flake 'git+file:///_scratch/notes?dir=2025-07-24' does not provide attribute 'packages.x86_64-linux.default' or 'defaultPackage.x86_64-linux'
```

This is because the flake does not output a derivation; at least *not
yet*. Because the system I'm working on is Linux, it's looking for the
attributes `packages.x86_64-linux.default` or `defaultPackage.x86_64-linux` in
`outputs`. Note that `"x86_64-linux"` is a system type. Other system types can
be `"i686-linux"` (Linux, 32-bit Intel) or `"x86_64-darwin"` (macOS, 64-bit
Intel). To find our your system type, you can run `nix -vv --version`.

Let's give `nix build` what it wants. We'll add `nixpkgs` to the `inputs` of our
flake. This will automatically pass it to `outputs` as an argument. Because
outputs is currently defined as

```nix
{
  outputs = { self }: {};
}
```

We will need to modify the function signature to accept `nixpkgs` as an
argument. Because `nixpkgs` is just a flake input, it needs to be imported so we
can access its attributes. Additionally, when we import it, we tell it which
system its being imported on.

Lastly, we need `outputs` to return a valid attrset, namely one that has a
default package pointing to a derivation. One of the most simple derivations is
`writeTextFile`, which writes a text file in the Nix store under the same
directory as the derivation.

```nix
# flake.nix
{
  inputs = {
    # use nixos-unstable-2024-10-09
    nixpkgs.url = "github:NixOS/nixpkgs/c31898adf5a8ed202ce5bea9f347b1c6871f32d1";
  };
  outputs = { self, nixpkgs }:
    let
      pkgs = import nixpkgs { system = "x86_64-linux"; };
    in {
      packages.x86_64-linux.default = pkgs.writeTextFile {
        name = "simple-flake-text";
        text = ''
          Yay, we wrote text to a file!
        '';
      };
    };
}
```

Now, if we run `nix build` in the same directory as our flake, we see the
following directory structure:

```
flake.lock
flake.nix
result -> /nix/store/15cdirr0sihc0yn70hv9sbl34m9phs4n-simple-flake-text
```

`result` is a symlink that points to the *real* location of the file we wrote to
in the Nix store:

```txt
# result.txt

Yay, we wrote text to a file!
```

So we did it: we created a minimal working flake that tells Nix "hey, create this
derivation when I build this flake!"

#### Flake that builds a C program

Now that we've established the fundamentals, we can begin to see how flakes can
become even more useful: compiling from source without downloading the tool
chain to your local environment. In this section, we'll leverage more of Nix's
derivation mechanics, which tend to be confusing.

Previously, our flake's default package was the derivation
`pkgs.writeTextFile`, which writes a text file under the derivation directory in
`/nix/store`. Now, we'll use `pkgs.stdenv.mkDerivation` to make a derivation
from scratch.

#### The derivation

We'll have our derivation build and install a simple C program:

```c
// main.c

#include <stdio.h>
const char* txt = "Hello, world!\n";
int main() {
  printf("%s", txt);
  return 0;
}
```

This would normally be built by running `gcc main.c -o hello` and installed by
copying `hello` to some directory on the PATH. In other words, we only need
**1**: the source code, **2**: `gcc`, and **3**: a binary destination to
effectively do what we're trying to do.

The function `pkgs.stdenv.mkDerivation` has the following inputs, of which we'll
use `name`, `pname`, `src`, `buildInputs`, `buildPhase`, and `installPhase`:

```
{
  # Core Attributes
  name: string
  pname?: string
  version?: string
  src:  path

  # Building
  buildInputs?: list[derivation]
  buildPhase?:  string
  installPhase?:  string
  builder?: path

  # Nix shell
  shellHook?: string
}
```

- `name` is the name of the derivation
- `pname` is the name of the package as it would be run
- `src` is the location of the files we'll use to build out the derivation
  (one common location would be `./src` in the same directory of the flake)
- `buildInputs` is a complete list of derivations that we need to reference for
  building the output derivation (in our case, this is just `pkgs.gcc`)
- `buildPhase` by default is a shell script that builds the derivation's output.
  Other builders (like Python) could be specified using `builder`
- `installPhase` is how the output of `buildPhase` is to be handled and
  installed to the store.

#### Putting it into the flake

Rather than supplying a physical source destination, let's use
`pkgs.writeTextFile` again to make a derivation that the source file under it,
which we can reference:

```nix
# flake.nix

# ...
let
  pkgs = import nixpkgs { system = "x86_64-linux"; };
  hello-world-src = pkgs.writeTextFile {
    name = "hello-world-src";
    destination = "/main.c";
    text = ''
      #include <stdio.h>
      const char* txt = "Hello, world!\n";
      int main() {
        printf("%s", txt);
        return 0;
      }
    '';
  };
in
# ...
```

The structure of our derivation flows logically from our needs. Because it's
still the default output derivation, we are still setting
`packages.x86_64-linux.default`; we just invoke `pkgs.stdenv.mkDerivation` now
rather than `pkgs.writeTextFile`.

```nix
# flake.nix

# ...
let
# ...
in {
  packages.x86_64-linux.default = pkgs.stdenv.mkDerivation {
    name = "hello-world";
    pname = "hello-world";
    buildInputs = [
      pkgs.gcc
    ];
    src = hello-world-src;

```

Because our `src` points to our text file derivation, we automatically start in
its root directory. Hence, we can reference `main.c` directly.

```nix
    buildPhase = ''
      gcc main.c -o hello-world
    '';
```

We're still technically in the root directory of the `hello-world-src`
derivation. Derivations allow for an `$out` variable that references the `out`
directory of that derivation. Placing the executable in `$out/bin` automatically
makes it executable if the derivation were to be part of our environment.

```nix
    installPhase = ''
      mkdir -p $out/bin
      cp hello-world $out/bin
    '';
  };
};
```

Finally, our flake is ready to be invoked:

```nix
# flake.nix

{
  inputs = {
    # use nixos-unstable-2024-10-09
    nixpkgs.url = "github:NixOS/nixpkgs/c31898adf5a8ed202ce5bea9f347b1c6871f32d1";
  };
  outputs = { self, nixpkgs }:
    let
      pkgs = import nixpkgs { system = "x86_64-linux"; };
      hello-world-src = pkgs.writeTextFile {
        name = "hello-world-src";
        destination = "/main.c";
        text = ''
          #include <stdio.h>
          const char* txt = "Hello, world!\n";
          int main() {
            printf("%s", txt);
            return 0;
          }
        '';
      };
    in {
      packages.x86_64-linux.default = pkgs.stdenv.mkDerivation {
        name = "hello-world";
        pname = "hello-world";
        buildInputs = [
          pkgs.gcc
        ];
        src = hello-world-src;
        buildPhase = ''
          gcc main.c -o hello-world
        '';
        installPhase = ''
          mkdir -p $out/bin
          cp hello-world $out/bin
        '';
      };
    };
}
```

#### Building and running the flake

Now if we run `nix build` in the same directory as `flake.nix`, a `result` file
is produced, which points to our derivation's output in `/nix/store`.

```sh
$ nix build && ls -l | awk '{print $9, $10, $11}'

flake.lock
flake.nix
result -> /nix/store/5g0yq85b2kg8r04bk1g6579lkh1ilvn4-hello-world
```

We can run our `hello-world` executable, which, if we remember, was placed under
`$out/bin`:

```sh
$ ./result/bin/hello-world

Hello, world!
```

#### Inspecting the flake

Using `nix derivation show`, we can inspect the locations of the
`hello-world-src` and `hello-world` in `/nix/store`.

```sh
$ nix derivation show | rg "(hello-world|hello-world-src)"

  "/nix/store/0fspq9j4r29d5y2i2d0qgac408zb4a3w-hello-world.drv": {
      "out": "/nix/store/5g0yq85b2kg8r04bk1g6579lkh1ilvn4-hello-world",
      "src": "/nix/store/ndd1q22iginyk70g9il2jbd9fj84xf10-hello-world-src",
      "/nix/store/d03s7vgnp3ndacf2x6gs78vclfhwsiy8-hello-world-src.drv": {
        "path": "/nix/store/5g0yq85b2kg8r04bk1g6579lkh1ilvn4-hello-world"
```

So we can see the store paths for the derivations and the directories. Let's
look at the directories for `hello-world-src` (the C file derivation) and
`hello-world` (the derivation that builds the executable):

```sh
$ tree /nix/store/5g0yq85b2kg8r04bk1g6579lkh1ilvn4-hello-world

/nix/store/5g0yq85b2kg8r04bk1g6579lkh1ilvn4-hello-world
└── bin
    └── hello-world

$ tree /nix/store/ndd1q22iginyk70g9il2jbd9fj84xf10-hello-world-src

/nix/store/ndd1q22iginyk70g9il2jbd9fj84xf10-hello-world-src
└── main.c
```

As we can see, the structure of both directories in `/nix/store` reflects what
we created in `flake.nix`. As you can imagine, more complex patterns exist and
can be leveraged, but this shows us how we can create a Nix flake that compiles
and installs a C program in a self-contained way, even if we don't have `gcc`
installed in our environment.
