#!/bin/bash

# 1. Install packages
echo "Install python packages..."
uv sync --all-extras --dev
bun install

# 2. Add poe completion to the shell
echo "Installing poe completion..."
mkdir -p ~/.oh-my-zsh/completions && uv run poe _zsh_completion > ~/.oh-my-zsh/completions/_poe

#  3. Install pre-commit hooks
echo "Installing pre-commit hooks..."
uv run pre-commit install

# 4. Configure zsh
echo "Configuring zsh theme..."

sed -i 's/ZSH_THEME=".*"/ZSH_THEME="amuse"/' /home/vscode/.zshrc
