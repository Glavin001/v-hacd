#!/usr/bin/env bash
cd app/
# rm -rf builds/* builds-em/*

emcmake cmake -B builds-em #-D CMAKE_CXX_FLAGS="-s ASSERTIONS=1 -s NODERAWFS=1"
cmake --build builds-em

# rm -f builds/CMakeCache.txt

cmake -B builds
cmake --build builds
