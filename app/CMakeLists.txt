# Copyright 2017 The LevelDB Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file. See the AUTHORS file for names of contributors.

cmake_minimum_required(VERSION 3.10)
# Keep the version below in sync with the one in db.h
project(TestVHACD VERSION 1.23.0 LANGUAGES C CXX)

# This project requires C++11.
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# set(CMAKE_C_COMPILER "emcc")

# set(EMCC_LINKER_FLAGS "-s SAFE_HEAP=1 --bind -s WASM=1 -O3 -s ASSERTIONS=1 -s NODERAWFS=1")
# set(EMCC_LINKER_FLAGS "-s ASSERTIONS=2 -s NODERAWFS=1 -s SAFE_HEAP=1 -O3")
# set(CMAKE_REQUIRED_FLAGS "${EMCC_LINKER_FLAGS}")
# set(CMAKE_CXX_FLAGS "${EMCC_LINKER_FLAGS}")

if (EMSCRIPTEN) 
    #string(APPEND CMAKE_CXX_FLAGS " -s ASSERTIONS=1") 
    # string(APPEND CMAKE_CXX_FLAGS " -s USE_PTHREADS -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s ASSERTIONS=1 -s NODERAWFS=1 -s SAFE_HEAP=1 -O3") 
    # string(APPEND CMAKE_CXX_FLAGS " -s ALLOW_MEMORY_GROWTH=1 -s WASM=1 -s ASSERTIONS=1 -s NODERAWFS=1 -s SAFE_HEAP=1 -O3") 
    # string(APPEND CMAKE_CXX_FLAGS " -s ASSERTIONS=1 -s NODERAWFS=1 -s USE_PTHREADS -s ALLOW_MEMORY_GROWTH=1 -s ALLOW_TABLE_GROWTH=1 -s TOTAL_MEMORY=67108864 -O3") 
    # string(APPEND CMAKE_CXX_FLAGS " -s ASSERTIONS=1 -s NODERAWFS=1 -s USE_PTHREADS -s INITIAL_MEMORY=536870912 -O3") 
    # string(APPEND CMAKE_CXX_FLAGS " -s NODERAWFS=1 -s USE_PTHREADS -s INITIAL_MEMORY=536870912 -s WASM=1 -O3")
    string(APPEND CMAKE_CXX_FLAGS " -s NODERAWFS=1 -s USE_PTHREADS -s INITIAL_MEMORY=536870912 -s WASM=1 -O3 -s ALLOW_MEMORY_GROWTH=1 -s ALLOW_TABLE_GROWTH=1 -s TOTAL_MEMORY=536870912")
    string(APPEND CMAKE_EXE_LINKER_FLAGS " -s ASYNCIFY") 
    string(APPEND CMAKE_EXE_LINKER_FLAGS " -s PROXY_TO_PTHREAD") 
endif()

# 16777216
# 67108864
# 74240000
# 536870912

# -s ASSERTIONS=2 -s NODERAWFS=1 -s SAFE_HEAP=1 -O3 -sWASM=0

add_executable(TestVHACD TestVHACD.cpp FloatMath.cpp InParser.cpp wavefront.cpp)

target_include_directories(TestVHACD PUBLIC "../include")
# On Linux we need to add pthread to the link
if (WIN32)
else (WIN32)
	target_link_libraries(TestVHACD pthread)
endif (WIN32)

# set_target_properties(TestVHACD PROPERTIES
# # LINK_FLAGS "-s NODERAWFS=1"
# CMAKE_CXX_FLAGS "-s NODERAWFS=1 -s ASSERTIONS=1"
# )
# # -s ASSERTIONS=1

