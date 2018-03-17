# Bust A Gem for VS Code

The Bust A Gem extension adds **"Go to Definition"** for Ruby projects in VS Code. It will create a TAGS file using the [ripper-tags](https://github.com/tmm1/ripper-tags) gem, and then use the tags for Go to Definition. Fast and easy.

In addition, Bust A Gem adds an **"Open Gem..."** command for quickly opening a gem from your Gemfile. This opens a new window in VS Code.

Note: Bust A Gem relies on bundler and only works with Ruby projects that have a `Gemfile`.

<!---
markdown-toc --no-firsth1 --maxdepth 1 readme.md
-->

## Table of Contents

* [Installation](#installation)
* [Ripping](#ripping)
* [Settings](#settings)
* [Caveats and Troubleshooting](#caveats-and-troubleshooting)
* [Contributing](#contributing)
* [License](#license)

## Installation

First, install the extension through VS Code extensions. Search for Bust A Gem.

Second, Bust A Gem uses the excellent [ripper-tags](https://github.com/tmm1/ripper-tags) gem to build a TAGS file for your project. You have to install it so that VS Code can spawn it:

```sh
gem install ripper-tags
```

If you only want to use **"Open Gem..."**, there is no need to install `ripper-tags`.

## Ripping

The first time you use **"Go to Definition"**, Bust A Gem will use ripper-tags to create a `TAGS` file for your project.

Bust A Gem initially just indexes your project. You can also index some of your gem dependencies, which makes it possible to use Go to Definition to jump into a gem. See [Settings](#settings).

Bust A Gem doesn't rebuild TAGS automatically. Use the **"Rebuild"** command to rebuild the TAGS File. You'll want to do this periodically as you work on your project, or after change the `bustagem.gems` setting.

## Settings

You probably want to set `bustagem.gems`. Initially, Bust A Gem will only index your project. Add gem names to `bustagem.gems` to instruct Bust A Gem to add some of your gems to the TAGS file. Bust A Gem uses bundler and your Gemfile to find those gems. Don't forget to run **"Rebuild"** to rebuild the TAGS file!

```json
// The list of gems to index for the TAGS file.
"bustagem.gems": [ "activerecord", "devise", ... ]
// The command used to list gems.
"bustagem.cmd.bundle": "bundle show --paths",
// The command used to create TAGS file.
"bustagem.cmd.rip": "ripper-tags -f TAGS -R",
```

## Caveats and Troubleshooting

A few notes from my experience so far:

* Not (yet) tested on Linux or Windows.

* Make sure VS Code can spawn ripper-tags. If you can't run ripper-tags from the VS Code Terminal, Bust A Gem can't either. Bust A Gem will cd into your project before running ripper-tags, so if you are using rbenv/chruby/rvm, gem install into that Ruby.

* It should be possible to add `ripper-tags` to your Gemfile, though I haven't tested that configuration personally. You may need to override `bustagem.cmd.rip` and add `bundle exec`.

* Bust A Gem relies on bundler to list gems and figure out gem paths. Investigate `bundler show --paths` in your project if you can't get one of your gems to work.

* ripper-tags is fast. It only takes a second or two to rebuild TAGS for my project. If this is too slow for your needs, you may be able to switch to `ctags -e ...` using the `bustagem.cmd.rip` setting. ripper-tags is much better at ripping Ruby files. For example, ripper-tags indexes Ruby method aliases and ctags does not. But ctags is faster.

## Contributing

Feel free to open issues or PRs! We welcome all contributions, even from beginners. If you want to get started with a PR, please do the following:

1.  Read the [VS Code Extension Docs](https://code.visualstudio.com/docs/extensions/overview), especially [Running and Debugging Extensions](https://code.visualstudio.com/docs/extensions/debugging-extensions).
1.  Fork this repo.
1.  Install dependencies with `npm install`.
1.  Open the repo directory in VS Code and **install the recommended VS Code extensions**. This is important, because we use tslint and prettier with our Typescript.
1.  Make a code change and test it using F5 / Start Debugging. This is not hard, see the doc links above.
1.  Create a branch and submit a PR!

## License

This extension is [licensed under the MIT License](LICENSE.txt).
