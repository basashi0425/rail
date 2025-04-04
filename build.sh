#!/bin/bash

# 必要なパッケージをインストール
apt-get update && apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libxkbcommon-x11-0 libxcomposite1 libxrandr2 libgbm1 libpango-1.0-0 libasound2 \
    libgtk-3-0 libx11-xcb1 fonts-liberation libwayland-client0 libwayland-cursor0 libwayland-egl1

# Playwright の Firefox をインストール
npx playwright install --with-deps firefox
