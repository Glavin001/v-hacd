#!/usr/bin/env bash

docker-compose up --build

sleep 1

# OBJ_PATH=./meshes/mite.obj
# OBJ_PATH=./meshes/beshon.obj
# OBJ_PATH=./meshes/caterpillar.obj
OBJ_PATH=./meshes/lamp.obj

echo "=========="
echo "Testing with binary..."
(cd app/ && ./builds/TestVHACD "$OBJ_PATH")

sleep 1

echo "=========="
echo "Testing with Node..."
# nvm install stable
# nvm use stable
(cd app/ && node builds-em/TestVHACD.js "$OBJ_PATH")
