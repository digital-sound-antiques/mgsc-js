cmake_minimum_required(VERSION 2.8)

set(CMAKE_C_FLAGS "-Os -Wall -s WASM=0")

add_subdirectory(modules/mgsc)
include_directories(modules/mgsc/src)

if(EMSCRIPTEN)
	set(CMAKE_LINK_FLAGS "-O3")
	set(CMAKE_EXE_LINKER_FLAGS "-s WASM=0 -s MODULARIZE=1 --memory-init-file 0 -Os -s EXPORTED_FUNCTIONS=\"['_MGSC_compile']\" -s EXTRA_EXPORTED_RUNTIME_METHODS=\"['ccall','cwrap','AsciiToString']\"")
endif()

#  -s MODULARIZE=1 -s EXPORT_NAME=\"'MGSC_Module'\"

add_executable(mgsc-js src/bridge.cpp)
target_link_libraries(mgsc-js mgsc)
set_target_properties(mgsc-js PROPERTIES OUTPUT_NAME libmgsc)

