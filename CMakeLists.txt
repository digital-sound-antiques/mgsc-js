cmake_minimum_required(VERSION 3.0)
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

set (linker_flag_list
  -Os
  -s SINGLE_FILE=1 
  -s FILESYSTEM=0 
  -s MODULARIZE=1 
  --memory-init-file 0 
  -s EXPORTED_FUNCTIONS=${exported_functions}
  -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,AsciiToString
#   -sSAFE_HEAP=1 
#   -sSTACK_OVERFLOW_CHECK=1
#   -sASSERTIONS
#   -sSTACK_SIZE=5mb
)

list(JOIN linker_flag_list " " linker_flags)

set(CMAKE_EXE_LINKER_FLAGS ${linker_flags})

add_executable(mgsc-js src/bridge.cpp)
target_link_libraries(mgsc-js mgsc)
set_target_properties(mgsc-js PROPERTIES OUTPUT_NAME libmgsc)
