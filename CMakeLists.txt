cmake_minimum_required(VERSION 2.8)
project(mgsc-js)

set(CMAKE_C_FLAGS "-O3 -Wall")

add_subdirectory(modules/mgsc)
include_directories(modules/mgsc/src)

set (exported_function_list
	_MGSC_compile
	_malloc
	_free
)

list(JOIN exported_function_list "','" exported_functions)

if(EMSCRIPTEN)
	set(CMAKE_LINK_FLAGS "-O3")
	set(CMAKE_EXE_LINKER_FLAGS "-s WASM=1 -s SINGLE_FILE=1 -s FILESYSTEM=0 -s MODULARIZE=1 --memory-init-file 0 -Os -s EXPORTED_FUNCTIONS=\"['${exported_functions}']\" -s EXTRA_EXPORTED_RUNTIME_METHODS=\"['ccall','cwrap','AsciiToString']\"")
endif()

add_executable(mgsc-js src/bridge.cpp)
target_link_libraries(mgsc-js mgsc)
set_target_properties(mgsc-js PROPERTIES OUTPUT_NAME libmgsc)

