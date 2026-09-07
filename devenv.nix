{ pkgs, ... }:

{
  packages = [ pkgs.git ];

  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    npm = {
      enable = true;
      # Install locked packages on activation. npm's predev also checks for
      # lockfile changes when git pull happens inside an already-open shell.
      install.enable = true;
    };
  };

  scripts.site-setup.exec = "npm ci";
  scripts.site-check.exec = "npm run check";
  scripts.site-build.exec = "npm run build";
  scripts.site-drafts.exec = "npm run build:drafts";

  processes.site.exec = "npm run dev";
}
