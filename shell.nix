{ pkgs ? import <unstable> {} }:

let
  shellname = "wwwapi";
  myPython = with pkgs; [
    python38Full
    python38Packages.pylint
    python38Packages.flask
  ];
  myElm = with pkgs; [
    elmPackages.elm
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
      alias e='elm make src/Main.elm --output=./elm.js'
    '';
  }
