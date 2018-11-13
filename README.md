[![Build Status](https://travis-ci.org/gurgeous/bust-a-gem.svg?branch=master)](https://travis-ci.org/gurgeous/bust-a-gem)

# Bust A Gem for VS Code

The Bust A Gem extension adds **"Go to Definition"** for Ruby projects in VS Code. It will create a TAGS file using the [ripper-tags](https://github.com/tmm1/ripper-tags) gem, and then use the tags for Go to Definition. Fast and easy.

Bust A Gem provides two additional handy features:

- An **"Open Gem..."** command for quickly opening a gem from your Gemfile. This opens a new window in VS Code.
- Limited support for **"Go to Symbol in File..."** for Ruby projects.

Note: Bust A Gem relies on bundler and only works with Ruby projects that have a `Gemfile`.

<!---
markdown-toc --no-firsth1 --maxdepth 1 readme.md
-->

## Table of Contents

- [Installation](#installation)
- [Ripping](#ripping)
- [Settings](#settings)
- [Caveats and Troubleshooting](#caveats-and-troubleshooting)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Installation

First, install the extension through VS Code extensions. Search for Bust A Gem.

Second, Bust A Gem uses the excellent [ripper-tags](https://github.com/tmm1/ripper-tags) gem to build a TAGS file for your project. Open an Integrated Terminal in VS Code (using `View > Integrated Terminal`) and run `gem install ripper-tags`. That should put ripper-tags into a spot where VS Code can spawn it. If you are still getting errors about ripper-tags, use `Help > Toggle Developer Tools` to see more debug info.

#### Alternate ripper-tags installation

Add `gem ripper-tags` to your Gemfile and run `bundle install`. In VS Code Settings, set `bustagem.cmd.rip` to `bundle exec ripper-tags -f TAGS -R --force --extra=q` to use bundler.

## Ripping

The first time you use **"Go to Definition"**, Bust A Gem will use ripper-tags to create a `TAGS` file for your project.

Bust A Gem initially just indexes your project. You can also index some of your gem dependencies, which makes it possible to use Go to Definition to jump into a gem. See [Settings](#settings).

Bust A Gem doesn't rebuild TAGS automatically. Use the **"Rebuild"** command to rebuild the TAGS File. You'll want to do this periodically as you work on your project, or after change the `bustagem.gems` setting.

## Settings

You probably want to set `bustagem.gems`. Initially, Bust A Gem will only index your project. Add gem names to `bustagem.gems` to instruct Bust A Gem to add some of your gems to the TAGS file. Bust A Gem uses bundler and your Gemfile to find those gems. Don't forget to run **"Rebuild"** to rebuild the TAGS file!

| Settings            | Example                             | Notes                                    |
| ------------------- | ----------------------------------- | ---------------------------------------- |
| bustagem.gems       | `[ "activerecord", "devise", ... ]` | List of gems to index for the TAGS file. |
| bustagem.cmd.bundle | `"bundle show --paths"`             | Command used to list gems.               |
| bustagem.cmd.rip    | `"ripper-tags -f TAGS -R ..."`      | Command used to create the TAGS file.    |

## Caveats and Troubleshooting

A few notes from my experience so far:

- Make sure VS Code can spawn ripper-tags. If you can't run ripper-tags from the VS Code Integrated Terminal, Bust A Gem can't either. See [Installation](#installation).

- Not tested on Linux or Windows.

- Bust A Gem relies on bundler to list gems and figure out gem paths. Investigate `bundler show --paths` in your project if you can't get one of your gems to work.

- ripper-tags is fast. It only takes a second or two to rebuild TAGS for my project. If this is too slow for your needs, you may be able to switch to `ctags -e ...` using the `bustagem.cmd.rip` setting. ripper-tags is much better at ripping Ruby files. For example, ripper-tags indexes Ruby method aliases and ctags does not. But ctags is faster.

## Contributing

Feel free to open issues or PRs! We welcome all contributions, even from beginners. If you want to get started with a PR, please do the following:

1.  Read the [VS Code Extension Docs](https://code.visualstudio.com/docs/extensions/overview), especially [Running and Debugging Extensions](https://code.visualstudio.com/docs/extensions/debugging-extensions).
1.  Fork this repo.
1.  Install dependencies with `npm install`.
1.  Open the repo directory in VS Code and **install the recommended VS Code extensions**. This is important, because we use tslint and prettier with our Typescript.
1.  Make a code change and test it using F5 / Start Debugging. This is not hard, see the doc links above.
1.  Create a branch and submit a PR!

Sidenote - want to test in the terminal? You'll have to set an environment variable when running npm test, see below. I generally prefer to use F5 in vscode, which works without any fiddling.

`CODE_TESTS_WORKSPACE=./src/test/fixtures npm test`

## Changelog

#### 0.1.7 - Nov 12, 2018

- #5 use specific SymbolKind for each symbol (thanks @feber)

#### 0.1.6 - Mar 2018

- Added tests and fixed a few minor bugs that I doubt anyone noticed at this early stage.
- Experimental support for Go to Symbol in File.
- Go to Definition supports modules like `ActionController::Base`, via ripper-tags `--extra=q`.

## License

This extension is [licensed under the MIT License](LICENSE.txt).
