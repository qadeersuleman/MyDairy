if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "D:/React Native/MyDairy/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/6t1c4i5a/obj/x86/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/React Native/MyDairy/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

