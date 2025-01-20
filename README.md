# Github CLI extension scripts

Because bash aliases can go for so long

## Features

- [Delete all merged branches](./git-delete-all-merged-branches.ts)

## Dependencies

- [github cli](https://cli.github.com)
- [Deno 2.x](https://deno.com) with JSR support

## Installation

Just add the project path to PATH

```sh
# bash/zsh
echo "export PATH=\$PATH:$(pwd)" >> ~/.bashrc

# fish
echo "fish_add_path (pwd)" >> ~/.config/fish/config.fish
```

## License

AGPL-3.0-only
