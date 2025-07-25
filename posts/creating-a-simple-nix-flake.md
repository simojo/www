# Creating a Simple Nix Flake
## Let's make a simple nix flake that builds a project and installs it.
### 2025-07-25

Nix flakes is an experimental feature of the Nix package manager
[(docs)](nix-flakes). As opposed to standard nix files, flakes allow for a
self-contained, reproducible output thanks to the `flake.lock` file, which locks
dependencies in-place. Previously, with nix derivations or shells, pinning
packages required one to manually specify how the package is to be downloaded
using a fetcher. Nix flakes simplifies this process, making it more ergonomic on
the user's end.

> Disclaimer: I am not an expert. I am trying to document my knowledge of Nix to
> formalize my understanding of it. I enjoy learning, so reach out if there's
> more to the story that I'm missing.

#### Before starting

Because Nix flakes is experimental, you won't find it usable with a fresh
install of Nix (at least currently). From [the wiki](nix-flakes), you'll need tell `nix` you
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

<!-- #### Flake that builds a C program

Now that we've established the fundamentals, we can begin to see how flakes can
become even more useful: compiling from source without downloading the toolchain
to you local environment. In this section, we'll leverage more of Nix's
derivation mechanics, which tend to be confusing. -->

[nix-flakes]: https://nixos.wiki/wiki/flakes
