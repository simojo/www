{ pkgs ? import <unstable> {} }:

let
  shellname = "python";
  myPython = with pkgs; [
    python38Full
    python38Packages.pylint
    python38Packages.flask
  ];
in
  pkgs.stdenv.mkDerivation {
    name = shellname;
    buildInputs = [
      myPython
    ];
    shellHook = ''
      export NIX_SHELL_NAME='${shellname}'
      alias p='python3'
    '';
  }
