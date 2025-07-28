{
  description = "www";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/c31898adf5a8ed202ce5bea9f347b1c6871f32d1";
  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = [
          pkgs.pandoc
        ];
      };
      packages.${system}.default = pkgs.stdenv.mkDerivation {
        name = "www-static";
        buildInputs = [
          pkgs.pandoc
        ];
        src = ./.;
        buildPhase = ''
          mkdir -p $out/posts
          cp -r public/* $out

          for f in posts/*.md; do
            filename=$(basename "$f" .md)
            pandoc "$f" \
              --standalone \
              --mathjax \
              --template="$src/pandoc/template.html" \
              --highlight-style=tango \
              --css=../global.css \
              -o "$out/posts/$filename.html"
          done

          # Generate index.html
          echo "<!DOCTYPE html>
          <html>
          <head>
            <meta charset=\"utf-8\">
            <title>Simon Jones</title>
            <link rel=\"stylesheet\" href=\"global.css\">
          </head>
          <body>
            <ul>" > $out/index.html

          for f in posts/*.md; do
            filename=$(basename "$f" .md)
            echo "<div>
              <a href=\"posts/$filename.html\"><h2>$filename</h2></a>
            </div>" >> $out/index.html
          done

          echo "</ul>
          </body>
          </html>" >> $out/index.html
        '';
      };
  };
}
